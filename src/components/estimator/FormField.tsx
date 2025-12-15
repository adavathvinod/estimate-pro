import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  tooltip?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, tooltip, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  );
}
