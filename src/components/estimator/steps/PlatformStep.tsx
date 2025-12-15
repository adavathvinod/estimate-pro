import { Globe, Smartphone, Apple, Server, Layers } from 'lucide-react';
import { StepCard } from '../StepCard';
import { FormField } from '../FormField';
import { SelectionCard } from '../SelectionCard';
import { ProjectFormData, Platform, ComplexityLevel } from '@/types/estimator';
import { cn } from '@/lib/utils';

interface PlatformStepProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
}

const platforms: { platform: Platform; icon: typeof Globe; title: string; description: string }[] = [
  { platform: 'web', icon: Globe, title: 'Web / Desktop', description: 'Browser-based application accessible from any device' },
  { platform: 'android', icon: Smartphone, title: 'Android (Play Store)', description: 'Native Android app for Google Play Store' },
  { platform: 'ios', icon: Apple, title: 'iOS (App Store)', description: 'Native iOS app for Apple App Store' },
  { platform: 'linux-server', icon: Server, title: 'Linux / Server', description: 'Server-side deployment, APIs, or backend services' },
  { platform: 'cross-platform', icon: Layers, title: 'Cross-Platform', description: 'Deploy to multiple platforms (Web + Mobile)' },
];

const complexityLevels: { level: ComplexityLevel; title: string; description: string; time: string }[] = [
  { level: 'simple', title: 'Simple', description: 'Basic features, standard flows', time: '~70% of base time' },
  { level: 'medium', title: 'Medium', description: 'Moderate complexity, some custom logic', time: 'Base time' },
  { level: 'complex', title: 'Complex', description: 'Advanced features, integrations, scale', time: '~150% of base time' },
];

export function PlatformStep({ data, onChange }: PlatformStepProps) {
  return (
    <StepCard
      title="Platform & Complexity"
      description="Choose your deployment target and overall complexity"
      icon={<Layers className="w-6 h-6" />}
    >
      <FormField label="Deployment Platform" tooltip="Where will your application be deployed?">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {platforms.map(({ platform, icon: Icon, title, description }) => (
            <SelectionCard
              key={platform}
              icon={<Icon className="w-5 h-5" />}
              title={title}
              description={description}
              selected={data.platform === platform}
              onClick={() => onChange({ platform })}
            />
          ))}
        </div>
      </FormField>

      <FormField label="Project Complexity" tooltip="This affects time estimates across all stages">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {complexityLevels.map(({ level, title, description, time }) => (
            <button
              key={level}
              onClick={() => onChange({ complexity: level })}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all duration-200",
                "hover:shadow-card-hover",
                data.complexity === level
                  ? "border-primary bg-secondary"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <h3 className={cn(
                "font-semibold",
                data.complexity === level ? "text-primary" : "text-foreground"
              )}>
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
              <p className="text-xs text-primary font-medium mt-2">{time}</p>
            </button>
          ))}
        </div>
      </FormField>
    </StepCard>
  );
}
