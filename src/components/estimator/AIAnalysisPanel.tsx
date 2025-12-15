import { useState } from 'react';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectFormData, Platform, ExperienceLevel, AVAILABLE_TECHNOLOGIES } from '@/types/estimator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AIAnalysis {
  technologies: {
    frontend: string[];
    backend: string[];
    database: string[];
    cloud: string[];
  };
  complexity: 'simple' | 'medium' | 'complex';
  suggestedScreens: number;
  keyFeatures: string[];
  challenges: string[];
  recommendedExperience: ExperienceLevel;
  platforms: Platform[];
  estimatedWeeks: number;
  summary: string;
}

interface AIAnalysisPanelProps {
  description: string;
  projectType: string;
  onApplySuggestions: (updates: Partial<ProjectFormData>) => void;
}

export function AIAnalysisPanel({ description, projectType, onApplySuggestions }: AIAnalysisPanelProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeProject = async () => {
    if (!description || description.trim().length < 10) {
      toast.error('Please provide a project description first');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-project', {
        body: { description, projectType }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setAnalysis(data.analysis);
      toast.success('AI analysis complete!');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Analysis failed');
      toast.error(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const applySuggestions = () => {
    if (!analysis) return;

    // Map technologies to available ones
    const allTechs = Object.values(AVAILABLE_TECHNOLOGIES).flat();
    const suggestedTechs = [
      ...analysis.technologies.frontend,
      ...analysis.technologies.backend,
      ...analysis.technologies.database,
      ...analysis.technologies.cloud,
    ].filter(tech => allTechs.includes(tech));

    const updates: Partial<ProjectFormData> = {
      technologies: suggestedTechs,
      complexity: analysis.complexity,
      uniqueScreens: analysis.suggestedScreens,
      teamExperience: analysis.recommendedExperience,
      platforms: analysis.platforms.filter(p => ['web', 'android', 'ios', 'linux-server', 'cross-platform'].includes(p)) as Platform[],
    };

    onApplySuggestions(updates);
    toast.success('AI suggestions applied!');
  };

  if (!description || description.trim().length < 10) {
    return null;
  }

  return (
    <div className="p-4 border rounded-xl bg-muted/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-medium">AI Project Analysis</span>
        </div>
        <Button 
          onClick={analyzeProject} 
          disabled={analyzing}
          size="sm"
          variant="outline"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          <div className="p-3 bg-background rounded-lg border">
            <p className="text-sm text-muted-foreground">{analysis.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1">Complexity</p>
              <span className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                analysis.complexity === 'simple' && "bg-green-100 text-green-800",
                analysis.complexity === 'medium' && "bg-yellow-100 text-yellow-800",
                analysis.complexity === 'complex' && "bg-red-100 text-red-800"
              )}>
                {analysis.complexity}
              </span>
            </div>
            <div>
              <p className="font-medium mb-1">Est. Screens</p>
              <span className="text-primary font-bold">{analysis.suggestedScreens}</span>
            </div>
          </div>

          <div>
            <p className="font-medium text-sm mb-2">Suggested Technologies</p>
            <div className="flex flex-wrap gap-1">
              {[...analysis.technologies.frontend, ...analysis.technologies.backend, ...analysis.technologies.database].slice(0, 8).map((tech) => (
                <span key={tech} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium text-sm mb-2">Key Features</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {analysis.keyFeatures.slice(0, 4).map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-3 h-3 mt-1 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {analysis.challenges.length > 0 && (
            <div>
              <p className="font-medium text-sm mb-2">Potential Challenges</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {analysis.challenges.slice(0, 3).map((challenge, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <X className="w-3 h-3 mt-1 text-destructive" />
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={applySuggestions} className="w-full" size="sm">
            <Check className="w-4 h-4 mr-2" />
            Apply Suggestions
          </Button>
        </div>
      )}
    </div>
  );
}