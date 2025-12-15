import { Monitor, Smartphone, Apple, Server, Layers, Check } from 'lucide-react';
import { ProjectFormData, Platform } from '@/types/estimator';
import { cn } from '@/lib/utils';

interface PlatformSectionProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
}

const PLATFORMS: { value: Platform; label: string; icon: typeof Monitor; description: string }[] = [
  { value: 'web', label: 'Web', icon: Monitor, description: 'Browser-based app' },
  { value: 'android', label: 'Play Store', icon: Smartphone, description: 'Android app' },
  { value: 'ios', label: 'App Store', icon: Apple, description: 'iOS app' },
  { value: 'linux-server', label: 'Server', icon: Server, description: 'Linux deployment' },
  { value: 'cross-platform', label: 'Cross-Platform', icon: Layers, description: 'All platforms' },
];

export function PlatformSection({ data, onChange }: PlatformSectionProps) {
  const togglePlatform = (platform: Platform) => {
    const current = data.platforms || [];
    
    // If cross-platform is selected, clear others and just select cross-platform
    if (platform === 'cross-platform') {
      onChange({ platforms: ['cross-platform'] });
      return;
    }
    
    // If clicking on a platform while cross-platform is selected, switch to that platform
    if (current.includes('cross-platform')) {
      onChange({ platforms: [platform] });
      return;
    }
    
    // Toggle the platform (max 3)
    const updated = current.includes(platform)
      ? current.filter(p => p !== platform)
      : [...current, platform].slice(0, 3);
    
    // Must have at least one platform
    if (updated.length === 0) {
      return;
    }
    
    onChange({ platforms: updated });
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Layers className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Target Platforms</h3>
          <p className="text-sm text-muted-foreground">Select up to 3 platforms for deployment</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {PLATFORMS.map(({ value, label, icon: Icon, description }) => {
          const isSelected = data.platforms?.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => togglePlatform(value)}
              className={cn(
                "relative p-4 rounded-xl border-2 text-center transition-all hover:shadow-md",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <Icon className={cn(
                "w-8 h-8 mx-auto mb-2",
                isSelected ? "text-primary" : "text-muted-foreground"
              )} />
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </button>
          );
        })}
      </div>

      {data.platforms && data.platforms.length > 0 && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm">
            <span className="font-medium">Selected: </span>
            <span className="text-muted-foreground">
              {data.platforms.map(p => PLATFORMS.find(pl => pl.value === p)?.label).join(', ')}
            </span>
            {data.platforms.length > 1 && (
              <span className="text-xs text-primary ml-2">
                (+{((data.platforms.length - 1) * 20)}% effort multiplier)
              </span>
            )}
          </p>
        </div>
      )}
    </section>
  );
}