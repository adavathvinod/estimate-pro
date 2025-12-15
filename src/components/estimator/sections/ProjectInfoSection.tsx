import { FileText, Briefcase, Gauge } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VoiceInput } from '../VoiceInput';
import { AIAnalysisPanel } from '../AIAnalysisPanel';
import { ProjectFormData, ProjectType, ComplexityLevel, ProjectStage } from '@/types/estimator';
import { cn } from '@/lib/utils';

interface ProjectInfoSectionProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
}

const PROJECT_TYPES: { value: ProjectType; label: string; description: string }[] = [
  { value: 'website', label: 'Website', description: 'Marketing/info site' },
  { value: 'web-app', label: 'Web App', description: 'Interactive application' },
  { value: 'mobile-app', label: 'Mobile App', description: 'Native/hybrid app' },
  { value: 'it-service', label: 'IT Service', description: 'Backend service' },
];

const PROJECT_STAGES: { value: ProjectStage; label: string; description: string }[] = [
  { value: 'pre-idea', label: 'Pre-Idea', description: 'Early concept phase' },
  { value: 'documented', label: 'Documented', description: 'Has requirements docs' },
];

const COMPLEXITY_LEVELS: { value: ComplexityLevel; label: string; multiplier: string }[] = [
  { value: 'simple', label: 'Simple', multiplier: '0.7x' },
  { value: 'medium', label: 'Medium', multiplier: '1.0x' },
  { value: 'complex', label: 'Complex', multiplier: '1.5x' },
];

export function ProjectInfoSection({ data, onChange }: ProjectInfoSectionProps) {
  const handleVoiceTranscript = (text: string) => {
    onChange({ 
      voiceDescription: (data.voiceDescription || '') + ' ' + text 
    });
  };

  const handleAISuggestions = (updates: Partial<ProjectFormData>) => {
    onChange(updates);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Project Information</h3>
          <p className="text-sm text-muted-foreground">Tell us about your project</p>
        </div>
      </div>

      {/* Project Name */}
      <div>
        <label className="text-sm font-medium mb-2 block">Project Name *</label>
        <Input
          value={data.projectName}
          onChange={(e) => onChange({ projectName: e.target.value })}
          placeholder="Enter project name"
          className="text-lg"
        />
      </div>

      {/* Voice Input */}
      <div className="p-4 border rounded-xl bg-muted/30">
        <label className="text-sm font-medium mb-3 block">Describe Your Project (Voice or Type)</label>
        <VoiceInput onTranscript={handleVoiceTranscript} className="mb-4" />
        <Textarea
          value={data.voiceDescription || ''}
          onChange={(e) => onChange({ voiceDescription: e.target.value })}
          placeholder="Type or speak your project description..."
          className="min-h-[100px]"
        />
      </div>

      {/* AI Analysis Panel */}
      <AIAnalysisPanel 
        description={data.voiceDescription || ''} 
        projectType={data.projectType}
        onApplySuggestions={handleAISuggestions}
      />

      {/* Project Stage */}
      <div>
        <label className="text-sm font-medium mb-3 block">Project Stage</label>
        <div className="grid grid-cols-2 gap-3">
          {PROJECT_STAGES.map(({ value, label, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ projectStage: value })}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
                data.projectStage === value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Project Type */}
      <div>
        <label className="text-sm font-medium mb-3 block flex items-center gap-2">
          <Briefcase className="w-4 h-4" /> Project Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PROJECT_TYPES.map(({ value, label, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ projectType: value })}
              className={cn(
                "p-4 rounded-xl border-2 text-center transition-all hover:shadow-md",
                data.projectType === value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Complexity */}
      <div>
        <label className="text-sm font-medium mb-3 block flex items-center gap-2">
          <Gauge className="w-4 h-4" /> Complexity Level
        </label>
        <div className="grid grid-cols-3 gap-3">
          {COMPLEXITY_LEVELS.map(({ value, label, multiplier }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ complexity: value })}
              className={cn(
                "p-4 rounded-xl border-2 text-center transition-all hover:shadow-md",
                data.complexity === value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <p className="font-medium">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">{multiplier}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}