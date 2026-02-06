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
    // System Prompt with Two Phases: Investigation vs Diagnosis
    const systemPrompt = `You are SwasthAI, a healthcare assistant.
Your goal is to diagnose the user's health condition by asking specific questions.

PHASE 1: INVESTIGATION
If the user's symptoms are vague or you need more info (e.g. just said "I have a headache"):
- Ask ONE follow-up question to clarify the cause.
- Provide 4 MCQ options (A, B, C, D) for the user to choose.
- Format:
  ❓ QUESTION: [Your Question]
  OPTIONS:
  A) [Option A]
  B) [Option B]
  C) [Option C]
  D) [Option D]
- DO NOT provide a diagnosis, diet, or medicine recommendations in this phase.

PHASE 2: DIAGNOSIS
If you have sufficient information to identify the condition:
- Provide the final diagnosis and recommendations.
- USE THE FOLLOWING STRICT HEADERS (Keep headers in ENGLISH):

✅ ANSWER:
[Primary Diagnosis]

📋 EXPLANATION:
[Brief explanation]

🔍 POSSIBLE CONDITIONS:
[List]

⚠️ SEVERITY:
[Mild/Moderate/Severe]

💊 IMMEDIATE ACTIONS:
[List]

🥗 DIET RECOMMENDATIONS:
[List]

💊 MEDICINE RECOMMENDATIONS:
[List]

👨‍⚕️ SUGGESTED SPECIALISTS:
[List (MUST BE IN ENGLISH, e.g. Cardiologist, Dermatologist, General Physician)]

LANGUAGE constraint: Respond in ${languageName}.
CRITICAL EXCEPTION: YOU MUST KEEP THE HEADERS ABOVE (e.g. "🥗 DIET RECOMMENDATIONS:") EXACTLY IN ENGLISH, even if the rest of the response is in Hindi or Telugu.
ADDITIONALLY: The content of "SUGGESTED SPECIALISTS" MUST be in English script if possible. Do NOT translate specialist names.`;

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

    // Helper function to call Gemini API
    const callGeminiAPI = async (model: string) => {
      console.log(`Sending request to Gemini API (${model})...`);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
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
      return response;
    };

    // Primary Call: Gemini 2.5 Flash
    let response = await callGeminiAPI('gemini-2.5-flash');

    // Fallback Logic: If 503 (Overloaded) or 429 (Rate Limit), try Gemini 1.5 Flash
    if (!response.ok && (response.status === 503 || response.status === 429)) {
      console.warn(`Gemini 2.5 Flash failed with status ${response.status}. Retrying with Gemini 1.5 Flash...`);
      response = await callGeminiAPI('gemini-1.5-flash');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error details:", errorText);
      return new Response(
        JSON.stringify({
          error: "Gemini API Error",
          details: `Status: ${response.status}. Message: ${errorText}. Endpoint: v1beta/gemini`
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
      // Regex to extract sections between headers - Updated to support Multilingual Headers (Hindi/Telugu)
      // We use (?:...) for non-capturing groups so the content is always in capture group 1
      const conditionMatch = aiResponse.match(/(?:✅|🆗) (?:ANSWER|उत्तर|సమాధానం):\s*([^\n]+)/i) ||
        aiResponse.match(/(?:🔍|🔎) (?:POSSIBLE CONDITIONS|संभावित स्थितियाँ|సాధ్యమయ్యే పరిస్థితులు):([\s\S]*?)(?=⚠️|💊|🥗|$)/i);

      const suggestionsMatch = aiResponse.match(/💊 (?:IMMEDIATE ACTIONS|तुरंत कार्रवाई|తక్షణ చర్యలు):([\s\S]*?)(?=🥗|💊 (?:MEDICINE|दवा|మందుల)|👨‍⚕️|$)/i);

      const dietMatch = aiResponse.match(/🥗 (?:DIET RECOMMENDATIONS|आहार सुझाव|ఆహార సూచనలు):([\s\S]*?)(?=💊|👨‍⚕️|$)/i);

      const medicineMatch = aiResponse.match(/💊 (?:MEDICINE RECOMMENDATIONS|दवा सुझाव|మందుల సూచనలు):([\s\S]*?)(?=👨‍⚕️|$)/i);

      const specialistsMatch = aiResponse.match(/👨‍⚕️ (?:SUGGESTED SPECIALISTS|सुझाए गए विशेषज्ञ|సూచించిన నిపుణులు):([\s\S]*?)(?=$)/i);

      if (conditionMatch && (aiResponse.includes("POSSIBLE CONDITIONS") || aiResponse.includes("ANSWER") || aiResponse.includes("उत्तर") || aiResponse.includes("సమాధానం"))) {
        summary = {
          condition: conditionMatch[1].trim().replace(/^A\)\s*/, ""),
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