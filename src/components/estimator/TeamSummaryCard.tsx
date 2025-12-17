import { Users, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamComposition, getTotalTeamCount, getProductivityMultiplier, getMonthlyTeamCost, getAverageExperienceLevel, EXPERIENCE_LEVELS } from '@/types/estimator';
import { cn } from '@/lib/utils';

interface TeamSummaryCardProps {
  teamComposition: TeamComposition;
  className?: string;
}

export function TeamSummaryCard({ teamComposition, className }: TeamSummaryCardProps) {
  const totalCount = getTotalTeamCount(teamComposition);
  const productivityMultiplier = getProductivityMultiplier(teamComposition);
  const monthlyTeamCost = getMonthlyTeamCost(teamComposition);
  const avgExperience = getAverageExperienceLevel(teamComposition);
  const avgExpLabel = EXPERIENCE_LEVELS.find(e => e.value === avgExperience)?.label || 'Mid-Level';

  // Calculate distribution percentages
  const distribution = [
    { label: 'Junior', count: teamComposition.junior.count, color: 'bg-blue-500' },
    { label: 'Mid', count: teamComposition.mid.count, color: 'bg-green-500' },
    { label: 'Senior', count: teamComposition.senior.count, color: 'bg-yellow-500' },
    { label: 'Lead', count: teamComposition.lead.count, color: 'bg-orange-500' },
    { label: 'Architect', count: teamComposition.architect.count, color: 'bg-purple-500' },
  ].filter(d => d.count > 0);

  const customRolesCount = teamComposition.customRoles.reduce((sum, r) => sum + r.count, 0);
  if (customRolesCount > 0) {
    distribution.push({ label: 'Custom', count: customRolesCount, color: 'bg-pink-500' });
  }

  if (totalCount === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Add team members to see summary</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3 bg-primary/5">
        <CardTitle className="flex items-center gap-2 text-base">
          <PieChart className="w-5 h-5 text-primary" />
          Team Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Main Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{totalCount}</p>
            <p className="text-xs text-muted-foreground">Team Members</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{productivityMultiplier}x</p>
            <p className="text-xs text-muted-foreground">Productivity</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <DollarSign className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">${(monthlyTeamCost / 1000).toFixed(0)}k</p>
            <p className="text-xs text-muted-foreground">Monthly Cost</p>
          </div>
        </div>

        {/* Experience Distribution Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Experience Distribution</span>
            <span className="text-xs text-muted-foreground">Avg: {avgExpLabel}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-muted flex">
            {distribution.map((d, i) => (
              <div
                key={d.label}
                className={cn("h-full transition-all", d.color)}
                style={{ width: `${(d.count / totalCount) * 100}%` }}
                title={`${d.label}: ${d.count}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {distribution.map(d => (
              <div key={d.label} className="flex items-center gap-1 text-xs">
                <div className={cn("w-2 h-2 rounded-full", d.color)} />
                <span>{d.label}: {d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Productivity Insight */}
        <div className="p-3 rounded-lg bg-muted/30 text-sm">
          {productivityMultiplier > 1.2 ? (
            <p className="text-amber-600 dark:text-amber-400">
              ⚠️ Junior-heavy team may take longer but costs less per hour.
            </p>
          ) : productivityMultiplier < 0.95 ? (
            <p className="text-green-600 dark:text-green-400">
              ✓ Senior-heavy team delivers faster with higher quality.
            </p>
          ) : (
            <p className="text-muted-foreground">
              ℹ️ Balanced team with good cost-efficiency ratio.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}