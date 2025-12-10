import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Function started");

    // Parse the request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request body", details: e instanceof Error ? e.message : String(e) }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, language, conversationHistory } = body;
    console.log("Request parsed. Language:", language);

    // Check API Key
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing from environment variables");
      return new Response(
        JSON.stringify({ error: "Configuration Error: GEMINI_API_KEY is missing on the server." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const languageMap: Record<string, string> = {
      'en': 'English',
      'hi': 'Hindi (हिन्दी)',
      'te': 'Telugu (తెలుగు)'
    };
    const languageName = languageMap[language] || 'English';

    // System Prompt with STRICT MCQ & Summary Formatting
    const systemPrompt = `You are SwasthAI, a healthcare assistant.

CRITICAL INSTRUCTION: Act as a QUIZ MASTER.
EVERY RESPONSE MUST BE IN STRICT MCQ FORMAT.

Headers MUST be exactly as below (REMAIN IN ENGLISH):

✅ ANSWER:
[Diagnosis]

📋 EXPLANATION:
[Details]

🔍 POSSIBLE CONDITIONS:
A)
B)
C)
D)

⚠️ SEVERITY:
[Mild/Moderate/Severe]

💊 IMMEDIATE ACTIONS:
A)
B)
C)
D)

🥗 DIET RECOMMENDATIONS:
[Details/List]

💊 MEDICINE RECOMMENDATIONS:
[Details/List]

👨‍⚕️ SUGGESTED SPECIALISTS:
[Details/List]

LANGUAGE: Respond ONLY in ${languageName}.
Ensure strictly 4 options (A,B,C,D) for lists.
EXCEPTION: Keep the HEADERS above in ENGLISH, even if the content is translated.`;

    const contents = [];

    // Add conversation history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: any) => {
        if (msg.role !== 'system') {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          });
        }
      });
    }

    // Add the current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    console.log("Sending request to Gemini API...");

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error details:", errorText);
      return new Response(
        JSON.stringify({
          error: "Gemini API Error",
          details: `Status: ${response.status}. Message: ${errorText}. Endpoint: v1beta/gemini-2.5-flash`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log("Gemini API response received");

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response.";

    // Logic to detect severity
    let severity = "simple";
    if (aiResponse.toLowerCase().includes("severity: emergency") || aiResponse.toLowerCase().includes("severity: severe")) {
      severity = "emergency";
    } else if (aiResponse.toLowerCase().includes("severity: moderate")) {
      severity = "moderate";
    }

    // Logic to parse Summary
    let summary = null;
    try {
      // Regex to extract sections between headers
      // We use [\s\S]*? to match multiline content non-greedily
      const conditionMatch = aiResponse.match(/✅ ANSWER:\s*([^\n]+)/i) || aiResponse.match(/POSSIBLE CONDITIONS:([\s\S]*?)(?=⚠️|💊|🥗|$)/i);
      const suggestionsMatch = aiResponse.match(/💊 IMMEDIATE ACTIONS:([\s\S]*?)(?=🥗|💊 MEDICINE|👨‍⚕️|$)/i);
      const dietMatch = aiResponse.match(/🥗 DIET RECOMMENDATIONS:([\s\S]*?)(?=💊|👨‍⚕️|$)/i);
      const medicineMatch = aiResponse.match(/💊 MEDICINE RECOMMENDATIONS:([\s\S]*?)(?=👨‍⚕️|$)/i);
      const specialistsMatch = aiResponse.match(/👨‍⚕️ SUGGESTED SPECIALISTS:([\s\S]*?)(?=$)/i);

      if (conditionMatch && (aiResponse.includes("POSSIBLE CONDITIONS") || aiResponse.includes("ANSWER"))) {
        summary = {
          condition: conditionMatch[1].trim().replace(/^A\)\s*/, ""), // Clean leading "A)" if matched from list
          severity: severity,
          suggestions: suggestionsMatch ? suggestionsMatch[1].trim() : "Follow general health advice.",
          recheckIn: severity === "emergency" ? "Immediately" : severity === "moderate" ? "2-3 days" : "1 week",
          diet: dietMatch ? dietMatch[1].trim() : undefined,
          medicine: medicineMatch ? medicineMatch[1].trim() : undefined,
          specialists: specialistsMatch ? specialistsMatch[1].trim() : undefined
        };
      }
    } catch (e) {
      console.error("Error parsing summary:", e);
    }

    return new Response(
      JSON.stringify({
        response: aiResponse,
        severity: severity,
        summary: summary
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error("Unexpected execution error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected execution error", details: err.message || String(err), stack: err.stack }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } // Return 200 so the frontend alert shows the message
    );
  }
});