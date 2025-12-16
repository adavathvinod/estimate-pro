import { useState, useEffect } from 'react';
import { History, TrendingUp, TrendingDown, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHistoricalMatch } from '@/hooks/useHistoricalMatch';
import { cn } from '@/lib/utils';

interface HistoricalMatchPanelProps {
  projectType: string;
  platform: string;
  complexity: string;
  currentHours: number;
  onApplyAdjustment?: (adjustedHours: number) => void;
}

export function HistoricalMatchPanel({
  projectType,
  platform,
  complexity,
  currentHours,
  onApplyAdjustment
}: HistoricalMatchPanelProps) {
  const { match, message, loading, error, findMatch } = useHistoricalMatch();
  const [hasSearched, setHasSearched] = useState(false);

  const handleFindMatch = async () => {
    setHasSearched(true);
    await findMatch({
      projectType,
      platform,
      complexity,
      totalHours: currentHours
    });
  };

  // Reset when parameters change significantly
  useEffect(() => {
    setHasSearched(false);
  }, [projectType, platform, complexity]);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-emerald-600 bg-emerald-100';
    if (accuracy >= 60) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const hoursDiff = match ? match.adjustedHours - currentHours : 0;
  const percentDiff = match ? ((hoursDiff / currentHours) * 100).toFixed(1) : '0';

  return (
    <Card className="border-2 border-dashed border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="w-5 h-5 text-primary" />
          Historical Project Matching
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasSearched ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Compare your estimate against similar completed projects to improve accuracy
            </p>
            <Button onClick={handleFindMatch} disabled={loading || currentHours <= 0}>
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <History className="w-4 h-4 mr-2" />
                  Find Similar Projects
                </>
              )}
            </Button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Searching historical data...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="ghost" size="sm" onClick={handleFindMatch} className="ml-auto">
              Retry
            </Button>
          </div>
        ) : match ? (
          <div className="space-y-4">
            {/* Match Found */}
            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">Match Found: {match.projectName}</p>
                  <Badge className={getAccuracyColor(match.accuracy)}>
                    {match.accuracy}% Similar
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {match.suggestion}
                </p>
              </div>
            </div>

            {/* Comparison */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Your Estimate</p>
                <p className="text-lg font-semibold">{currentHours}h</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Historical</p>
                <p className="text-lg font-semibold">{match.originalHours}h</p>
              </div>
              <div className={cn(
                "p-3 rounded-lg",
                hoursDiff > 0 ? "bg-amber-100" : hoursDiff < 0 ? "bg-emerald-100" : "bg-muted/50"
              )}>
                <p className="text-xs text-muted-foreground">Suggested</p>
                <p className="text-lg font-semibold flex items-center justify-center gap-1">
                  {match.adjustedHours}h
                  {hoursDiff !== 0 && (
                    hoursDiff > 0 
                      ? <TrendingUp className="w-4 h-4 text-amber-600" />
                      : <TrendingDown className="w-4 h-4 text-emerald-600" />
                  )}
                </p>
              </div>
            </div>

            {/* Adjustment Info */}
            {hoursDiff !== 0 && (
              <div className={cn(
                "flex items-center gap-2 p-3 rounded-lg text-sm",
                hoursDiff > 0 ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"
              )}>
                {hoursDiff > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>
                  Historical data suggests {hoursDiff > 0 ? 'increasing' : 'decreasing'} estimate by{' '}
                  <strong>{Math.abs(hoursDiff)} hours ({Math.abs(parseFloat(percentDiff))}%)</strong>
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {onApplyAdjustment && hoursDiff !== 0 && (
                <Button 
                  onClick={() => onApplyAdjustment(match.adjustedHours)}
                  className="flex-1"
                >
                  Apply Suggested Adjustment
                </Button>
              )}
              <Button variant="outline" onClick={handleFindMatch}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Search Again
              </Button>
            </div>
          </div>
        ) : message ? (
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">{message}</p>
              <Button variant="link" size="sm" onClick={handleFindMatch} className="mt-2 h-auto p-0">
                Search Again
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
