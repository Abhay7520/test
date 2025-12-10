import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, language } = await req.json();

    if (!image) {
      throw new Error('No image provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Processing blood pressure monitor image with AI vision...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'You are a medical blood pressure monitor reader. Look at this blood pressure monitor image and extract the readings. The display typically shows systolic (top number), diastolic (bottom number), and pulse/heart rate. Respond ONLY in this exact JSON format: {"systolic": number, "diastolic": number, "pulse": number}. If you cannot see clear readings, respond with: {"error": "Unable to read"}. Do not include any other text, only the JSON.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI vision error:', errorText);
      throw new Error('Failed to process image');
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content?.trim();

    console.log('AI response:', content);

    // Extract JSON from potential markdown code blocks
    if (content.includes('```')) {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        content = jsonMatch[1].trim();
      }
    }

    try {
      const bpData = JSON.parse(content);
      if (bpData.error) {
        return new Response(
          JSON.stringify({ error: bpData.error }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({
          systolic: bpData.systolic,
          diastolic: bpData.diastolic,
          pulse: bpData.pulse
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch {
      console.error('Failed to parse JSON:', content);
      throw new Error('Could not parse blood pressure reading');
    }

  } catch (error) {
    console.error('Error in detect-blood-pressure:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
