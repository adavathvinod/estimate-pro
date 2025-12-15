import { Calendar, Layers } from 'lucide-react';
import { StageEstimate } from '@/types/estimator';
import { formatCurrency } from '@/lib/estimationEngine';

interface SprintBreakdownProps {
  stages: StageEstimate[];
  totalWeeks: number;
}

interface Sprint {
  number: number;
  name: string;
  weeks: number;
  hours: number;
  cost: number;
  stages: string[];
}

export function SprintBreakdown({ stages, totalWeeks }: SprintBreakdownProps) {
  // Calculate sprints (2-week sprints)
  const sprintDuration = 2; // weeks
  const totalSprints = Math.ceil(totalWeeks / sprintDuration);
  
  const sprints: Sprint[] = [];
  let remainingHours = stages.reduce((sum, s) => sum + s.hours, 0);
  let stageIndex = 0;
  let stageRemainingHours = stages[0]?.hours || 0;
  
  for (let i = 0; i < totalSprints; i++) {
    const sprintHours = Math.min(remainingHours, 80); // 2 weeks * 40 hours
    const sprintStages: string[] = [];
    let hoursInSprint = sprintHours;
    
    while (hoursInSprint > 0 && stageIndex < stages.length) {
      if (!sprintStages.includes(stages[stageIndex].stage)) {
        sprintStages.push(stages[stageIndex].stage);
      }
      
      if (stageRemainingHours <= hoursInSprint) {
        hoursInSprint -= stageRemainingHours;
        stageIndex++;
        stageRemainingHours = stages[stageIndex]?.hours || 0;
      } else {
        stageRemainingHours -= hoursInSprint;
        hoursInSprint = 0;
      }
    }
    
    const avgCostPerHour = stages.reduce((sum, s) => sum + s.cost, 0) / stages.reduce((sum, s) => sum + s.hours, 0);
    
    sprints.push({
      number: i + 1,
      name: getSprintName(i, totalSprints),
      weeks: Math.min(sprintDuration, totalWeeks - i * sprintDuration),
      hours: sprintHours,
      cost: Math.round(sprintHours * avgCostPerHour),
      stages: sprintStages,
    });
    
    remainingHours -= sprintHours;
  }

  return (
    <div className="p-6 bg-card rounded-xl border">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Layers className="w-5 h-5 text-primary" />
        Sprint Breakdown
      </h3>
      
      <div className="mb-4 p-3 bg-muted rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Sprints</span>
          <span className="font-bold text-lg">{totalSprints}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-muted-foreground">Sprint Duration</span>
          <span className="font-medium">2 weeks each</span>
        </div>
      </div>

      <div className="space-y-3">
        {sprints.map((sprint) => (
          <div 
            key={sprint.number} 
            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {sprint.number}
                </div>
                <div>
                  <span className="font-medium">{sprint.name}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{sprint.weeks} weeks</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{sprint.hours}h</div>
                <div className="text-sm text-muted-foreground">{formatCurrency(sprint.cost)}</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {sprint.stages.map((stage) => (
                <span 
                  key={stage} 
                  className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
                >
                  {stage.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getSprintName(index: number, total: number): string {
  if (index === 0) return 'Discovery & Setup';
  if (index === total - 1) return 'Launch & Deploy';
  if (index < total / 3) return 'Foundation';
  if (index < (total * 2) / 3) return 'Core Development';
  return 'Polish & Testing';
}
