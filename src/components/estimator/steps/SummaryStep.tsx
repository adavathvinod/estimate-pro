import { FileText, Clock, DollarSign, Users, Wrench, Download } from 'lucide-react';
import { StepCard } from '../StepCard';
import { Button } from '@/components/ui/button';
import { ProjectEstimate } from '@/types/estimator';
import { formatCurrency, formatDuration } from '@/lib/estimationEngine';
import { cn } from '@/lib/utils';

interface SummaryStepProps {
  estimate: ProjectEstimate;
  onDownload: () => void;
  onStartNew: () => void;
}

const stageColors: Record<string, string> = {
  'Project Management': 'bg-stage-pm',
  'UX/UI Design': 'bg-stage-design',
  'Frontend Development': 'bg-stage-frontend',
  'Backend Development': 'bg-stage-backend',
  'Quality Assurance': 'bg-stage-qa',
  'Deployment & Support': 'bg-stage-deploy',
};

export function SummaryStep({ estimate, onDownload, onStartNew }: SummaryStepProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-6 shadow-card border border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-muted-foreground font-medium">Total Time</span>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {formatDuration(estimate.totalWeeks)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            ~{estimate.totalHours} hours total
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card border border-accent/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-muted-foreground font-medium">Total Cost</span>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(estimate.totalCost)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Based on industry standard rates
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Project Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Project Name</span>
            <p className="font-medium">{estimate.projectName}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Type</span>
            <p className="font-medium capitalize">{estimate.projectType.replace('-', ' ')}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Platform</span>
            <p className="font-medium capitalize">{estimate.platform.replace('-', ' ')}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Complexity</span>
            <p className="font-medium capitalize">{estimate.complexity}</p>
          </div>
        </div>
      </div>

      {/* Stage Breakdown */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Resource Allocation by Stage</h3>
        <div className="space-y-4">
          {estimate.stages.map((stage) => (
            <div key={stage.stage} className="border border-border rounded-xl p-4 hover:shadow-card transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", stageColors[stage.stage])} />
                  <span className="font-semibold">{stage.stage}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatDuration(stage.weeks)}</div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(stage.cost)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{stage.hours} hours</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{stage.personnel} person, {stage.experience}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wrench className="w-4 h-4" />
                  <span className="truncate">{stage.tools.join(', ')}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all", stageColors[stage.stage])}
                  style={{ width: `${(stage.hours / estimate.totalHours) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="hero" size="lg" className="flex-1" onClick={onDownload}>
          <Download className="w-5 h-5" />
          Download Report
        </Button>
        <Button variant="outline" size="lg" className="flex-1" onClick={onStartNew}>
          Start New Estimate
        </Button>
      </div>
    </div>
  );
}
