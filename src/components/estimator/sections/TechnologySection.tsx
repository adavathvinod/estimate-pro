import { Code, Check } from 'lucide-react';
import { ProjectFormData, AVAILABLE_TECHNOLOGIES } from '@/types/estimator';
import { cn } from '@/lib/utils';

interface TechnologySectionProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
}

export function TechnologySection({ data, onChange }: TechnologySectionProps) {
  const toggleTechnology = (tech: string) => {
    const current = data.technologies || [];
    const updated = current.includes(tech)
      ? current.filter(t => t !== tech)
      : [...current, tech];
    onChange({ technologies: updated });
  };

  const categories = [
    { key: 'frontend', label: 'Frontend' },
    { key: 'backend', label: 'Backend' },
    { key: 'database', label: 'Database' },
    { key: 'cloud', label: 'Cloud' },
    { key: 'tools', label: 'DevOps Tools' },
  ] as const;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Code className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Technology Stack</h3>
          <p className="text-sm text-muted-foreground">Select the technologies you'll use</p>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map(({ key, label }) => (
          <div key={key}>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">{label}</h4>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TECHNOLOGIES[key].map((tech) => {
                const isSelected = data.technologies?.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTechnology(tech)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:border-primary/50"
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {tech}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {data.technologies && data.technologies.length > 0 && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm">
            <span className="font-medium">Selected: </span>
            <span className="text-muted-foreground">{data.technologies.join(', ')}</span>
          </p>
        </div>
      )}
    </section>
  );
}