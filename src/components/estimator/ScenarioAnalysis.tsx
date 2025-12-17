import { useState, useMemo } from 'react';
import { GitCompare, Plus, Trash2, Copy, Settings2, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ProjectFormData, ComplexityLevel, ExperienceLevel, Platform, EXPERIENCE_LEVELS, TeamComposition, defaultTeamComposition } from '@/types/estimator';
import { calculateEstimate, formatCurrency, formatDuration, getTeamHeadcount, getMonthlyTeamCost } from '@/lib/estimationEngine';

interface Scenario {
  id: string;
  name: string;
  config: Partial<ProjectFormData>;
  teamOverride?: Partial<TeamComposition>;
  estimate: {
    totalHours: number;
    totalWeeks: number;
    totalCost: number;
    teamSize?: number;
    monthlyCost?: number;
  };
}

interface ScenarioAnalysisProps {
  baseFormData: ProjectFormData;
}

const COMPLEXITY_OPTIONS: ComplexityLevel[] = ['simple', 'medium', 'complex'];
const EXPERIENCE_OPTIONS: ExperienceLevel[] = ['junior', 'mid', 'senior', 'lead', 'architect'];
const PLATFORM_OPTIONS: Platform[] = ['web', 'android', 'ios', 'linux-server', 'cross-platform'];

// Team configuration presets
const TEAM_PRESETS = {
  'all-senior': {
    name: 'All Senior Team',
    description: '3 seniors, faster delivery, higher cost',
    icon: '🏆',
    composition: {
      ...defaultTeamComposition,
      junior: { count: 0, hourlyRate: 30 },
      mid: { count: 0, hourlyRate: 60 },
      senior: { count: 3, hourlyRate: 100 },
      lead: { count: 0, hourlyRate: 150 },
      architect: { count: 0, hourlyRate: 250 },
    },
    experienceOverride: 'senior' as ExperienceLevel,
  },
  'budget': {
    name: 'Budget Team',
    description: '5 juniors + 1 lead, cost-effective',
    icon: '💰',
    composition: {
      ...defaultTeamComposition,
      junior: { count: 5, hourlyRate: 30 },
      mid: { count: 0, hourlyRate: 60 },
      senior: { count: 0, hourlyRate: 100 },
      lead: { count: 1, hourlyRate: 150 },
      architect: { count: 0, hourlyRate: 250 },
    },
    experienceOverride: 'junior' as ExperienceLevel,
  },
  'balanced': {
    name: 'Balanced Team',
    description: '2 juniors, 2 mid, 1 senior',
    icon: '⚖️',
    composition: {
      ...defaultTeamComposition,
      junior: { count: 2, hourlyRate: 30 },
      mid: { count: 2, hourlyRate: 60 },
      senior: { count: 1, hourlyRate: 100 },
      lead: { count: 0, hourlyRate: 150 },
      architect: { count: 0, hourlyRate: 250 },
    },
    experienceOverride: 'mid' as ExperienceLevel,
  },
  'enterprise': {
    name: 'Enterprise Team',
    description: '1 architect, 2 leads, 2 seniors',
    icon: '🏢',
    composition: {
      ...defaultTeamComposition,
      junior: { count: 0, hourlyRate: 30 },
      mid: { count: 0, hourlyRate: 60 },
      senior: { count: 2, hourlyRate: 100 },
      lead: { count: 2, hourlyRate: 150 },
      architect: { count: 1, hourlyRate: 250 },
    },
    experienceOverride: 'architect' as ExperienceLevel,
  },
};

export function ScenarioAnalysis({ baseFormData }: ScenarioAnalysisProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [newScenarioName, setNewScenarioName] = useState('');

  const baseTeamComposition = baseFormData.teamComposition || defaultTeamComposition;
  
  const baseEstimate = useMemo(() => {
    const est = calculateEstimate(baseFormData);
    const expMultiplier = EXPERIENCE_LEVELS.find(e => e.value === baseFormData.teamExperience)?.multiplier || 1;
    const platformMultiplier = 1 + ((baseFormData.platforms?.length || 1) - 1) * 0.2;
    return {
      totalHours: Math.round(est.totalHours * expMultiplier * platformMultiplier),
      totalWeeks: Math.round(est.totalWeeks * expMultiplier * platformMultiplier * 10) / 10,
      totalCost: Math.round(est.totalCost * expMultiplier * platformMultiplier),
      teamSize: getTeamHeadcount(baseTeamComposition),
      monthlyCost: getMonthlyTeamCost(baseTeamComposition),
    };
  }, [baseFormData, baseTeamComposition]);

  const calculateScenarioEstimate = (config: Partial<ProjectFormData>, teamOverride?: Partial<TeamComposition>) => {
    const mergedConfig = { ...baseFormData, ...config };
    const mergedTeam = teamOverride 
      ? { ...baseTeamComposition, ...teamOverride }
      : baseTeamComposition;
    
    const est = calculateEstimate(mergedConfig as ProjectFormData);
    const expMultiplier = EXPERIENCE_LEVELS.find(e => e.value === mergedConfig.teamExperience)?.multiplier || 1;
    const platformMultiplier = 1 + ((mergedConfig.platforms?.length || 1) - 1) * 0.2;
    
    return {
      totalHours: Math.round(est.totalHours * expMultiplier * platformMultiplier),
      totalWeeks: Math.round(est.totalWeeks * expMultiplier * platformMultiplier * 10) / 10,
      totalCost: Math.round(est.totalCost * expMultiplier * platformMultiplier),
      teamSize: getTeamHeadcount(mergedTeam),
      monthlyCost: getMonthlyTeamCost(mergedTeam),
    };
  };

  const addScenario = () => {
    const name = newScenarioName.trim() || `Scenario ${scenarios.length + 1}`;
    const newScenario: Scenario = {
      id: `scenario-${Date.now()}`,
      name,
      config: { ...baseFormData },
      estimate: { ...baseEstimate },
    };
    setScenarios(prev => [...prev, newScenario]);
    setNewScenarioName('');
  };

  const addPresetScenario = (presetKey: keyof typeof TEAM_PRESETS) => {
    const preset = TEAM_PRESETS[presetKey];
    const config = { ...baseFormData, teamExperience: preset.experienceOverride };
    const estimate = calculateScenarioEstimate(config, preset.composition);
    
    const newScenario: Scenario = {
      id: `scenario-${Date.now()}`,
      name: preset.name,
      config,
      teamOverride: preset.composition,
      estimate,
    };
    setScenarios(prev => [...prev, newScenario]);
  };

  const duplicateScenario = (scenario: Scenario) => {
    const newScenario: Scenario = {
      ...scenario,
      id: `scenario-${Date.now()}`,
      name: `${scenario.name} (Copy)`,
    };
    setScenarios(prev => [...prev, newScenario]);
  };

  const removeScenario = (id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
  };

  const updateScenarioConfig = (id: string, updates: Partial<ProjectFormData>) => {
    setScenarios(prev => prev.map(s => {
      if (s.id !== id) return s;
      
      const newConfig = { ...baseFormData, ...s.config, ...updates };
      const estimate = calculateScenarioEstimate(newConfig, s.teamOverride);
      
      return { ...s, config: newConfig, estimate };
    }));
  };

  const getDiffColor = (base: number, compare: number) => {
    const diff = ((compare - base) / base) * 100;
    if (diff < -5) return 'text-green-500';
    if (diff > 5) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getDiffBadge = (base: number, compare: number) => {
    if (base === 0) return null;
    const diff = ((compare - base) / base) * 100;
    if (Math.abs(diff) < 1) return null;
    return (
      <Badge 
        variant="outline" 
        className={diff > 0 ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}
      >
        {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
      </Badge>
    );
  };

  return (
    <Card className="border-2 border-indigo-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-500" />
            What-If Scenario Analysis
          </div>
          <Badge variant="outline">{scenarios.length} scenarios</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Scenario */}
        <div className="flex gap-3">
          <Input
            placeholder="Scenario name..."
            value={newScenarioName}
            onChange={(e) => setNewScenarioName(e.target.value)}
            className="flex-1"
          />
          <Button onClick={addScenario}>
            <Plus className="w-4 h-4 mr-1" />
            Add Scenario
          </Button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Configuration</th>
                <th className="p-3 text-center font-medium bg-primary/5 min-w-[150px]">
                  <div className="text-xs text-muted-foreground">BASELINE</div>
                  Current
                </th>
                {scenarios.map(s => (
                  <th key={s.id} className="p-3 text-center font-medium min-w-[180px]">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm">{s.name}</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => duplicateScenario(s)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeScenario(s.id)}>
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Complexity */}
              <tr className="border-b">
                <td className="p-3 text-sm font-medium">Complexity</td>
                <td className="p-3 text-center bg-primary/5">
                  <Badge variant="secondary">{baseFormData.complexity}</Badge>
                </td>
                {scenarios.map(s => (
                  <td key={s.id} className="p-3 text-center">
                    <Select 
                      value={(s.config.complexity as string) || baseFormData.complexity}
                      onValueChange={(v) => updateScenarioConfig(s.id, { complexity: v as ComplexityLevel })}
                    >
                      <SelectTrigger className="w-full h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPLEXITY_OPTIONS.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                ))}
              </tr>

              {/* Team Experience */}
              <tr className="border-b">
                <td className="p-3 text-sm font-medium">Team Experience</td>
                <td className="p-3 text-center bg-primary/5">
                  <Badge variant="secondary">{baseFormData.teamExperience}</Badge>
                </td>
                {scenarios.map(s => (
                  <td key={s.id} className="p-3 text-center">
                    <Select 
                      value={(s.config.teamExperience as string) || baseFormData.teamExperience}
                      onValueChange={(v) => updateScenarioConfig(s.id, { teamExperience: v as ExperienceLevel })}
                    >
                      <SelectTrigger className="w-full h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_OPTIONS.map(e => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                ))}
              </tr>

              {/* Screens */}
              <tr className="border-b">
                <td className="p-3 text-sm font-medium">Unique Screens</td>
                <td className="p-3 text-center bg-primary/5">{baseFormData.uniqueScreens}</td>
                {scenarios.map(s => (
                  <td key={s.id} className="p-3 text-center">
                    <Input
                      type="number"
                      value={s.config.uniqueScreens ?? baseFormData.uniqueScreens}
                      onChange={(e) => updateScenarioConfig(s.id, { uniqueScreens: parseInt(e.target.value) || 0 })}
                      className="w-full h-8 text-center"
                      min={1}
                    />
                  </td>
                ))}
              </tr>

              {/* API Integrations */}
              <tr className="border-b">
                <td className="p-3 text-sm font-medium">API Integrations</td>
                <td className="p-3 text-center bg-primary/5">{baseFormData.apiIntegrations}</td>
                {scenarios.map(s => (
                  <td key={s.id} className="p-3 text-center">
                    <Input
                      type="number"
                      value={s.config.apiIntegrations ?? baseFormData.apiIntegrations}
                      onChange={(e) => updateScenarioConfig(s.id, { apiIntegrations: parseInt(e.target.value) || 0 })}
                      className="w-full h-8 text-center"
                      min={0}
                    />
                  </td>
                ))}
              </tr>

              {/* Results */}
              <tr className="bg-muted/30">
                <td className="p-3 font-semibold" colSpan={scenarios.length + 2}>
                  <Settings2 className="w-4 h-4 inline mr-2" />
                  Results
                </td>
              </tr>

              {/* Total Hours */}
              <tr className="border-b">
                <td className="p-3 text-sm font-medium">Total Hours</td>
                <td className="p-3 text-center bg-primary/5 font-bold">{baseEstimate.totalHours}h</td>
                {scenarios.map(s => (
                  <td key={s.id} className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`font-bold ${getDiffColor(baseEstimate.totalHours, s.estimate.totalHours)}`}>
                        {s.estimate.totalHours}h
                      </span>
                      {getDiffBadge(baseEstimate.totalHours, s.estimate.totalHours)}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Duration */}
              <tr className="border-b">
                <td className="p-3 text-sm font-medium">Duration</td>
                <td className="p-3 text-center bg-primary/5 font-bold">{formatDuration(baseEstimate.totalWeeks)}</td>
                {scenarios.map(s => (
                  <td key={s.id} className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`font-bold ${getDiffColor(baseEstimate.totalWeeks, s.estimate.totalWeeks)}`}>
                        {formatDuration(s.estimate.totalWeeks)}
                      </span>
                      {getDiffBadge(baseEstimate.totalWeeks, s.estimate.totalWeeks)}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Total Cost */}
              <tr className="border-b">
                <td className="p-3 text-sm font-medium">Total Cost</td>
                <td className="p-3 text-center bg-primary/5 font-bold text-primary">{formatCurrency(baseEstimate.totalCost)}</td>
                {scenarios.map(s => (
                  <td key={s.id} className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`font-bold ${getDiffColor(baseEstimate.totalCost, s.estimate.totalCost)}`}>
                        {formatCurrency(s.estimate.totalCost)}
                      </span>
                      {getDiffBadge(baseEstimate.totalCost, s.estimate.totalCost)}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Team Size */}
              <tr className="border-b">
                <td className="p-3 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Team Size
                  </div>
                </td>
                <td className="p-3 text-center bg-primary/5 font-bold">{baseEstimate.teamSize} people</td>
                {scenarios.map(s => (
                  <td key={s.id} className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`font-bold ${getDiffColor(baseEstimate.teamSize || 1, s.estimate.teamSize || 1)}`}>
                        {s.estimate.teamSize} people
                      </span>
                      {getDiffBadge(baseEstimate.teamSize || 1, s.estimate.teamSize || 1)}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Monthly Team Cost */}
              <tr className="border-b">
                <td className="p-3 text-sm font-medium">Monthly Cost</td>
                <td className="p-3 text-center bg-primary/5 font-bold">{formatCurrency(baseEstimate.monthlyCost || 0)}/mo</td>
                {scenarios.map(s => (
                  <td key={s.id} className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`font-bold ${getDiffColor(baseEstimate.monthlyCost || 1, s.estimate.monthlyCost || 1)}`}>
                        {formatCurrency(s.estimate.monthlyCost || 0)}/mo
                      </span>
                      {getDiffBadge(baseEstimate.monthlyCost || 1, s.estimate.monthlyCost || 1)}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {scenarios.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <GitCompare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Add scenarios to compare different project configurations.</p>
            <p className="text-sm mt-1">See how changes affect time and cost estimates.</p>
          </div>
        )}

        {/* Team Configuration Presets */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Zap className="w-4 h-4" />
            Quick Team Presets
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(TEAM_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className="flex flex-col items-start h-auto p-3 text-left"
                onClick={() => addPresetScenario(key as keyof typeof TEAM_PRESETS)}
              >
                <div className="flex items-center gap-2 font-medium">
                  <span>{preset.icon}</span>
                  <span>{preset.name}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">{preset.description}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Custom Scenarios */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground mr-2">Quick config presets:</span>
          <Button variant="outline" size="sm" onClick={() => {
            const config = { ...baseFormData, uniqueScreens: Math.ceil(baseFormData.uniqueScreens * 0.7), complexity: 'simple' as ComplexityLevel };
            setScenarios(prev => [...prev, {
              id: `scenario-${Date.now()}`,
              name: 'Reduced Scope',
              config,
              estimate: calculateScenarioEstimate(config),
            }]);
          }}>
            Reduced Scope
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const config = { ...baseFormData, uniqueScreens: 5, apiIntegrations: 2, complexity: 'simple' as ComplexityLevel };
            setScenarios(prev => [...prev, {
              id: `scenario-${Date.now()}`,
              name: 'MVP Version',
              config,
              estimate: calculateScenarioEstimate(config),
            }]);
          }}>
            MVP Version
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
