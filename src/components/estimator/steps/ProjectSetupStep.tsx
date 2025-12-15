import { Globe, Smartphone, Monitor, Server, Layout, FileText, Lightbulb, Sparkles } from 'lucide-react';
import { StepCard } from '../StepCard';
import { FormField } from '../FormField';
import { SelectionCard } from '../SelectionCard';
import { FileUpload } from '../FileUpload';
import { Input } from '@/components/ui/input';
import { ProjectFormData, ProjectType, ProjectStage, DocumentAnalysis } from '@/types/estimator';
import { toast } from 'sonner';

interface ProjectSetupStepProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
}

const projectTypes: { type: ProjectType; icon: typeof Globe; title: string; description: string }[] = [
  { type: 'website', icon: Globe, title: 'Website', description: 'Marketing sites, blogs, portfolios' },
  { type: 'web-app', icon: Layout, title: 'Web Application', description: 'SaaS platforms, dashboards' },
  { type: 'mobile-app', icon: Smartphone, title: 'Mobile App', description: 'iOS, Android apps' },
  { type: 'it-service', icon: Server, title: 'IT Service', description: 'APIs, integrations, DevOps' },
];

const projectStages: { stage: ProjectStage; icon: typeof Lightbulb; title: string; description: string }[] = [
  { stage: 'pre-idea', icon: Lightbulb, title: 'Pre-Idea Stage', description: 'High-level concept only' },
  { stage: 'documented', icon: FileText, title: 'Documented Idea', description: 'Upload PRD for AI analysis' },
];

export function ProjectSetupStep({ data, onChange }: ProjectSetupStepProps) {
  const handleAnalysisComplete = (analysis: DocumentAnalysis) => {
    toast.success('AI analyzed your document!');
    onChange({
      uniqueScreens: analysis.suggestedScreens,
      complexity: analysis.suggestedComplexity,
    });
  };

  return (
    <StepCard title="Project Setup" description="Tell us about your project to get started" icon={<Monitor className="w-6 h-6" />}>
      <FormField label="Project Name" tooltip="Give your project a memorable name">
        <Input value={data.projectName} onChange={(e) => onChange({ projectName: e.target.value })} placeholder="Enter project name..." className="h-12" />
      </FormField>

      <FormField label="Project Type" tooltip="Select the type of solution you're building">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projectTypes.map(({ type, icon: Icon, title, description }) => (
            <SelectionCard key={type} icon={<Icon className="w-5 h-5" />} title={title} description={description} selected={data.projectType === type} onClick={() => onChange({ projectType: type })} />
          ))}
        </div>
      </FormField>

      <FormField label="Project Stage" tooltip="How detailed is your project documentation?">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projectStages.map(({ stage, icon: Icon, title, description }) => (
            <SelectionCard key={stage} icon={<Icon className="w-5 h-5" />} title={title} description={description} selected={data.projectStage === stage} onClick={() => onChange({ projectStage: stage })} />
          ))}
        </div>
      </FormField>

      {data.projectStage === 'documented' && (
        <FormField label="Upload Requirements Documents" tooltip="Upload PRDs, specs, or requirements for AI analysis">
          <div className="p-1 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20">
            <div className="bg-card rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3 text-primary">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered Document Analysis</span>
              </div>
              <FileUpload
                documents={data.uploadedDocuments || []}
                projectType={data.projectType}
                onDocumentsChange={(docs) => onChange({ uploadedDocuments: docs })}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </div>
          </div>
        </FormField>
      )}
    </StepCard>
  );
}
