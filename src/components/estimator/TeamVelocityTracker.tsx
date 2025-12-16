import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Clock, CheckCircle2, Target, BarChart3, Edit2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTeamVelocity, VelocityRecord } from '@/hooks/useTeamVelocity';
import { toast } from 'sonner';

export function TeamVelocityTracker() {
  const { velocityRecords, stats, loading, updateActualTime } = useTeamVelocity();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHours, setEditHours] = useState('');
  const [editWeeks, setEditWeeks] = useState('');

  const handleStartEdit = (record: VelocityRecord) => {
    setEditingId(record.id);
    setEditHours(record.actualHours?.toString() || '');
    setEditWeeks(record.actualWeeks?.toString() || '');
  };

  const handleSaveActual = async (recordId: string) => {
    const hours = parseFloat(editHours);
    const weeks = parseFloat(editWeeks);
    
    if (isNaN(hours) || isNaN(weeks) || hours <= 0 || weeks <= 0) {
      toast.error('Please enter valid hours and weeks');
      return;
    }

    const success = await updateActualTime(recordId, hours, weeks);
    if (success) {
      toast.success('Actual time recorded');
      setEditingId(null);
    } else {
      toast.error('Failed to save');
    }
  };

  const getTrendIcon = () => {
    if (!stats) return <Minus className="w-4 h-4" />;
    switch (stats.trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getAccuracyColor = (accuracy: number | null) => {
    if (accuracy === null) return 'text-muted-foreground';
    if (accuracy >= 90) return 'text-green-500';
    if (accuracy >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getVarianceColor = (variance: number | null) => {
    if (variance === null) return 'bg-muted';
    const absVariance = Math.abs(variance);
    if (absVariance <= 10) return 'bg-green-500/20 text-green-700';
    if (absVariance <= 25) return 'bg-yellow-500/20 text-yellow-700';
    return 'bg-red-500/20 text-red-700';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <BarChart3 className="w-4 h-4" />
              Total Projects
            </div>
            <div className="text-2xl font-bold mt-1">{stats?.totalProjects || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </div>
            <div className="text-2xl font-bold mt-1">{stats?.completedProjects || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Target className="w-4 h-4" />
              Avg Accuracy
            </div>
            <div className={`text-2xl font-bold mt-1 ${getAccuracyColor(stats?.averageAccuracy || 0)}`}>
              {stats?.averageAccuracy || 0}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              {getTrendIcon()}
              Trend
            </div>
            <div className="text-2xl font-bold mt-1 capitalize">{stats?.trend || 'N/A'}</div>
            <div className="text-xs text-muted-foreground">
              Recent: {stats?.recentAccuracy || 0}% accuracy
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Velocity Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Project Velocity History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {velocityRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No projects tracked yet. Save an estimate to start tracking velocity.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Estimated</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {velocityRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.projectName}</TableCell>
                    <TableCell>
                      {record.estimatedHours}h / {record.estimatedWeeks}w
                    </TableCell>
                    <TableCell>
                      {editingId === record.id ? (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={editHours}
                            onChange={(e) => setEditHours(e.target.value)}
                            placeholder="Hours"
                            className="w-20 h-8"
                          />
                          <Input
                            type="number"
                            value={editWeeks}
                            onChange={(e) => setEditWeeks(e.target.value)}
                            placeholder="Weeks"
                            className="w-20 h-8"
                          />
                        </div>
                      ) : record.actualHours ? (
                        `${record.actualHours}h / ${record.actualWeeks}w`
                      ) : (
                        <span className="text-muted-foreground">Not recorded</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.variancePercent !== null ? (
                        <Badge className={getVarianceColor(record.variancePercent)}>
                          {record.variancePercent > 0 ? '+' : ''}{record.variancePercent.toFixed(1)}%
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {record.accuracy !== null ? (
                        <div className="flex items-center gap-2">
                          <Progress value={record.accuracy} className="w-16 h-2" />
                          <span className={getAccuracyColor(record.accuracy)}>
                            {record.accuracy.toFixed(0)}%
                          </span>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.status === 'completed' ? 'default' : 'secondary'}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingId === record.id ? (
                        <Button size="sm" onClick={() => handleSaveActual(record.id)}>
                          <Save className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => handleStartEdit(record)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Accuracy Improvement Tips */}
      {stats && stats.averageAccuracy < 80 && stats.completedProjects >= 3 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-4">
            <h4 className="font-semibold text-yellow-700 mb-2">Tips to Improve Accuracy</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {stats.averageVariance > 20 && (
                <li>• Your estimates tend to be {stats.averageVariance > 0 ? 'under' : 'over'} by {Math.abs(stats.averageVariance).toFixed(0)}%. Consider adjusting your baseline.</li>
              )}
              <li>• Break down complex features into smaller, more predictable tasks.</li>
              <li>• Include buffer time for unexpected issues and scope changes.</li>
              <li>• Review historical data before creating new estimates.</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
