import { useState } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomItem, ItemComplexity, ITEM_COMPLEXITY_HOURS } from '@/types/estimator';
import { cn } from '@/lib/utils';

interface CustomItemEditorProps {
  items: CustomItem[];
  stage: string;
  stageName: string;
  onChange: (items: CustomItem[]) => void;
}

const complexityOptions: { value: ItemComplexity; label: string; hours: number; color: string }[] = [
  { value: 'low', label: 'Low', hours: ITEM_COMPLEXITY_HOURS.low, color: 'bg-emerald-500' },
  { value: 'medium', label: 'Medium', hours: ITEM_COMPLEXITY_HOURS.medium, color: 'bg-amber-500' },
  { value: 'high', label: 'High', hours: ITEM_COMPLEXITY_HOURS.high, color: 'bg-red-500' },
];

export function CustomItemEditor({ items, stage, stageName, onChange }: CustomItemEditorProps) {
  const [newItemName, setNewItemName] = useState('');
  const [newItemComplexity, setNewItemComplexity] = useState<ItemComplexity>('medium');
  const [newItemReason, setNewItemReason] = useState('');

  const stageItems = items.filter(item => item.stage === stage);

  const addItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: CustomItem = {
      id: crypto.randomUUID(),
      name: newItemName.trim(),
      complexity: newItemComplexity,
      stage,
      hours: ITEM_COMPLEXITY_HOURS[newItemComplexity],
      reason: newItemReason.trim() || `Custom ${stageName} task with ${newItemComplexity} complexity.`,
    };
    
    onChange([...items, newItem]);
    setNewItemName('');
    setNewItemReason('');
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const updateItemComplexity = (id: string, complexity: ItemComplexity) => {
    onChange(items.map(item => 
      item.id === id 
        ? { ...item, complexity, hours: ITEM_COMPLEXITY_HOURS[complexity] }
        : item
    ));
  };

  return (
    <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border">
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Custom {stageName} Items
      </h4>
      
      {/* Existing items */}
      {stageItems.length > 0 && (
        <div className="space-y-2 mb-4">
          {stageItems.map(item => (
            <div key={item.id} className="flex items-center gap-2 p-2 bg-background rounded-lg border border-border">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{item.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {item.reason}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {complexityOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateItemComplexity(item.id, opt.value)}
                    className={cn(
                      "px-2 py-1 text-xs rounded-md transition-all",
                      item.complexity === opt.value
                        ? `${opt.color} text-white`
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              
              <div className="text-xs font-medium text-primary w-12 text-right">
                {item.hours}h
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Add new item */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={`Add custom ${stageName.toLowerCase()} task...`}
            className="flex-1 h-9"
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          
          <div className="flex items-center gap-1 border rounded-lg px-2 bg-background">
            {complexityOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setNewItemComplexity(opt.value)}
                className={cn(
                  "px-2 py-1 text-xs rounded transition-all",
                  newItemComplexity === opt.value
                    ? `${opt.color} text-white`
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={`${opt.hours} hours`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          
          <Button
            size="sm"
            onClick={addItem}
            disabled={!newItemName.trim()}
            className="h-9"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <Input
          value={newItemReason}
          onChange={(e) => setNewItemReason(e.target.value)}
          placeholder="Why is this needed? (optional)"
          className="h-8 text-sm"
        />
      </div>
      
      {stageItems.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm">
          <span className="text-muted-foreground">Custom items total:</span>
          <span className="font-semibold text-primary">
            +{stageItems.reduce((sum, item) => sum + item.hours, 0)} hours
          </span>
        </div>
      )}
    </div>
  );
}
