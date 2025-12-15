import { Palette, Code, Database } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ProjectFormData, ComplexityLevel, CustomItem } from '@/types/estimator';
import { CustomItemEditor } from '../CustomItemEditor';
import { cn } from '@/lib/utils';

interface DevelopmentSectionProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
  onCustomItemsChange: (customItems: CustomItem[]) => void;
}

const ANIMATION_LEVELS = [
  { value: 'none', label: 'None', description: 'Static pages' },
  { value: 'simple', label: 'Simple', description: 'Basic transitions' },
  { value: 'advanced', label: 'Advanced', description: 'Complex animations' },
] as const;

const SECURITY_LEVELS = [
  { value: 'basic', label: 'Basic', description: 'Standard auth' },
  { value: 'standard', label: 'Standard', description: 'Role-based access' },
  { value: 'enterprise', label: 'Enterprise', description: 'Full audit logs' },
] as const;

const DATABASE_SIZES = [
  { value: 'small', label: 'Small', description: '< 100K records' },
  { value: 'medium', label: 'Medium', description: '100K-1M records' },
  { value: 'enterprise', label: 'Enterprise', description: '1M+ records' },
] as const;

export function DevelopmentSection({ data, onChange, onCustomItemsChange }: DevelopmentSectionProps) {
  const handleItemsChange = (items: CustomItem[]) => {
    // Merge with items from other stages
    const otherItems = data.customItems.filter(i => !['design', 'frontend', 'backend'].includes(i.stage));
    onCustomItemsChange([...otherItems, ...items]);
  };

  return (
    <section className="space-y-8">
      {/* Design */}
      <div className="p-6 border rounded-xl bg-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Design</h3>
            <p className="text-sm text-muted-foreground">UI/UX specifications</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">
              Unique Screens: <span className="text-primary font-bold">{data.uniqueScreens}</span>
            </label>
            <Slider
              value={[data.uniqueScreens]}
              onValueChange={([value]) => onChange({ uniqueScreens: value })}
              min={1}
              max={50}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 screen</span>
              <span>50 screens</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Custom Branding</p>
              <p className="text-sm text-muted-foreground">Logo, colors, typography</p>
            </div>
            <Switch
              checked={data.customBranding}
              onCheckedChange={(checked) => onChange({ customBranding: checked })}
            />
          </div>
        </div>

        <CustomItemEditor
          items={data.customItems}
          stage="design"
          stageName="Design"
          onChange={handleItemsChange}
        />
      </div>

      {/* Frontend */}
      <div className="p-6 border rounded-xl bg-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Code className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Frontend</h3>
            <p className="text-sm text-muted-foreground">Client-side development</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Animation Level</label>
            <div className="grid grid-cols-3 gap-3">
              {ANIMATION_LEVELS.map(({ value, label, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ animationLevel: value })}
                  className={cn(
                    "p-3 rounded-lg border-2 text-center transition-all",
                    data.animationLevel === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">
              API Integrations: <span className="text-primary font-bold">{data.apiIntegrations}</span>
            </label>
            <Slider
              value={[data.apiIntegrations]}
              onValueChange={([value]) => onChange({ apiIntegrations: value })}
              min={0}
              max={20}
              step={1}
              className="py-4"
            />
          </div>
        </div>

        <CustomItemEditor
          items={data.customItems}
          stage="frontend"
          stageName="Frontend"
          onChange={handleItemsChange}
        />
      </div>

      {/* Backend */}
      <div className="p-6 border rounded-xl bg-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Backend</h3>
            <p className="text-sm text-muted-foreground">Server-side development</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Business Logic Complexity</label>
            <div className="grid grid-cols-3 gap-3">
              {(['simple', 'medium', 'complex'] as ComplexityLevel[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ businessLogicComplexity: value })}
                  className={cn(
                    "p-3 rounded-lg border-2 text-center transition-all capitalize",
                    data.businessLogicComplexity === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Security Level</label>
            <div className="grid grid-cols-3 gap-3">
              {SECURITY_LEVELS.map(({ value, label, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ securityLevel: value })}
                  className={cn(
                    "p-3 rounded-lg border-2 text-center transition-all",
                    data.securityLevel === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Database Size</label>
            <div className="grid grid-cols-3 gap-3">
              {DATABASE_SIZES.map(({ value, label, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ databaseSize: value })}
                  className={cn(
                    "p-3 rounded-lg border-2 text-center transition-all",
                    data.databaseSize === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <CustomItemEditor
          items={data.customItems}
          stage="backend"
          stageName="Backend"
          onChange={handleItemsChange}
        />
      </div>
    </section>
  );
}