import { FileText, Briefcase, Gauge, Upload, Clock, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VoiceInput } from '../VoiceInput';
import { AIAnalysisPanel } from '../AIAnalysisPanel';
import { FileUpload } from '../FileUpload';
import { ProjectFormData, ProjectType, ComplexityLevel, ProjectStage, DocumentAnalysis } from '@/types/estimator';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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
  const [documentAnalysis, setDocumentAnalysis] = useState<DocumentAnalysis | null>(null);

  const handleVoiceTranscript = (text: string) => {
    onChange({ 
      voiceDescription: (data.voiceDescription || '') + ' ' + text 
    });
  };

  const handleAISuggestions = (updates: Partial<ProjectFormData>) => {
    onChange(updates);
  };

  const handleAnalysisComplete = (analysis: DocumentAnalysis) => {
    setDocumentAnalysis(analysis);
    // Auto-apply suggested values
    onChange({
      uniqueScreens: analysis.suggestedScreens,
      complexity: analysis.suggestedComplexity,
    });
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

      {/* Project Stage */}
      <div>
        <label className="text-sm font-medium mb-3 block">Project Stage</label>
        <div className="grid grid-cols-2 gap-3">
          {PROJECT_STAGES.map(({ value, label, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                onChange({ projectStage: value });
                if (value === 'pre-idea') setDocumentAnalysis(null);
              }}
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

      {/* Document Upload for Documented Stage */}
      {data.projectStage === 'documented' && (
        <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">AI Document Analysis</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Upload your PRD or requirements document for AI-powered time and cost analysis
          </p>
          
          <FileUpload
            documents={data.uploadedDocuments || []}
            projectType={data.projectType}
            onDocumentsChange={(docs) => onChange({ uploadedDocuments: docs })}
            onAnalysisComplete={handleAnalysisComplete}
          />

          {/* Analysis Results */}
          {documentAnalysis && (
            <div className="mt-6 p-4 bg-card rounded-xl border border-border">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Estimate Results
              </h4>
              
              {/* Main Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-primary/10 rounded-xl text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{documentAnalysis.estimatedWeeks}</p>
                  <p className="text-sm text-muted-foreground">Weeks</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-xl text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{documentAnalysis.estimatedHours}</p>
                  <p className="text-sm text-muted-foreground">Hours</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-xl text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">${documentAnalysis.estimatedCost.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Estimated Cost</p>
                </div>
              </div>

              {/* Hours Breakdown */}
              {documentAnalysis.breakdown && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium mb-3">Hours Breakdown by Stage</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(documentAnalysis.breakdown).map(([stage, hours]) => (
                      <div key={stage} className="flex justify-between p-2 bg-muted/50 rounded-lg text-sm">
                        <span className="capitalize text-muted-foreground">{stage}</span>
                        <span className="font-medium">{hours}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">{documentAnalysis.summary}</p>
              </div>

              {/* Features */}
              {documentAnalysis.suggestedFeatures.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">Identified Features</h5>
                  <div className="flex flex-wrap gap-2">
                    {documentAnalysis.suggestedFeatures.map((feature, i) => (
                      <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Voice Input - Only show for pre-idea stage */}
      {data.projectStage === 'pre-idea' && (
        <>
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
        </>
      )}

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