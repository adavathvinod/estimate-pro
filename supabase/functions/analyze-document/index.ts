import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hourly rates for cost calculation
const HOURLY_RATES = {
  pm: 85,
  design: 75,
  frontend: 90,
  backend: 100,
  qa: 70,
  devops: 95,
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
            content: `You are an expert IT project estimator. Analyze project requirements documents and provide PRECISE time and cost estimates.

Your job is to:
1. Analyze the document thoroughly
2. Identify all features, screens, and technical requirements
3. Estimate hours needed for each development stage
4. Be conservative but realistic

Estimation guidelines per stage (adjust based on complexity):
- PM: 15-25% of total dev time
- Design: 2-4 hours per unique screen
- Frontend: 8-16 hours per screen depending on complexity
- Backend: 4-12 hours per API endpoint/feature
- QA: 20-30% of total dev time
- DevOps: 16-40 hours for setup + 10% of backend time

Consider:
- Simple project: multiply base by 0.7
- Medium project: use base estimates
- Complex project: multiply base by 1.5`
          },
          {
            role: "user",
            content: `Analyze this ${projectType} project requirements document and provide detailed time/cost estimates:\n\n${documentContent}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_project_estimate",
              description: "Extract detailed project estimation from the document",
              parameters: {
                type: "object",
                properties: {
                  suggestedScreens: { 
                    type: "number", 
                    description: "Estimated number of unique screens/pages" 
                  },
                  suggestedComplexity: { 
                    type: "string", 
                    enum: ["simple", "medium", "complex"],
                    description: "Overall project complexity"
                  },
                  suggestedFeatures: { 
                    type: "array", 
                    items: { type: "string" }, 
                    description: "List of key features identified" 
                  },
                  summary: { 
                    type: "string", 
                    description: "Brief summary of project scope" 
                  },
                  breakdown: {
                    type: "object",
                    description: "Hours breakdown by stage",
                    properties: {
                      pm: { type: "number", description: "PM hours" },
                      design: { type: "number", description: "Design hours" },
                      frontend: { type: "number", description: "Frontend hours" },
                      backend: { type: "number", description: "Backend hours" },
                      qa: { type: "number", description: "QA hours" },
                      devops: { type: "number", description: "DevOps hours" }
                    },
                    required: ["pm", "design", "frontend", "backend", "qa", "devops"]
                  }
                },
                required: ["suggestedScreens", "suggestedComplexity", "suggestedFeatures", "summary", "breakdown"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_project_estimate" } }
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
      const parsed = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
      
      // Calculate totals from breakdown
      const breakdown = parsed.breakdown || {
        pm: 40,
        design: parsed.suggestedScreens * 3,
        frontend: parsed.suggestedScreens * 12,
        backend: parsed.suggestedScreens * 8,
        qa: 40,
        devops: 24
      };
      
      const totalHours = breakdown.pm + breakdown.design + breakdown.frontend + breakdown.backend + breakdown.qa + breakdown.devops;
      const totalWeeks = Math.ceil(totalHours / 40); // 40 hours per week
      
      // Calculate cost
      const totalCost = 
        (breakdown.pm * HOURLY_RATES.pm) +
        (breakdown.design * HOURLY_RATES.design) +
        (breakdown.frontend * HOURLY_RATES.frontend) +
        (breakdown.backend * HOURLY_RATES.backend) +
        (breakdown.qa * HOURLY_RATES.qa) +
        (breakdown.devops * HOURLY_RATES.devops);
      
      analysis = {
        suggestedScreens: parsed.suggestedScreens,
        suggestedComplexity: parsed.suggestedComplexity,
        suggestedFeatures: parsed.suggestedFeatures,
        summary: parsed.summary,
        estimatedHours: totalHours,
        estimatedWeeks: totalWeeks,
        estimatedCost: Math.round(totalCost),
        breakdown
      };
    } else {
      // Fallback estimates
      analysis = {
        suggestedScreens: 10,
        suggestedComplexity: "medium",
        suggestedFeatures: ["Feature extraction unavailable"],
        summary: "Document analyzed but structured extraction failed.",
        estimatedHours: 400,
        estimatedWeeks: 10,
        estimatedCost: 35000,
        breakdown: {
          pm: 40,
          design: 60,
          frontend: 120,
          backend: 100,
          qa: 50,
          devops: 30
        }
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
