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
    const { documentContent, projectType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Analyzing document for project type:', projectType);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an IT project estimation expert. Analyze project requirements documents and extract estimation parameters. Return a JSON object with:
- suggestedScreens: number (estimated unique screens/pages)
- suggestedComplexity: "simple" | "medium" | "complex"
- suggestedFeatures: string[] (list of key features identified)
- summary: string (brief summary of the project scope)

Be precise and conservative in your estimates.`
          },
          {
            role: "user",
            content: `Analyze this ${projectType} project requirements document and extract estimation parameters:\n\n${documentContent}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_project_params",
              description: "Extract project estimation parameters from the document",
              parameters: {
                type: "object",
                properties: {
                  suggestedScreens: { type: "number", description: "Estimated number of unique screens/pages" },
                  suggestedComplexity: { type: "string", enum: ["simple", "medium", "complex"] },
                  suggestedFeatures: { type: "array", items: { type: "string" }, description: "List of key features" },
                  summary: { type: "string", description: "Brief summary of project scope" }
                },
                required: ["suggestedScreens", "suggestedComplexity", "suggestedFeatures", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_project_params" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted, please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));

    let analysis;
    if (data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      analysis = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
    } else {
      // Fallback if no tool call
      analysis = {
        suggestedScreens: 10,
        suggestedComplexity: "medium",
        suggestedFeatures: ["Feature extraction unavailable"],
        summary: "Document analyzed but structured extraction failed."
      };
    }

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error analyzing document:", error);
    const errorMessage = error instanceof Error ? error.message : "Analysis failed";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
