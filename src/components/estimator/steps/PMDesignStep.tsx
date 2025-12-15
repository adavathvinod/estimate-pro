import { Users, Palette, Brush } from 'lucide-react';
import { StepCard } from '../StepCard';
import { FormField } from '../FormField';
import { CustomItemEditor } from '../CustomItemEditor';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ProjectFormData, STAGE_PERSONNEL, CustomItem } from '@/types/estimator';

interface PMDesignStepProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
  onCustomItemsChange: (customItems: CustomItem[]) => void;
}

export function PMDesignStep({ data, onChange, onCustomItemsChange }: PMDesignStepProps) {
  return (
    <div className="space-y-6">
      <StepCard
        title="Project Management"
        description="Configure PM involvement and oversight"
        icon={<Users className="w-6 h-6" />}
        stageColor="bg-stage-pm"
      >
        <div className="bg-secondary/50 rounded-lg p-4 text-sm">
          <div className="flex items-center gap-2 text-secondary-foreground">
            <Users className="w-4 h-4" />
            <span className="font-medium">Personnel:</span>
            <span>{STAGE_PERSONNEL.pm.count} PM, {STAGE_PERSONNEL.pm.experience}</span>
          </div>
          <div className="mt-2 text-muted-foreground">
            Tools: {STAGE_PERSONNEL.pm.tools.join(', ')}
          </div>
        </div>

        <FormField 
          label={`PM Involvement: ${data.pmInvolvement}%`}
          tooltip="Percentage of project time dedicated to project management"
        >
          <Slider
            value={[data.pmInvolvement]}
            onValueChange={([value]) => onChange({ pmInvolvement: value })}
            min={10}
            max={50}
            step={5}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10% (Light)</span>
            <span>30% (Standard)</span>
            <span>50% (Heavy)</span>
          </div>
        </FormField>

        <CustomItemEditor
          items={data.customItems}
          stage="pm"
          stageName="PM"
          onChange={onCustomItemsChange}
        />
      </StepCard>

      <StepCard
        title="UX/UI Design"
        description="Define design scope and requirements"
        icon={<Palette className="w-6 h-6" />}
        stageColor="bg-stage-design"
      >
        <div className="bg-secondary/50 rounded-lg p-4 text-sm">
          <div className="flex items-center gap-2 text-secondary-foreground">
            <Palette className="w-4 h-4" />
            <span className="font-medium">Personnel:</span>
            <span>{STAGE_PERSONNEL.design.count} Designers, {STAGE_PERSONNEL.design.experience}</span>
          </div>
          <div className="mt-2 text-muted-foreground">
            Tools: {STAGE_PERSONNEL.design.tools.join(', ')}
          </div>
        </div>

        <FormField 
          label={`Unique Screens/Pages: ${data.uniqueScreens}`}
          tooltip="Number of distinct UI screens or pages to design"
        >
          <Slider
            value={[data.uniqueScreens]}
            onValueChange={([value]) => onChange({ uniqueScreens: value })}
            min={1}
            max={50}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 (Minimal)</span>
            <span>25 (Medium)</span>
            <span>50 (Large)</span>
          </div>
        </FormField>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Brush className="w-5 h-5 text-stage-design" />
            <div>
              <Label htmlFor="custom-branding" className="font-medium">Custom Branding</Label>
              <p className="text-sm text-muted-foreground">Custom illustrations, icons, and visual identity</p>
            </div>
          </div>
          <Switch
            id="custom-branding"
            checked={data.customBranding}
            onCheckedChange={(checked) => onChange({ customBranding: checked })}
          />
        </div>

        <CustomItemEditor
          items={data.customItems}
          stage="design"
          stageName="Design"
          onChange={onCustomItemsChange}
        />
      </StepCard>
    </div>
  );
}
