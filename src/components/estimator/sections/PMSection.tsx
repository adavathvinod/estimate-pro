import { Users } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { ProjectFormData, CustomItem } from '@/types/estimator';
import { CustomItemEditor } from '../CustomItemEditor';

interface PMSectionProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
  onCustomItemsChange: (customItems: CustomItem[]) => void;
}

export function PMSection({ data, onChange, onCustomItemsChange }: PMSectionProps) {
  const handleItemsChange = (items: CustomItem[]) => {
    const otherItems = data.customItems.filter(i => i.stage !== 'pm');
    onCustomItemsChange([...otherItems, ...items]);
  };

  return (
    <section className="p-6 border rounded-xl bg-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Project Management</h3>
          <p className="text-sm text-muted-foreground">PM involvement & oversight</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-3 block">
            PM Involvement: <span className="text-primary font-bold">{data.pmInvolvement}%</span>
          </label>
          <Slider
            value={[data.pmInvolvement]}
            onValueChange={([value]) => onChange({ pmInvolvement: value })}
            min={10}
            max={100}
            step={5}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Minimal (10%)</span>
            <span>Full-time (100%)</span>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            {data.pmInvolvement < 30 && "Light touch management for small, focused projects."}
            {data.pmInvolvement >= 30 && data.pmInvolvement < 60 && "Standard management for medium complexity projects."}
            {data.pmInvolvement >= 60 && "Intensive management for complex, multi-team projects."}
          </p>
        </div>
      </div>

      <CustomItemEditor
        items={data.customItems}
        stage="pm"
        stageName="PM"
        onChange={handleItemsChange}
      />
    </section>
  );
}