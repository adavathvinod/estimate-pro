import { Users, Circle, Eye } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRealtimePresence } from '@/hooks/useRealtimePresence';
import { cn } from '@/lib/utils';

interface RealtimePresenceProps {
  channelName: string;
  currentSection?: string;
}

export function RealtimePresence({ channelName, currentSection }: RealtimePresenceProps) {
  const { viewers, currentUser, updatePresence, isConnected } = useRealtimePresence(channelName);

  // Update section when it changes
  if (currentSection && currentUser?.section !== currentSection) {
    updatePresence({ section: currentSection });
  }

  const totalViewers = viewers.length + 1; // Including current user

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Connection Status */}
        <div className="flex items-center gap-1">
          <Circle 
            className={cn(
              "w-2 h-2 fill-current",
              isConnected ? "text-emerald-500" : "text-muted-foreground"
            )} 
          />
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Live' : 'Connecting...'}
          </span>
        </div>

        {/* Viewer Count */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="w-3 h-3" />
          <span>{totalViewers}</span>
        </div>

        {/* Viewer Avatars */}
        {viewers.length > 0 && (
          <div className="flex -space-x-2">
            {viewers.slice(0, 5).map((viewer) => (
              <Tooltip key={viewer.id}>
                <TooltipTrigger asChild>
                  <div
                    className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-medium text-white cursor-default"
                    style={{ backgroundColor: viewer.color }}
                  >
                    {viewer.name.charAt(0).toUpperCase()}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">{viewer.name}</p>
                  {viewer.section && (
                    <p className="text-xs text-muted-foreground">
                      Viewing: {viewer.section}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
            {viewers.length > 5 && (
              <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium">
                +{viewers.length - 5}
              </div>
            )}
          </div>
        )}

        {/* Current User */}
        {currentUser && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center text-[10px] font-medium text-white cursor-default"
                style={{ backgroundColor: currentUser.color }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="font-medium">{currentUser.name} (You)</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
