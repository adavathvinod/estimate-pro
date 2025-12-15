import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectType, platform, complexity, totalHours } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Finding historical matches for:', { projectType, platform, complexity });

    // Find similar historical projects
    const { data: historicalProjects, error } = await supabase
      .from('project_estimates')
      .select('*')
      .eq('project_type', projectType)
      .eq('platform', platform)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    if (!historicalProjects || historicalProjects.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        match: null,
        message: "No historical data available yet. Your estimate will help improve future predictions."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate similarity and find best match
    let bestMatch = null;
    let bestSimilarity = 0;

    for (const project of historicalProjects) {
      let similarity = 0;
      
      // Same project type: +40%
      if (project.project_type === projectType) similarity += 40;
      
      // Same platform: +30%
      if (project.platform === platform) similarity += 30;
      
      // Same complexity: +20%
      if (project.complexity === complexity) similarity += 20;
      
      // Similar hours (within 20%): +10%
      const hoursDiff = Math.abs(project.total_hours - totalHours) / totalHours;
      if (hoursDiff < 0.2) similarity += 10;

      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = project;
      }
    }

    if (bestMatch && bestSimilarity >= 60) {
      // Calculate adjusted estimate based on historical data
      const historicalAccuracy = bestMatch.total_hours / totalHours;
      const adjustedHours = Math.round(totalHours * (1 + (historicalAccuracy - 1) * 0.3));

      return new Response(JSON.stringify({
        success: true,
        match: {
          projectName: bestMatch.project_name,
          accuracy: bestSimilarity,
          adjustedHours,
          originalHours: bestMatch.total_hours,
          suggestion: `Based on similar project "${bestMatch.project_name}", we suggest ${adjustedHours > totalHours ? 'increasing' : 'decreasing'} your estimate by ${Math.abs(adjustedHours - totalHours)} hours.`
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      match: null,
      message: "No closely matching historical projects found."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error finding historical match:", error);
    const errorMessage = error instanceof Error ? error.message : "Match search failed";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
