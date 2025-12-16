import { useMemo } from 'react';
import { DollarSign, TrendingUp, Calendar, PiggyBank, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ResourceAllocation } from '@/types/estimator';
import { formatCurrency } from '@/lib/estimationEngine';

interface BudgetForecastProps {
  totalCost: number;
  totalWeeks: number;
  resourceAllocation: ResourceAllocation | null;
  stages: Array<{ stage: string; cost: number; weeks: number }>;
}

// Average monthly salary rates by role (USD)
const MONTHLY_SALARY_RATES = {
  frontend: 8500,
  backend: 9500,
  qa: 7000,
  pm: 9000,
  devops: 9500,
};

export function BudgetForecast({ totalCost, totalWeeks, resourceAllocation, stages }: BudgetForecastProps) {
  const forecast = useMemo(() => {
    const durationMonths = resourceAllocation?.desiredDurationMonths || Math.ceil(totalWeeks / 4.33);
    
    // Calculate monthly team costs
    const staffing = resourceAllocation?.staffing || {
      frontend: 2,
      backend: 2,
      qa: 1,
      pm: 1,
      devops: 1,
      total: 7,
    };

    const monthlyTeamCost = 
      (staffing.frontend * MONTHLY_SALARY_RATES.frontend) +
      (staffing.backend * MONTHLY_SALARY_RATES.backend) +
      (staffing.qa * MONTHLY_SALARY_RATES.qa) +
      (staffing.pm * MONTHLY_SALARY_RATES.pm) +
      (staffing.devops * MONTHLY_SALARY_RATES.devops);

    const monthlyInfraCost = resourceAllocation?.hardwareCosts?.totalMonthly || 500;
    const monthlyTotalBurn = monthlyTeamCost + monthlyInfraCost;

    // Generate monthly breakdown
    const monthlyData = [];
    let cumulativeCost = 0;
    
    for (let month = 1; month <= durationMonths; month++) {
      cumulativeCost += monthlyTotalBurn;
      
      // Apply ramp-up/ramp-down factors
      let adjustedBurn = monthlyTotalBurn;
      if (month === 1) adjustedBurn *= 0.7; // Ramp up
      if (month === durationMonths) adjustedBurn *= 0.8; // Ramp down
      
      monthlyData.push({
        month: `Month ${month}`,
        teamCost: Math.round(adjustedBurn - monthlyInfraCost),
        infraCost: monthlyInfraCost,
        totalBurn: Math.round(adjustedBurn),
        cumulative: Math.round(cumulativeCost),
      });
    }

    // Calculate contingency
    const contingencyPercent = 15;
    const contingencyAmount = Math.round(cumulativeCost * (contingencyPercent / 100));
    const totalBudget = cumulativeCost + contingencyAmount;

    // Budget breakdown by category
    const budgetBreakdown = [
      { category: 'Team Salaries', amount: monthlyTeamCost * durationMonths, percent: 0 },
      { category: 'Infrastructure', amount: monthlyInfraCost * durationMonths, percent: 0 },
      { category: 'Contingency', amount: contingencyAmount, percent: contingencyPercent },
    ];
    
    const totalExContingency = budgetBreakdown[0].amount + budgetBreakdown[1].amount;
    budgetBreakdown[0].percent = Math.round((budgetBreakdown[0].amount / totalBudget) * 100);
    budgetBreakdown[1].percent = Math.round((budgetBreakdown[1].amount / totalBudget) * 100);

    return {
      durationMonths,
      monthlyTeamCost,
      monthlyInfraCost,
      monthlyTotalBurn,
      monthlyData,
      contingencyAmount,
      totalBudget,
      budgetBreakdown,
      avgBurnRate: Math.round(cumulativeCost / durationMonths),
    };
  }, [totalCost, totalWeeks, resourceAllocation]);

  const stageDistribution = useMemo(() => {
    return stages.map(stage => ({
      name: stage.stage,
      cost: stage.cost,
    }));
  }, [stages]);

  return (
    <Card className="border-2 border-green-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-green-500" />
            Budget Forecast
          </div>
          <Badge className="bg-green-500 text-lg px-3">
            {formatCurrency(forecast.totalBudget)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-500/10 rounded-lg text-center border border-blue-500/20">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(forecast.monthlyTotalBurn)}</div>
            <div className="text-sm text-muted-foreground">Monthly Burn Rate</div>
          </div>
          
          <div className="p-4 bg-green-500/10 rounded-lg text-center border border-green-500/20">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-green-600">{forecast.durationMonths}</div>
            <div className="text-sm text-muted-foreground">Months Duration</div>
          </div>
          
          <div className="p-4 bg-purple-500/10 rounded-lg text-center border border-purple-500/20">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(forecast.monthlyTeamCost)}</div>
            <div className="text-sm text-muted-foreground">Team Cost/Month</div>
          </div>
          
          <div className="p-4 bg-orange-500/10 rounded-lg text-center border border-orange-500/20">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(forecast.contingencyAmount)}</div>
            <div className="text-sm text-muted-foreground">Contingency (15%)</div>
          </div>
        </div>

        {/* Cumulative Cost Chart */}
        <div>
          <h4 className="font-semibold mb-4">Cumulative Budget Over Time</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.3}
                  name="Cumulative Cost"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Burn Breakdown */}
        <div>
          <h4 className="font-semibold mb-4">Monthly Burn Rate Breakdown</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecast.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Bar dataKey="teamCost" stackId="a" fill="#3b82f6" name="Team" />
                <Bar dataKey="infraCost" stackId="a" fill="#10b981" name="Infrastructure" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Breakdown */}
        <div>
          <h4 className="font-semibold mb-4">Budget Breakdown</h4>
          <div className="space-y-3">
            {forecast.budgetBreakdown.map((item) => (
              <div key={item.category} className="flex items-center gap-4">
                <div className="w-40 font-medium">{item.category}</div>
                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      item.category === 'Team Salaries' ? 'bg-blue-500' :
                      item.category === 'Infrastructure' ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <div className="w-24 text-right font-medium">{formatCurrency(item.amount)}</div>
                <div className="w-12 text-right text-muted-foreground">{item.percent}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost by Stage */}
        <div>
          <h4 className="font-semibold mb-4">Cost Distribution by Stage</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="cost" fill="hsl(var(--primary))" name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <h5 className="font-semibold mb-3">Budget Summary</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Base Budget:</span>
              <div className="font-medium">{formatCurrency(forecast.totalBudget - forecast.contingencyAmount)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Contingency:</span>
              <div className="font-medium">{formatCurrency(forecast.contingencyAmount)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Total Budget:</span>
              <div className="font-bold text-primary">{formatCurrency(forecast.totalBudget)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Burn/Month:</span>
              <div className="font-medium">{formatCurrency(forecast.avgBurnRate)}</div>
            </div>
          </div>
        </div>

        {/* Warning for high budgets */}
        {forecast.totalBudget > 1000000 && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-yellow-700">High Budget Project</h5>
                <p className="text-sm text-muted-foreground mt-1">
                  This project exceeds $1M. Consider breaking into phases, implementing strict change control,
                  and establishing regular financial reviews. Ensure executive sponsorship and clear governance.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
