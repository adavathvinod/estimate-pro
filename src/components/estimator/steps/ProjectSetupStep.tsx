import { Globe, Smartphone, Monitor, Server, Layout, FileText, Lightbulb } from 'lucide-react';
import { StepCard } from '../StepCard';
import { FormField } from '../FormField';
import { SelectionCard } from '../SelectionCard';
import { Input } from '@/components/ui/input';
import { ProjectFormData, ProjectType, ProjectStage } from '@/types/estimator';

interface ProjectSetupStepProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
}

const projectTypes: { type: ProjectType; icon: typeof Globe; title: string; description: string }[] = [
  { type: 'website', icon: Globe, title: 'Website', description: 'Marketing sites, blogs, portfolios, landing pages' },
  { type: 'web-app', icon: Layout, title: 'Web Application', description: 'SaaS platforms, dashboards, enterprise tools' },
  { type: 'mobile-app', icon: Smartphone, title: 'Mobile App', description: 'iOS, Android, or cross-platform applications' },
  { type: 'it-service', icon: Server, title: 'IT Service', description: 'APIs, integrations, infrastructure, DevOps' },
];

const projectStages: { stage: ProjectStage; icon: typeof Lightbulb; title: string; description: string }[] = [
  { stage: 'pre-idea', icon: Lightbulb, title: 'Pre-Idea Stage', description: 'High-level concept, no detailed documentation yet' },
  { stage: 'documented', icon: FileText, title: 'Documented Idea', description: 'Detailed requirements, wireframes, or specifications available' },
];

export function ProjectSetupStep({ data, onChange }: ProjectSetupStepProps) {
  return (
    <StepCard
      title="Project Setup"
      description="Tell us about your project to get started"
      icon={<Monitor className="w-6 h-6" />}
    >
      <FormField label="Project Name" tooltip="Give your project a memorable name">
        <Input
          value={data.projectName}
          onChange={(e) => onChange({ projectName: e.target.value })}
          placeholder="Enter project name..."
          className="h-12"
        />
      </FormField>

      <FormField label="Project Type" tooltip="Select the type of solution you're building">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projectTypes.map(({ type, icon: Icon, title, description }) => (
            <SelectionCard
              key={type}
              icon={<Icon className="w-5 h-5" />}
              title={title}
              description={description}
              selected={data.projectType === type}
              onClick={() => onChange({ projectType: type })}
            />
          ))}
        </div>
      </FormField>

      <FormField label="Project Stage" tooltip="How detailed is your project documentation?">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projectStages.map(({ stage, icon: Icon, title, description }) => (
            <SelectionCard
              key={stage}
              icon={<Icon className="w-5 h-5" />}
              title={title}
              description={description}
              selected={data.projectStage === stage}
              onClick={() => onChange({ projectStage: stage })}
            />
          ))}
        </div>
      </FormField>
    </StepCard>
  );
}
