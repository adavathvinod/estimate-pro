import { TestTube, Rocket, Cloud } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ProjectFormData, CustomItem } from '@/types/estimator';
import { CustomItemEditor } from '../CustomItemEditor';
import { cn } from '@/lib/utils';

interface QADeploySectionProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
  onCustomItemsChange: (customItems: CustomItem[]) => void;
}

const TEST_COVERAGE = [
  { value: 'unit', label: 'Unit', description: '~60% coverage' },
  { value: 'integration', label: 'Integration', description: '~80% coverage' },
  { value: 'e2e', label: 'End-to-End', description: '~95% coverage' },
] as const;

const CLOUD_PROVIDERS = [
  { value: 'aws', label: 'AWS', icon: '🟠' },
  { value: 'azure', label: 'Azure', icon: '🔵' },
  { value: 'gcp', label: 'GCP', icon: '🔴' },
] as const;

export function QADeploySection({ data, onChange, onCustomItemsChange }: QADeploySectionProps) {
  const handleItemsChange = (items: CustomItem[]) => {
    const otherItems = data.customItems.filter(i => !['qa', 'deploy'].includes(i.stage));
    onCustomItemsChange([...otherItems, ...items]);
  };

  return (
    <section className="space-y-8">
      {/* QA */}
      <div className="p-6 border rounded-xl bg-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TestTube className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Quality Assurance</h3>
            <p className="text-sm text-muted-foreground">Testing & QA specifications</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Test Coverage Level</label>
            <div className="grid grid-cols-3 gap-3">
              {TEST_COVERAGE.map(({ value, label, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ testCoverage: value })}
                  className={cn(
                    "p-4 rounded-lg border-2 text-center transition-all",
                    data.testCoverage === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">
              UAT Period: <span className="text-primary font-bold">{data.uatDays}</span> days
            </label>
            <Slider
              value={[data.uatDays]}
              onValueChange={([value]) => onChange({ uatDays: value })}
              min={1}
              max={30}
              step={1}
              className="py-4"
            />
          </div>
        </div>

        <CustomItemEditor
          items={data.customItems}
          stage="qa"
          stageName="QA"
          onChange={handleItemsChange}
        />
      </div>

      {/* Deployment */}
      <div className="p-6 border rounded-xl bg-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Rocket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Deployment</h3>
            <p className="text-sm text-muted-foreground">Infrastructure & launch</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block flex items-center gap-2">
              <Cloud className="w-4 h-4" /> Cloud Provider
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CLOUD_PROVIDERS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ cloudProvider: value })}
                  className={cn(
                    "p-4 rounded-lg border-2 text-center transition-all",
                    data.cloudProvider === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-2xl mb-1 block">{icon}</span>
                  <p className="font-medium">{label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">CI/CD Pipeline</p>
              <p className="text-sm text-muted-foreground">Automated deployment</p>
            </div>
            <Switch
              checked={data.cicdSetup}
              onCheckedChange={(checked) => onChange({ cicdSetup: checked })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">
              Post-Launch Support: <span className="text-primary font-bold">{data.supportDays}</span> days
            </label>
            <Slider
              value={[data.supportDays]}
              onValueChange={([value]) => onChange({ supportDays: value })}
              min={0}
              max={90}
              step={5}
              className="py-4"
            />
          </div>
        </div>

        <CustomItemEditor
          items={data.customItems}
          stage="deploy"
          stageName="Deploy"
          onChange={handleItemsChange}
        />
      </div>
    </section>
  );
}