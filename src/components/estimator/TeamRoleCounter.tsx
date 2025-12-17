import { Minus, Plus, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TeamRoleCounterProps {
  label: string;
  count: number;
  hourlyRate: number;
  customExperience?: string;
  onCountChange: (count: number) => void;
  onRateChange: (rate: number) => void;
  onExperienceChange?: (experience: string) => void;
  className?: string;
}

export function TeamRoleCounter({
  label,
  count,
  hourlyRate,
  customExperience,
  onCountChange,
  onRateChange,
  onExperienceChange,
  className,
}: TeamRoleCounterProps) {
  const [editingRate, setEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(hourlyRate.toString());

  const handleDecrement = () => {
    if (count > 0) {
      onCountChange(count - 1);
    }
  };

  const handleIncrement = () => {
    onCountChange(count + 1);
  };

  const handleRateSave = () => {
    const newRate = parseInt(tempRate) || hourlyRate;
    onRateChange(newRate);
    setEditingRate(false);
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border bg-card transition-all",
      count > 0 && "border-primary/50 bg-primary/5",
      className
    )}>
      {/* Role Label */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{label}</p>
        {onExperienceChange && (
          <Input
            value={customExperience || ''}
            onChange={(e) => onExperienceChange(e.target.value)}
            placeholder="e.g., 5 years React"
            className="mt-1 h-7 text-xs bg-muted/50"
          />
        )}
      </div>

      {/* Counter */}
      <div className="flex items-center gap-2 mx-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleDecrement}
          disabled={count === 0}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className={cn(
          "w-8 text-center font-bold text-lg transition-all",
          count > 0 ? "text-primary scale-110" : "text-muted-foreground"
        )}>
          {count}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleIncrement}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Hourly Rate */}
      <Popover open={editingRate} onOpenChange={setEditingRate}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
          >
            ${hourlyRate}/hr
            <Edit2 className="h-3 w-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3" align="end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Hourly Rate ($)</label>
            <Input
              type="number"
              value={tempRate}
              onChange={(e) => setTempRate(e.target.value)}
              min={1}
              className="h-8"
            />
            <Button size="sm" className="w-full" onClick={handleRateSave}>
              Save
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}