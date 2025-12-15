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
    const { description, projectType } = await req.json();
    
    if (!description || description.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Please provide a more detailed project description' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing project description:', description.substring(0, 100));

    const systemPrompt = `You are an expert IT project analyst. Analyze the project description and provide structured recommendations.

Based on the description, analyze and suggest:
1. Recommended technologies (frontend, backend, database, cloud)
2. Complexity level (simple, medium, complex)
3. Estimated number of unique screens/pages
4. Key features to consider
5. Potential challenges
6. Suggested team experience level

Return your analysis as a JSON object with this exact structure:
{
  "technologies": {
    "frontend": ["React", "TypeScript"],
    "backend": ["Node.js"],
    "database": ["PostgreSQL"],
    "cloud": ["AWS"]
  },
  "complexity": "medium",
  "suggestedScreens": 15,
  "keyFeatures": ["Feature 1", "Feature 2"],
  "challenges": ["Challenge 1"],
  "recommendedExperience": "mid",
  "platforms": ["web"],
  "estimatedWeeks": 12,
  "summary": "Brief summary of the analysis"
}

Only return valid JSON, no markdown or explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Project Type: ${projectType || 'web-app'}\n\nProject Description:\n${description}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No analysis content received');
    }

    console.log('AI analysis complete');

    // Parse JSON from response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Return a default analysis
      analysis = {
        technologies: { frontend: ['React', 'TypeScript'], backend: ['Node.js'], database: ['PostgreSQL'], cloud: ['AWS'] },
        complexity: 'medium',
        suggestedScreens: 10,
        keyFeatures: ['Core functionality based on description'],
        challenges: ['Scope definition needed'],
        recommendedExperience: 'mid',
        platforms: ['web'],
        estimatedWeeks: 8,
        summary: 'Please provide more details for accurate analysis.'
      };
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    console.error('Error in analyze-project function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});