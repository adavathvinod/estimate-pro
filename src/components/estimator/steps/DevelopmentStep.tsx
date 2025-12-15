import { Code, Database, Sparkles, Link, Shield, HardDrive } from 'lucide-react';
import { StepCard } from '../StepCard';
import { FormField } from '../FormField';
import { SelectionCard } from '../SelectionCard';
import { Slider } from '@/components/ui/slider';
import { ProjectFormData, STAGE_PERSONNEL, ComplexityLevel } from '@/types/estimator';
import { cn } from '@/lib/utils';

interface DevelopmentStepProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
}

const animationOptions = [
  { value: 'none', title: 'None', description: 'Static UI' },
  { value: 'simple', title: 'Simple', description: 'Basic transitions' },
  { value: 'advanced', title: 'Advanced', description: 'Complex animations' },
] as const;

const securityOptions = [
  { value: 'basic', title: 'Basic', description: 'Standard auth' },
  { value: 'standard', title: 'Standard', description: 'Role-based access' },
  { value: 'enterprise', title: 'Enterprise', description: 'Full compliance' },
] as const;

const databaseOptions = [
  { value: 'small', title: 'Small', description: '<10K records' },
  { value: 'medium', title: 'Medium', description: '10K-1M records' },
  { value: 'enterprise', title: 'Enterprise', description: '1M+ records' },
] as const;

export function DevelopmentStep({ data, onChange }: DevelopmentStepProps) {
  return (
    <div className="space-y-6">
      <StepCard
        title="Frontend Development"
        description="UI implementation and client-side features"
        icon={<Code className="w-6 h-6" />}
        stageColor="bg-stage-frontend"
      >
        <div className="bg-secondary/50 rounded-lg p-4 text-sm">
          <div className="flex items-center gap-2 text-secondary-foreground">
            <Code className="w-4 h-4" />
            <span className="font-medium">Personnel:</span>
            <span>{STAGE_PERSONNEL.frontend.count} Frontend Devs, {STAGE_PERSONNEL.frontend.experience}</span>
          </div>
          <div className="mt-2 text-muted-foreground">
            Tools: {STAGE_PERSONNEL.frontend.tools.join(', ')}
          </div>
        </div>

        <FormField label="Animation Level" tooltip="Complexity of UI animations and transitions">
          <div className="grid grid-cols-3 gap-3">
            {animationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onChange({ animationLevel: option.value })}
                className={cn(
                  "p-3 rounded-lg border-2 text-center transition-all",
                  data.animationLevel === option.value
                    ? "border-primary bg-secondary"
                    : "border-border hover:border-primary/30"
                )}
              >
                <Sparkles className={cn(
                  "w-5 h-5 mx-auto mb-1",
                  data.animationLevel === option.value ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="font-medium text-sm">{option.title}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </button>
            ))}
          </div>
        </FormField>

        <FormField 
          label={`API Integrations: ${data.apiIntegrations}`}
          tooltip="Number of external API connections"
        >
          <Slider
            value={[data.apiIntegrations]}
            onValueChange={([value]) => onChange({ apiIntegrations: value })}
            min={0}
            max={15}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>15+</span>
          </div>
        </FormField>
      </StepCard>

      <StepCard
        title="Backend Development"
        description="Server-side logic and database architecture"
        icon={<Database className="w-6 h-6" />}
        stageColor="bg-stage-backend"
      >
        <div className="bg-secondary/50 rounded-lg p-4 text-sm">
          <div className="flex items-center gap-2 text-secondary-foreground">
            <Database className="w-4 h-4" />
            <span className="font-medium">Personnel:</span>
            <span>{STAGE_PERSONNEL.backend.count} Backend Devs, {STAGE_PERSONNEL.backend.experience}</span>
          </div>
          <div className="mt-2 text-muted-foreground">
            Tools: {STAGE_PERSONNEL.backend.tools.join(', ')}
          </div>
        </div>

        <FormField label="Business Logic Complexity" tooltip="Complexity of server-side business rules">
          <div className="grid grid-cols-3 gap-3">
            {(['simple', 'medium', 'complex'] as ComplexityLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => onChange({ businessLogicComplexity: level })}
                className={cn(
                  "p-3 rounded-lg border-2 text-center transition-all capitalize",
                  data.businessLogicComplexity === level
                    ? "border-primary bg-secondary"
                    : "border-border hover:border-primary/30"
                )}
              >
                <div className="font-medium">{level}</div>
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Security Requirements" tooltip="Level of security and compliance needed">
          <div className="grid grid-cols-3 gap-3">
            {securityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onChange({ securityLevel: option.value })}
                className={cn(
                  "p-3 rounded-lg border-2 text-center transition-all",
                  data.securityLevel === option.value
                    ? "border-primary bg-secondary"
                    : "border-border hover:border-primary/30"
                )}
              >
                <Shield className={cn(
                  "w-5 h-5 mx-auto mb-1",
                  data.securityLevel === option.value ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="font-medium text-sm">{option.title}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Database Size" tooltip="Expected data volume and scale">
          <div className="grid grid-cols-3 gap-3">
            {databaseOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onChange({ databaseSize: option.value })}
                className={cn(
                  "p-3 rounded-lg border-2 text-center transition-all",
                  data.databaseSize === option.value
                    ? "border-primary bg-secondary"
                    : "border-border hover:border-primary/30"
                )}
              >
                <HardDrive className={cn(
                  "w-5 h-5 mx-auto mb-1",
                  data.databaseSize === option.value ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="font-medium text-sm">{option.title}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </button>
            ))}
          </div>
        </FormField>
      </StepCard>
    </div>
  );
}
