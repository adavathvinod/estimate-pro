import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  name: string;
  shortName: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function ProgressIndicator({ steps, currentStep, onStepClick }: ProgressIndicatorProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = onStepClick && currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                    isCompleted && "bg-primary text-primary-foreground shadow-glow",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-glow animate-pulse-soft",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                    isClickable && "cursor-pointer hover:scale-110"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                </button>
                <span className={cn(
                  "mt-2 text-xs font-medium hidden sm:block transition-colors",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}>
                  {step.shortName}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-4">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full gradient-hero transition-all duration-500",
                        isCompleted ? "w-full" : "w-0"
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
