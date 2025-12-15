import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SelectionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function SelectionCard({ icon, title, description, selected, onClick, disabled }: SelectionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-200",
        "hover:shadow-card-hover hover:scale-[1.02]",
        selected 
          ? "border-primary bg-secondary shadow-card" 
          : "border-border bg-card hover:border-primary/30",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold transition-colors",
            selected ? "text-primary" : "text-foreground"
          )}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
        </div>
      </div>
    </button>
  );
}
