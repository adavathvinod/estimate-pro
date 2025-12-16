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

// Experience multipliers
const EXPERIENCE_MULTIPLIERS = {
  junior: 1.4,
  mid: 1.1,
  senior: 1.0,
  lead: 0.9,
  architect: 0.85,
};

// Platform overhead multipliers
const PLATFORM_OVERHEAD = {
  web: 1.0,
  android: 1.15,
  ios: 1.2,
  'linux-server': 1.1,
  'cross-platform': 1.35,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentContent, projectType, experienceLevel = 'mid', platforms = ['web'] } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Analyzing document for project type:', projectType);
    console.log('Document length:', documentContent?.length || 0, 'characters');

    // Calculate platform multiplier
    const platformMultiplier = platforms.reduce((acc: number, p: string) => {
      return Math.max(acc, PLATFORM_OVERHEAD[p as keyof typeof PLATFORM_OVERHEAD] || 1.0);
    }, 1.0);

    const experienceMultiplier = EXPERIENCE_MULTIPLIERS[experienceLevel as keyof typeof EXPERIENCE_MULTIPLIERS] || 1.1;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `You are an EXPERT IT Project Estimator with 15+ years of experience in software development estimation. Your task is to perform DEEP REGRESSION ANALYSIS on project documentation to generate HIGHLY ACCURATE time and cost estimates.

## CORE ESTIMATION METHODOLOGY:

### 1. Document Analysis Protocol:
- Identify ALL screens, pages, and UI components explicitly or implicitly mentioned
- Extract EVERY feature, user story, and functional requirement
- Categorize complexity of each feature (simple/medium/complex)
- Identify all API integrations, third-party services, and external dependencies
- Assess security requirements (authentication, authorization, data protection)
- Note any performance requirements, scalability needs, or technical constraints

### 2. Estimation Baseline (per component):
**Screens/Pages:**
- Simple (static, 1-2 components): 6-8 hours
- Medium (forms, lists, interactions): 12-20 hours  
- Complex (dashboards, real-time, rich interactions): 24-40 hours

**API Endpoints:**
- Simple CRUD: 4-6 hours each
- Medium (validation, business logic): 8-12 hours each
- Complex (integrations, transactions): 16-24 hours each

**Features:**
- Authentication system: 24-40 hours
- Payment integration: 32-48 hours
- Real-time features: 24-40 hours
- File upload/processing: 16-24 hours
- Search functionality: 12-24 hours
- Reporting/Analytics: 24-48 hours

### 3. Stage Distribution:
- PM: 12-18% of total development time
- Design: 15-20% of frontend time
- Frontend: Based on screen complexity calculations
- Backend: Based on API and business logic requirements
- QA: 20-30% of total dev time
- DevOps: 16-32 base hours + 8% of backend time

### 4. Confidence Score Calculation:
- 90-100%: Detailed requirements, clear scope, similar to past projects
- 75-89%: Good requirements with some ambiguity
- 60-74%: High-level requirements, multiple assumptions needed
- Below 60%: Insufficient detail, high uncertainty

### 5. Risk Assessment:
- Identify technical risks
- Note dependencies and blockers
- List assumptions made during estimation

CRITICAL: Be PRECISE and CONSERVATIVE. It's better to overestimate than underdeliver.`
          },
          {
            role: "user",
            content: `Analyze this ${projectType} project document THOROUGHLY and provide detailed estimates.

DOCUMENT CONTENT:
${documentContent}

CONTEXT:
- Team Experience Level: ${experienceLevel}
- Target Platforms: ${platforms.join(', ')}
- Platform Complexity Multiplier: ${platformMultiplier.toFixed(2)}x
- Experience Adjustment: ${experienceMultiplier.toFixed(2)}x

Provide a comprehensive analysis with accurate time/cost estimates.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_project_estimate",
              description: "Extract detailed, accurate project estimation from the document with confidence scoring",
              parameters: {
                type: "object",
                properties: {
                  suggestedScreens: { 
                    type: "number", 
                    description: "EXACT count of unique screens/pages identified in the document" 
                  },
                  suggestedComplexity: { 
                    type: "string", 
                    enum: ["simple", "medium", "complex"],
                    description: "Overall project complexity based on features and requirements"
                  },
                  suggestedFeatures: { 
                    type: "array", 
                    items: { type: "string" }, 
                    description: "Complete list of all features and requirements identified" 
                  },
                  summary: { 
                    type: "string", 
                    description: "Comprehensive summary of project scope and objectives (2-3 sentences)" 
                  },
                  confidenceScore: {
                    type: "number",
                    description: "Confidence level 0-100 based on document clarity and detail"
                  },
                  confidenceReason: {
                    type: "string",
                    description: "Explanation for the confidence score"
                  },
                  breakdown: {
                    type: "object",
                    description: "PRECISE hours breakdown by development stage",
                    properties: {
                      pm: { type: "number", description: "Project Management hours" },
                      design: { type: "number", description: "UI/UX Design hours" },
                      frontend: { type: "number", description: "Frontend Development hours" },
                      backend: { type: "number", description: "Backend Development hours" },
                      qa: { type: "number", description: "Quality Assurance hours" },
                      devops: { type: "number", description: "DevOps & Deployment hours" }
                    },
                    required: ["pm", "design", "frontend", "backend", "qa", "devops"]
                  },
                  technicalRequirements: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of technical requirements and integrations needed"
                  },
                  risks: {
                    type: "array",
                    items: { type: "string" },
                    description: "Identified project risks and challenges"
                  },
                  assumptions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Assumptions made during estimation"
                  }
                },
                required: ["suggestedScreens", "suggestedComplexity", "suggestedFeatures", "summary", "confidenceScore", "confidenceReason", "breakdown", "technicalRequirements", "risks", "assumptions"],
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
    console.log('AI response received');

    let analysis;
    if (data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      const parsed = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
      
      // Get breakdown with defaults
      const breakdown = parsed.breakdown || {
        pm: 40,
        design: parsed.suggestedScreens * 4,
        frontend: parsed.suggestedScreens * 16,
        backend: parsed.suggestedScreens * 10,
        qa: 48,
        devops: 32
      };
      
      // Apply multipliers
      const adjustedBreakdown = {
        pm: Math.round(breakdown.pm * experienceMultiplier),
        design: Math.round(breakdown.design * experienceMultiplier),
        frontend: Math.round(breakdown.frontend * experienceMultiplier * platformMultiplier),
        backend: Math.round(breakdown.backend * experienceMultiplier),
        qa: Math.round(breakdown.qa * experienceMultiplier * platformMultiplier),
        devops: Math.round(breakdown.devops * platformMultiplier)
      };
      
      const totalHours = Object.values(adjustedBreakdown).reduce((a, b) => a + b, 0);
      const totalWeeks = Math.ceil(totalHours / 40);
      
      // Calculate cost with hourly rates
      const totalCost = 
        (adjustedBreakdown.pm * HOURLY_RATES.pm) +
        (adjustedBreakdown.design * HOURLY_RATES.design) +
        (adjustedBreakdown.frontend * HOURLY_RATES.frontend) +
        (adjustedBreakdown.backend * HOURLY_RATES.backend) +
        (adjustedBreakdown.qa * HOURLY_RATES.qa) +
        (adjustedBreakdown.devops * HOURLY_RATES.devops);
      
      analysis = {
        suggestedScreens: parsed.suggestedScreens,
        suggestedComplexity: parsed.suggestedComplexity,
        suggestedFeatures: parsed.suggestedFeatures || [],
        summary: parsed.summary,
        confidenceScore: Math.min(100, Math.max(0, parsed.confidenceScore || 70)),
        confidenceReason: parsed.confidenceReason || "Analysis completed with standard confidence.",
        estimatedHours: totalHours,
        estimatedWeeks: totalWeeks,
        estimatedCost: Math.round(totalCost),
        breakdown: adjustedBreakdown,
        technicalRequirements: parsed.technicalRequirements || [],
        risks: parsed.risks || [],
        assumptions: parsed.assumptions || [],
        analyzedAt: new Date().toISOString(),
      };
    } else {
      // Fallback estimates
      analysis = {
        suggestedScreens: 10,
        suggestedComplexity: "medium",
        suggestedFeatures: ["Unable to extract specific features"],
        summary: "Document analyzed but structured extraction was limited. Manual review recommended.",
        confidenceScore: 45,
        confidenceReason: "Limited confidence due to extraction difficulties. Please verify estimates manually.",
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
        },
        technicalRequirements: ["Review document manually for technical requirements"],
        risks: ["Low confidence estimate - verify requirements"],
        assumptions: ["Standard project assumptions applied"],
        analyzedAt: new Date().toISOString(),
      };
    }

    console.log('Analysis complete:', {
      screens: analysis.suggestedScreens,
      complexity: analysis.suggestedComplexity,
      confidence: analysis.confidenceScore,
      hours: analysis.estimatedHours
    });

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
