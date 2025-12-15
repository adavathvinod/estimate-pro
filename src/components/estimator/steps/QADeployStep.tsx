import { TestTube, Rocket, Cloud, GitBranch, CheckCircle } from 'lucide-react';
import { StepCard } from '../StepCard';
import { FormField } from '../FormField';
import { SelectionCard } from '../SelectionCard';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ProjectFormData, STAGE_PERSONNEL } from '@/types/estimator';
import { cn } from '@/lib/utils';

interface QADeployStepProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
}

const testCoverageOptions = [
  { value: 'unit', title: 'Unit Tests', description: 'Basic component testing', coverage: '~60%' },
  { value: 'integration', title: 'Integration', description: 'API & flow testing', coverage: '~80%' },
  { value: 'e2e', title: 'End-to-End', description: 'Full user journey tests', coverage: '~95%' },
] as const;

const cloudProviders = [
  { value: 'aws', title: 'AWS', description: 'Amazon Web Services' },
  { value: 'azure', title: 'Azure', description: 'Microsoft Azure' },
  { value: 'gcp', title: 'GCP', description: 'Google Cloud Platform' },
] as const;

export function QADeployStep({ data, onChange }: QADeployStepProps) {
  return (
    <div className="space-y-6">
      <StepCard
        title="Quality Assurance"
        description="Testing strategy and coverage"
        icon={<TestTube className="w-6 h-6" />}
        stageColor="bg-stage-qa"
      >
        <div className="bg-secondary/50 rounded-lg p-4 text-sm">
          <div className="flex items-center gap-2 text-secondary-foreground">
            <TestTube className="w-4 h-4" />
            <span className="font-medium">Personnel:</span>
            <span>{STAGE_PERSONNEL.qa.count} QA Specialist, {STAGE_PERSONNEL.qa.experience}</span>
          </div>
          <div className="mt-2 text-muted-foreground">
            Tools: {STAGE_PERSONNEL.qa.tools.join(', ')}
          </div>
        </div>

        <FormField label="Test Coverage Level" tooltip="Depth of automated testing">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {testCoverageOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onChange({ testCoverage: option.value })}
                className={cn(
                  "p-4 rounded-lg border-2 text-left transition-all",
                  data.testCoverage === option.value
                    ? "border-primary bg-secondary"
                    : "border-border hover:border-primary/30"
                )}
              >
                <CheckCircle className={cn(
                  "w-5 h-5 mb-2",
                  data.testCoverage === option.value ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="font-medium">{option.title}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
                <div className="text-xs text-primary font-medium mt-1">Coverage: {option.coverage}</div>
              </button>
            ))}
          </div>
        </FormField>

        <FormField 
          label={`UAT Period: ${data.uatDays} days`}
          tooltip="User Acceptance Testing duration"
        >
          <Slider
            value={[data.uatDays]}
            onValueChange={([value]) => onChange({ uatDays: value })}
            min={1}
            max={20}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 day</span>
            <span>10 days</span>
            <span>20 days</span>
          </div>
        </FormField>
      </StepCard>

      <StepCard
        title="Deployment & Support"
        description="Infrastructure and post-launch support"
        icon={<Rocket className="w-6 h-6" />}
        stageColor="bg-stage-deploy"
      >
        <div className="bg-secondary/50 rounded-lg p-4 text-sm">
          <div className="flex items-center gap-2 text-secondary-foreground">
            <Rocket className="w-4 h-4" />
            <span className="font-medium">Personnel:</span>
            <span>{STAGE_PERSONNEL.devops.count} DevOps Engineer, {STAGE_PERSONNEL.devops.experience}</span>
          </div>
          <div className="mt-2 text-muted-foreground">
            Tools: {STAGE_PERSONNEL.devops.tools.join(', ')}
          </div>
        </div>

        <FormField label="Cloud Provider" tooltip="Primary hosting infrastructure">
          <div className="grid grid-cols-3 gap-3">
            {cloudProviders.map((provider) => (
              <button
                key={provider.value}
                onClick={() => onChange({ cloudProvider: provider.value })}
                className={cn(
                  "p-4 rounded-lg border-2 text-center transition-all",
                  data.cloudProvider === provider.value
                    ? "border-primary bg-secondary"
                    : "border-border hover:border-primary/30"
                )}
              >
                <Cloud className={cn(
                  "w-6 h-6 mx-auto mb-2",
                  data.cloudProvider === provider.value ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="font-semibold">{provider.title}</div>
                <div className="text-xs text-muted-foreground">{provider.description}</div>
              </button>
            ))}
          </div>
        </FormField>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <GitBranch className="w-5 h-5 text-stage-deploy" />
            <div>
              <Label htmlFor="cicd-setup" className="font-medium">CI/CD Pipeline</Label>
              <p className="text-sm text-muted-foreground">Automated build and deployment pipeline</p>
            </div>
          </div>
          <Switch
            id="cicd-setup"
            checked={data.cicdSetup}
            onCheckedChange={(checked) => onChange({ cicdSetup: checked })}
          />
        </div>

        <FormField 
          label={`Initial Support: ${data.supportDays} days`}
          tooltip="Post-launch support and bug fixing period"
        >
          <Slider
            value={[data.supportDays]}
            onValueChange={([value]) => onChange({ supportDays: value })}
            min={7}
            max={90}
            step={7}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 week</span>
            <span>45 days</span>
            <span>90 days</span>
          </div>
        </FormField>
      </StepCard>
    </div>
  );
}
