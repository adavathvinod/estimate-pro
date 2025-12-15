import { User, Award } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { ProjectFormData, EXPERIENCE_LEVELS } from '@/types/estimator';
import { cn } from '@/lib/utils';

interface ExperienceSectionProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
}

export function ExperienceSection({ data, onChange }: ExperienceSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Team Experience</h3>
          <p className="text-sm text-muted-foreground">Select your team's experience level</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {EXPERIENCE_LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange({ teamExperience: level.value })}
            className={cn(
              "p-4 rounded-xl border-2 text-center transition-all hover:shadow-md",
              data.teamExperience === level.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <Award className={cn(
              "w-6 h-6 mx-auto mb-2",
              data.teamExperience === level.value ? "text-primary" : "text-muted-foreground"
            )} />
            <p className="font-medium text-sm">{level.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{level.years}</p>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <label className="text-sm font-medium mb-3 block">
          Years of Experience: <span className="text-primary font-bold">{data.yearsOfExperience}</span> years
        </label>
        <Slider
          value={[data.yearsOfExperience]}
          onValueChange={([value]) => onChange({ yearsOfExperience: value })}
          min={0}
          max={20}
          step={1}
          className="py-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0 years</span>
          <span>20+ years</span>
        </div>
      </div>
    </section>
  );
}