import { useState, useEffect } from 'react';
import { X, Clock, DollarSign, BarChart3, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDuration } from '@/lib/estimationEngine';
import { cn } from '@/lib/utils';

interface CompareEstimate {
  id: string;
  project_name: string;
  project_type: string;
  platform: string;
  complexity: string;
  total_hours: number;
  total_weeks: number;
  total_cost: number;
  created_at: string;
  stage_estimates: any[];
}

interface ComparisonViewProps {
  estimates: CompareEstimate[];
  onClose: () => void;
}

const stageColors: Record<string, string> = {
  'Project Management': 'bg-stage-pm',
  'UX/UI Design': 'bg-stage-design',
  'Frontend Development': 'bg-stage-frontend',
  'Backend Development': 'bg-stage-backend',
  'Quality Assurance': 'bg-stage-qa',
  'Deployment & Support': 'bg-stage-deploy',
};

export function ComparisonView({ estimates, onClose }: ComparisonViewProps) {
  const [sortBy, setSortBy] = useState<'time' | 'cost'>('time');

  const sortedEstimates = [...estimates].sort((a, b) => 
    sortBy === 'time' ? a.total_hours - b.total_hours : a.total_cost - b.total_cost
  );

  const maxHours = Math.max(...estimates.map(e => e.total_hours));
  const maxCost = Math.max(...estimates.map(e => e.total_cost));

  // Parse stage_estimates if it's a string
  const parseStages = (stages: any): any[] => {
    if (typeof stages === 'string') {
      try {
        return JSON.parse(stages);
      } catch {
        return [];
      }
    }
    return stages || [];
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Compare Estimates</h2>
            <p className="text-muted-foreground">
              Comparing {estimates.length} project estimates side by side
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <Button
                variant={sortBy === 'time' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('time')}
              >
                <Clock className="w-4 h-4 mr-1" />
                Sort by Time
              </Button>
              <Button
                variant={sortBy === 'cost' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('cost')}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Sort by Cost
              </Button>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-1" />
              Close
            </Button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(estimates.length, 3)}, 1fr)` }}>
          {sortedEstimates.map((estimate, index) => {
            const stages = parseStages(estimate.stage_estimates);
            
            return (
              <div
                key={estimate.id}
                className={cn(
                  "bg-card rounded-2xl border shadow-card overflow-hidden",
                  index === 0 && "ring-2 ring-primary"
                )}
              >
                {/* Card Header */}
                <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b">
                  {index === 0 && (
                    <span className="inline-block px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full mb-2">
                      {sortBy === 'time' ? 'Fastest' : 'Most Affordable'}
                    </span>
                  )}
                  <h3 className="font-bold text-lg truncate">{estimate.project_name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-muted rounded-full capitalize">
                      {estimate.project_type.replace('-', ' ')}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-muted rounded-full capitalize">
                      {estimate.platform.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Total Time</div>
                    <div className="text-xl font-bold text-primary">
                      {formatDuration(estimate.total_weeks)}
                    </div>
                    <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(estimate.total_hours / maxHours) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Total Cost</div>
                    <div className="text-xl font-bold text-accent">
                      {formatCurrency(estimate.total_cost)}
                    </div>
                    <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${(estimate.total_cost / maxCost) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stage Breakdown */}
                <div className="p-4 pt-0">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Stage Breakdown
                  </h4>
                  <div className="space-y-2">
                    {stages.map((stage: any) => (
                      <div key={stage.stage} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", stageColors[stage.stage] || 'bg-gray-400')} />
                          <span className="truncate max-w-[120px]">{stage.stage}</span>
                        </div>
                        <span className="text-muted-foreground">{stage.hours}h</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Chart */}
                <div className="px-4 pb-4">
                  <div className="h-4 rounded-full overflow-hidden flex">
                    {stages.map((stage: any) => (
                      <div
                        key={stage.stage}
                        className={cn(stageColors[stage.stage] || 'bg-gray-400')}
                        style={{ width: `${(stage.hours / estimate.total_hours) * 100}%` }}
                        title={`${stage.stage}: ${stage.hours}h`}
                      />
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-muted/30 border-t text-xs text-muted-foreground">
                  Created {new Date(estimate.created_at).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Summary */}
        <div className="mt-8 p-6 bg-card rounded-2xl border shadow-card">
          <h3 className="font-bold text-lg mb-4">Comparison Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Time Range</h4>
              <p className="text-lg">
                <span className="text-primary font-bold">{formatDuration(Math.min(...estimates.map(e => e.total_weeks)))}</span>
                {' → '}
                <span className="text-primary font-bold">{formatDuration(Math.max(...estimates.map(e => e.total_weeks)))}</span>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Cost Range</h4>
              <p className="text-lg">
                <span className="text-accent font-bold">{formatCurrency(Math.min(...estimates.map(e => e.total_cost)))}</span>
                {' → '}
                <span className="text-accent font-bold">{formatCurrency(Math.max(...estimates.map(e => e.total_cost)))}</span>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Average</h4>
              <p className="text-lg">
                <span className="font-bold">{formatDuration(estimates.reduce((sum, e) => sum + e.total_weeks, 0) / estimates.length)}</span>
                {' / '}
                <span className="font-bold">{formatCurrency(estimates.reduce((sum, e) => sum + e.total_cost, 0) / estimates.length)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
