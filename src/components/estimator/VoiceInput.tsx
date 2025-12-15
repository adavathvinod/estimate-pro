import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceInput({ onTranscript, className }: VoiceInputProps) {
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    isSupported,
    error 
  } = useVoiceInput({
    onTranscript,
    continuous: true,
  });

  if (!isSupported) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Voice input not supported in this browser
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="lg"
          onClick={isListening ? stopListening : startListening}
          className={cn(
            "relative transition-all",
            isListening && "animate-pulse-recording"
          )}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 mr-2" />
              Start Voice Input
            </>
          )}
        </Button>
        
        {isListening && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Listening...
          </div>
        )}
      </div>

      {transcript && (
        <div className="p-4 bg-muted rounded-lg border">
          <p className="text-sm font-medium mb-1">Transcript:</p>
          <p className="text-sm text-muted-foreground">{transcript}</p>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">Error: {error}</p>
      )}
    </div>
  );
}