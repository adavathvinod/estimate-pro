import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StepCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  stageColor?: string;
  children: ReactNode;
  className?: string;
}

export function StepCard({ title, description, icon, stageColor, children, className }: StepCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-2xl shadow-card p-6 sm:p-8 animate-slide-up",
      className
    )}>
      <div className="flex items-start gap-4 mb-6">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground shrink-0",
          stageColor || "gradient-hero"
        )}>
          {icon}
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">{title}</h2>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
