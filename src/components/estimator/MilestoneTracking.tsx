import { useState, useMemo } from 'react';
import { Flag, Plus, Trash2, CheckCircle2, Clock, AlertTriangle, Calendar, Edit2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StageEstimate } from '@/types/estimator';

interface Milestone {
  id: string;
  name: string;
  stage: string;
  plannedDate: string;
  actualDate: string | null;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  notes: string;
}

interface MilestoneTrackingProps {
  stages: StageEstimate[];
  totalWeeks: number;
  projectStartDate?: Date;
}

const STATUS_CONFIG = {
  pending: { color: 'bg-gray-500/20 text-gray-700', icon: Clock },
  'in-progress': { color: 'bg-blue-500/20 text-blue-700', icon: Clock },
  completed: { color: 'bg-green-500/20 text-green-700', icon: CheckCircle2 },
  delayed: { color: 'bg-red-500/20 text-red-700', icon: AlertTriangle },
};

export function MilestoneTracking({ stages, totalWeeks, projectStartDate }: MilestoneTrackingProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    stage: '',
    plannedDate: '',
  });

  // Generate default milestones from stages
  const generateDefaultMilestones = () => {
    const startDate = projectStartDate || new Date();
    let cumulativeWeeks = 0;
    
    const defaultMilestones: Milestone[] = stages.map((stage, index) => {
      cumulativeWeeks += stage.weeks;
      const plannedDate = new Date(startDate);
      plannedDate.setDate(plannedDate.getDate() + Math.round(cumulativeWeeks * 7));
      
      return {
        id: `milestone-${stage.stage}-${Date.now()}-${index}`,
        name: `${stage.stage} Complete`,
        stage: stage.stage,
        plannedDate: plannedDate.toISOString().split('T')[0],
        actualDate: null,
        status: 'pending' as const,
        notes: '',
      };
    });
    
    setMilestones(defaultMilestones);
  };

  const addMilestone = () => {
    if (!newMilestone.name || !newMilestone.plannedDate) return;
    
    const milestone: Milestone = {
      id: `milestone-${Date.now()}`,
      name: newMilestone.name,
      stage: newMilestone.stage || 'general',
      plannedDate: newMilestone.plannedDate,
      actualDate: null,
      status: 'pending',
      notes: '',
    };
    
    setMilestones(prev => [...prev, milestone].sort((a, b) => 
      new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime()
    ));
    setNewMilestone({ name: '', stage: '', plannedDate: '' });
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    setMilestones(prev => prev.map(m => {
      if (m.id !== id) return m;
      const updated = { ...m, ...updates };
      
      // Auto-calculate status based on dates
      if (updates.actualDate && !updates.status) {
        const planned = new Date(m.plannedDate);
        const actual = new Date(updates.actualDate);
        updated.status = actual > planned ? 'delayed' : 'completed';
      }
      
      return updated;
    }));
  };

  const removeMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const markComplete = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    updateMilestone(id, { actualDate: today, status: 'completed' });
  };

  // Calculate progress and alerts
  const progress = useMemo(() => {
    const completed = milestones.filter(m => m.status === 'completed').length;
    const delayed = milestones.filter(m => m.status === 'delayed').length;
    const total = milestones.length;
    
    // Check for upcoming milestones
    const today = new Date();
    const upcomingAlerts = milestones.filter(m => {
      if (m.status === 'completed' || m.status === 'delayed') return false;
      const planned = new Date(m.plannedDate);
      const daysUntil = Math.ceil((planned.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil >= 0;
    });

    // Check for overdue milestones
    const overdue = milestones.filter(m => {
      if (m.status === 'completed' || m.status === 'delayed') return false;
      const planned = new Date(m.plannedDate);
      return planned < today;
    });

    return {
      completed,
      delayed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      upcomingAlerts,
      overdue,
    };
  }, [milestones]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <Card className="border-2 border-cyan-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-cyan-500" />
            Milestone Tracking
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{progress.completed}/{progress.total} completed</Badge>
            {progress.delayed > 0 && (
              <Badge className="bg-red-500">{progress.delayed} delayed</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-3" />
        </div>

        {/* Alerts */}
        {(progress.upcomingAlerts.length > 0 || progress.overdue.length > 0) && (
          <div className="space-y-2">
            {progress.overdue.map(m => (
              <div key={m.id} className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="font-medium text-red-700">Overdue:</span>
                <span>{m.name}</span>
                <span className="text-muted-foreground">was due {formatDate(m.plannedDate)}</span>
                <Button size="sm" variant="outline" className="ml-auto" onClick={() => markComplete(m.id)}>
                  Mark Complete
                </Button>
              </div>
            ))}
            {progress.upcomingAlerts.map(m => (
              <div key={m.id} className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-yellow-700">Upcoming:</span>
                <span>{m.name}</span>
                <span className="text-muted-foreground">due in {getDaysUntil(m.plannedDate)} days</span>
              </div>
            ))}
          </div>
        )}

        {/* Add Milestone */}
        <div className="flex gap-3 flex-wrap">
          <Input
            placeholder="Milestone name..."
            value={newMilestone.name}
            onChange={(e) => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
            className="flex-1 min-w-[200px]"
          />
          <Select 
            value={newMilestone.stage}
            onValueChange={(v) => setNewMilestone(prev => ({ ...prev, stage: v }))}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              {stages.map(s => (
                <SelectItem key={s.stage} value={s.stage}>{s.stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={newMilestone.plannedDate}
            onChange={(e) => setNewMilestone(prev => ({ ...prev, plannedDate: e.target.value }))}
            className="w-40"
          />
          <Button onClick={addMilestone} disabled={!newMilestone.name || !newMilestone.plannedDate}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Milestones List */}
        {milestones.length === 0 ? (
          <div className="text-center py-8">
            <Flag className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No milestones defined yet.</p>
            <Button variant="outline" onClick={generateDefaultMilestones}>
              <Calendar className="w-4 h-4 mr-2" />
              Generate from Stages
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone, index) => {
              const StatusIcon = STATUS_CONFIG[milestone.status].icon;
              const isEditing = editingId === milestone.id;
              const daysUntil = getDaysUntil(milestone.plannedDate);
              
              return (
                <div 
                  key={milestone.id}
                  className={`p-4 rounded-lg border ${
                    milestone.status === 'completed' ? 'bg-green-500/5 border-green-500/20' :
                    milestone.status === 'delayed' ? 'bg-red-500/5 border-red-500/20' :
                    daysUntil < 0 ? 'bg-red-500/10 border-red-500/30' :
                    daysUntil <= 7 ? 'bg-yellow-500/5 border-yellow-500/20' :
                    'bg-muted/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${STATUS_CONFIG[milestone.status].color}`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      {index < milestones.length - 1 && (
                        <div className="w-0.5 h-8 bg-border mt-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{milestone.name}</h4>
                          <Badge variant="outline" className="text-xs">{milestone.stage}</Badge>
                          <Badge className={STATUS_CONFIG[milestone.status].color}>
                            {milestone.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {milestone.status !== 'completed' && (
                            <Button size="sm" variant="outline" onClick={() => markComplete(milestone.id)}>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setEditingId(isEditing ? null : milestone.id)}
                          >
                            {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => removeMilestone(milestone.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Planned: {formatDate(milestone.plannedDate)}</span>
                        </div>
                        {milestone.actualDate && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Completed: {formatDate(milestone.actualDate)}</span>
                          </div>
                        )}
                        {!milestone.actualDate && milestone.status !== 'completed' && (
                          <span className={daysUntil < 0 ? 'text-red-500 font-medium' : daysUntil <= 7 ? 'text-yellow-600' : ''}>
                            {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : 
                             daysUntil === 0 ? 'Due today' : 
                             `${daysUntil} days remaining`}
                          </span>
                        )}
                      </div>

                      {/* Edit Form */}
                      {isEditing && (
                        <div className="mt-3 p-3 bg-background rounded border space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground">Planned Date</label>
                              <Input
                                type="date"
                                value={milestone.plannedDate}
                                onChange={(e) => updateMilestone(milestone.id, { plannedDate: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Actual Completion</label>
                              <Input
                                type="date"
                                value={milestone.actualDate || ''}
                                onChange={(e) => updateMilestone(milestone.id, { actualDate: e.target.value || null })}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Status</label>
                            <Select 
                              value={milestone.status}
                              onValueChange={(v: Milestone['status']) => updateMilestone(milestone.id, { status: v })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="delayed">Delayed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Notes</label>
                            <Input
                              value={milestone.notes}
                              onChange={(e) => updateMilestone(milestone.id, { notes: e.target.value })}
                              placeholder="Add notes..."
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}

                      {milestone.notes && !isEditing && (
                        <p className="mt-2 text-sm text-muted-foreground italic">{milestone.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {milestones.length > 0 && (
          <div className="grid grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold">{progress.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{progress.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{milestones.filter(m => m.status === 'in-progress').length}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{progress.delayed + progress.overdue.length}</div>
              <div className="text-sm text-muted-foreground">At Risk</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
