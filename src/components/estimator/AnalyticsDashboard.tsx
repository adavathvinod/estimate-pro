import { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Clock, DollarSign, Calendar, RefreshCw, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { useEstimateStorage } from '@/hooks/useEstimateStorage';
import { formatCurrency, formatDuration } from '@/lib/estimationEngine';

interface EstimateRecord {
  id: string;
  project_name: string;
  project_type: string;
  platform: string;
  complexity: string;
  total_hours: number;
  total_weeks: number;
  total_cost: number;
  created_at: string;
  stage_estimates: any;
}

export function AnalyticsDashboard() {
  const [estimates, setEstimates] = useState<EstimateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'quarter' | 'all'>('all');
  const { loadEstimates } = useEstimateStorage();

  useEffect(() => {
    loadEstimates().then(data => {
      setEstimates(data || []);
      setLoading(false);
    });
  }, []);

  const filteredEstimates = useMemo(() => {
    if (timeFilter === 'all') return estimates;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeFilter) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3);
        break;
    }
    
    return estimates.filter(e => new Date(e.created_at) >= filterDate);
  }, [estimates, timeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredEstimates.length === 0) {
      return {
        totalProjects: 0,
        avgHours: 0,
        avgCost: 0,
        avgWeeks: 0,
        totalValue: 0,
      };
    }

    const totalHours = filteredEstimates.reduce((sum, e) => sum + e.total_hours, 0);
    const totalCost = filteredEstimates.reduce((sum, e) => sum + e.total_cost, 0);
    const totalWeeks = filteredEstimates.reduce((sum, e) => sum + e.total_weeks, 0);

    return {
      totalProjects: filteredEstimates.length,
      avgHours: Math.round(totalHours / filteredEstimates.length),
      avgCost: Math.round(totalCost / filteredEstimates.length),
      avgWeeks: Math.round((totalWeeks / filteredEstimates.length) * 10) / 10,
      totalValue: totalCost,
    };
  }, [filteredEstimates]);

  // Project type distribution
  const projectTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEstimates.forEach(e => {
      counts[e.project_type] = (counts[e.project_type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));
  }, [filteredEstimates]);

  // Complexity distribution
  const complexityData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEstimates.forEach(e => {
      counts[e.complexity] = (counts[e.complexity] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [filteredEstimates]);

  // Timeline data
  const timelineData = useMemo(() => {
    const sorted = [...filteredEstimates].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    return sorted.slice(-10).map(e => ({
      name: e.project_name.substring(0, 15),
      hours: e.total_hours,
      cost: e.total_cost / 1000,
      date: new Date(e.created_at).toLocaleDateString(),
    }));
  }, [filteredEstimates]);

  // Cost by project type
  const costByTypeData = useMemo(() => {
    const totals: Record<string, { hours: number; cost: number; count: number }> = {};
    filteredEstimates.forEach(e => {
      if (!totals[e.project_type]) {
        totals[e.project_type] = { hours: 0, cost: 0, count: 0 };
      }
      totals[e.project_type].hours += e.total_hours;
      totals[e.project_type].cost += e.total_cost;
      totals[e.project_type].count += 1;
    });
    
    return Object.entries(totals).map(([type, data]) => ({
      name: type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      avgHours: Math.round(data.hours / data.count),
      avgCost: Math.round(data.cost / data.count),
    }));
  }, [filteredEstimates]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Analytics Dashboard</h2>
        </div>
        <Select value={timeFilter} onValueChange={(v: any) => setTimeFilter(v)}>
          <SelectTrigger className="w-[150px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">Total Projects</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalProjects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Avg Hours</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgHours}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Avg Duration</span>
            </div>
            <p className="text-2xl font-bold">{formatDuration(stats.avgWeeks)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Total Value</span>
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalValue)}</p>
          </CardContent>
        </Card>
      </div>

      {filteredEstimates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Data Yet</h3>
            <p className="text-muted-foreground">
              Save some estimates to see analytics here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hours & Cost Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Estimates</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis yAxisId="left" fontSize={10} />
                  <YAxis yAxisId="right" orientation="right" fontSize={10} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="hours" fill="#3b82f6" name="Hours" />
                  <Bar yAxisId="right" dataKey="cost" fill="#10b981" name="Cost ($K)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Project Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={projectTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cost by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Average by Project Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={costByTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={10} />
                  <YAxis dataKey="name" type="category" fontSize={10} width={80} />
                  <Tooltip formatter={(value: number, name: string) => 
                    name === 'avgCost' ? formatCurrency(value) : `${value}h`
                  } />
                  <Legend />
                  <Bar dataKey="avgHours" fill="#3b82f6" name="Avg Hours" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Complexity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Complexity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={complexityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#eab308" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Projects Table */}
      {filteredEstimates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Estimates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Project</th>
                    <th className="text-left py-2 px-3 font-medium">Type</th>
                    <th className="text-left py-2 px-3 font-medium">Complexity</th>
                    <th className="text-right py-2 px-3 font-medium">Hours</th>
                    <th className="text-right py-2 px-3 font-medium">Cost</th>
                    <th className="text-right py-2 px-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEstimates.slice(0, 10).map(est => (
                    <tr key={est.id} className="border-b">
                      <td className="py-2 px-3 font-medium">{est.project_name}</td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="capitalize text-xs">
                          {est.project_type.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <Badge 
                          variant="outline" 
                          className={
                            est.complexity === 'simple' ? 'bg-emerald-100 text-emerald-700' :
                            est.complexity === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }
                        >
                          {est.complexity}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-right">{est.total_hours}h</td>
                      <td className="py-2 px-3 text-right font-medium text-primary">
                        {formatCurrency(est.total_cost)}
                      </td>
                      <td className="py-2 px-3 text-right text-muted-foreground">
                        {new Date(est.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
