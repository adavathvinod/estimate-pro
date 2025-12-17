import { Check, Circle } from 'lucide-react';
import { ProjectFormData } from '@/types/estimator';

interface SelectionProgressIndicatorProps {
  formData: ProjectFormData;
}

interface RequiredField {
  key: string;
  label: string;
  isSelected: boolean;
}

export function SelectionProgressIndicator({ formData }: SelectionProgressIndicatorProps) {
  const requiredFields: RequiredField[] = [
    { key: 'projectTypes', label: 'Project Type', isSelected: (formData.projectTypes?.length ?? 0) > 0 },
    { key: 'projectStage', label: 'Project Stage', isSelected: !!formData.projectStage },
    { key: 'platforms', label: 'Platform(s)', isSelected: (formData.platforms?.length ?? 0) > 0 },
    { key: 'complexity', label: 'Complexity', isSelected: !!formData.complexity },
  ];

  const completedCount = requiredFields.filter(f => f.isSelected).length;
  const progressPercent = (completedCount / requiredFields.length) * 100;

  if (completedCount === requiredFields.length) {
    return null; // Hide when all selections are made
  }

  return (
    <div className="p-4 bg-muted/50 border border-border rounded-lg animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">Required Selections</span>
        <span className="text-sm font-semibold text-primary">{completedCount}/{requiredFields.length}</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Field checklist */}
      <div className="grid grid-cols-2 gap-2">
        {requiredFields.map((field) => (
          <div 
            key={field.key}
            className={`flex items-center gap-2 text-sm p-2 rounded-md transition-all duration-300 ${
              field.isSelected 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground bg-background'
            }`}
          >
            {field.isSelected ? (
              <Check className="w-4 h-4 text-primary animate-scale-in" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
            <span className={field.isSelected ? 'line-through opacity-60' : ''}>
              {field.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
