import { useState, useEffect, useMemo } from 'react';
import { Users, Server, Monitor, HardDrive, Settings, Calculator, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Platform, ResourceAllocation, HardwareCosts } from '@/types/estimator';
import { formatCurrency } from '@/lib/estimationEngine';

interface ResourceAllocationPlannerProps {
  totalHours: number;
  totalWeeks: number;
  stages: Array<{ stage: string; hours: number }>;
  platforms: Platform[];
  onAllocationChange?: (allocation: ResourceAllocation) => void;
}

// Monthly hardware cost estimates (in USD)
const HARDWARE_COSTS = {
  linuxServer: 150,        // Basic cloud Linux server
  macOsBuildMachine: 400,  // Mac Mini rental for CI/CD
  stagingEnvironment: 100, // Staging server costs
  productionServer: 300,   // Production server base cost
  cicdPipeline: 50,        // CI/CD service costs (GitHub Actions, etc.)
};

const HOURS_PER_FTE_PER_MONTH = 160; // 40 hours/week * 4 weeks

export function ResourceAllocationPlanner({ 
  totalHours, 
  totalWeeks, 
  stages,
  platforms,
  onAllocationChange 
}: ResourceAllocationPlannerProps) {
  const defaultDuration = Math.ceil(totalWeeks / 4.33);
  const [desiredDurationMonths, setDesiredDurationMonths] = useState(Math.max(1, defaultDuration));
  
  // Hardware requirements - auto-select based on platforms
  const [hardware, setHardware] = useState({
    linuxServer: true,
    macOsBuildMachine: platforms.includes('ios') || platforms.includes('cross-platform'),
    stagingEnvironment: true,
    productionServer: true,
    cicdPipeline: true,
  });

  // Update Mac requirement when platforms change
  useEffect(() => {
    setHardware(prev => ({
      ...prev,
      macOsBuildMachine: platforms.includes('ios') || platforms.includes('cross-platform'),
    }));
  }, [platforms]);

  // Calculate FTE staffing based on desired duration
  const staffing = useMemo(() => {
    const totalFteNeeded = totalHours / (desiredDurationMonths * HOURS_PER_FTE_PER_MONTH);
    
    // Get hours by stage category
    const frontendHours = stages.find(s => s.stage === 'frontend')?.hours || 0;
    const backendHours = stages.find(s => s.stage === 'backend')?.hours || 0;
    const qaHours = stages.find(s => s.stage === 'qa')?.hours || 0;
    const pmHours = stages.find(s => s.stage === 'pm')?.hours || 0;
    const devopsHours = stages.find(s => s.stage === 'devops')?.hours || 0;
    const designHours = stages.find(s => s.stage === 'design')?.hours || 0;
    
    const totalStageHours = frontendHours + backendHours + qaHours + pmHours + devopsHours + designHours;
    
    // Calculate proportional FTE for each role
    const frontend = Math.max(1, Math.ceil((frontendHours + designHours) / totalStageHours * totalFteNeeded));
    const backend = Math.max(1, Math.ceil(backendHours / totalStageHours * totalFteNeeded));
    const qa = Math.max(1, Math.ceil(qaHours / totalStageHours * totalFteNeeded));
    const pm = Math.max(1, Math.ceil(pmHours / totalStageHours * totalFteNeeded));
    const devops = Math.max(1, Math.ceil(devopsHours / totalStageHours * totalFteNeeded));

    return {
      frontend,
      backend,
      qa,
      pm,
      devops,
      total: frontend + backend + qa + pm + devops,
    };
  }, [totalHours, desiredDurationMonths, stages]);

  // Calculate hardware costs
  const hardwareCosts = useMemo((): HardwareCosts => {
    const costs = {
      linuxServer: hardware.linuxServer ? HARDWARE_COSTS.linuxServer : 0,
      macOsBuildMachine: hardware.macOsBuildMachine ? HARDWARE_COSTS.macOsBuildMachine : 0,
      stagingEnvironment: hardware.stagingEnvironment ? HARDWARE_COSTS.stagingEnvironment : 0,
      productionServer: hardware.productionServer ? HARDWARE_COSTS.productionServer : 0,
      cicdPipeline: hardware.cicdPipeline ? HARDWARE_COSTS.cicdPipeline : 0,
      totalMonthly: 0,
      totalProject: 0,
    };
    costs.totalMonthly = costs.linuxServer + costs.macOsBuildMachine + costs.stagingEnvironment + 
                         costs.productionServer + costs.cicdPipeline;
    costs.totalProject = costs.totalMonthly * desiredDurationMonths;
    return costs;
  }, [hardware, desiredDurationMonths]);

  // Emit changes
  useEffect(() => {
    onAllocationChange?.({
      desiredDurationMonths,
      staffing,
      hardware,
      hardwareCosts,
      workingHoursPerMonth: HOURS_PER_FTE_PER_MONTH,
    });
  }, [desiredDurationMonths, staffing, hardware, hardwareCosts, onAllocationChange]);

  const handleHardwareChange = (key: keyof typeof hardware) => {
    setHardware(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card className="border-2 border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Resource Allocation & Hardware Planning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Desired Duration Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Desired Project Duration</Label>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {desiredDurationMonths} {desiredDurationMonths === 1 ? 'month' : 'months'}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <Slider
              value={[desiredDurationMonths]}
              onValueChange={([value]) => setDesiredDurationMonths(value)}
              min={1}
              max={Math.max(24, defaultDuration * 2)}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={desiredDurationMonths}
              onChange={(e) => setDesiredDurationMonths(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 text-center"
              min={1}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Based on {totalHours} total hours, estimated default duration: {defaultDuration} months
          </p>
        </div>

        {/* FTE Staffing Calculation */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Required FTE Staffing</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-4 bg-blue-500/10 rounded-lg text-center border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-600">{staffing.frontend}</div>
              <div className="text-sm text-muted-foreground">Frontend Devs</div>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg text-center border border-green-500/20">
              <div className="text-2xl font-bold text-green-600">{staffing.backend}</div>
              <div className="text-sm text-muted-foreground">Backend Devs</div>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-lg text-center border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-600">{staffing.qa}</div>
              <div className="text-sm text-muted-foreground">QA Specialists</div>
            </div>
            <div className="p-4 bg-orange-500/10 rounded-lg text-center border border-orange-500/20">
              <div className="text-2xl font-bold text-orange-600">{staffing.pm}</div>
              <div className="text-sm text-muted-foreground">Project Managers</div>
            </div>
            <div className="p-4 bg-cyan-500/10 rounded-lg text-center border border-cyan-500/20">
              <div className="text-2xl font-bold text-cyan-600">{staffing.devops}</div>
              <div className="text-sm text-muted-foreground">DevOps Engineers</div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
            <span className="font-medium">Total Team Size</span>
            <span className="text-2xl font-bold text-primary">{staffing.total} FTE</span>
          </div>

          <p className="text-sm text-muted-foreground">
            Formula: T = H<sub>total</sub> / (Duration × {HOURS_PER_FTE_PER_MONTH} hrs/month)
          </p>
        </div>

        {/* Hardware & Environment Requirements */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Hardware & Environment Requirements</h4>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">Linux Server</span>
                  <p className="text-xs text-muted-foreground">For backend services and APIs</p>
                </div>
              </div>
              <Switch 
                checked={hardware.linuxServer} 
                onCheckedChange={() => handleHardwareChange('linuxServer')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">Mac OS Build Machine</span>
                  <p className="text-xs text-muted-foreground">Required for iOS/App Store deployment</p>
                  {platforms.includes('ios') && (
                    <Badge variant="secondary" className="mt-1 text-xs">Auto-selected for iOS</Badge>
                  )}
                </div>
              </div>
              <Switch 
                checked={hardware.macOsBuildMachine} 
                onCheckedChange={() => handleHardwareChange('macOsBuildMachine')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">Staging Environment</span>
                  <p className="text-xs text-muted-foreground">For pre-production testing</p>
                </div>
              </div>
              <Switch 
                checked={hardware.stagingEnvironment} 
                onCheckedChange={() => handleHardwareChange('stagingEnvironment')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">Production Server</span>
                  <p className="text-xs text-muted-foreground">Live environment hosting</p>
                </div>
              </div>
              <Switch 
                checked={hardware.productionServer} 
                onCheckedChange={() => handleHardwareChange('productionServer')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">CI/CD Pipeline</span>
                  <p className="text-xs text-muted-foreground">Automated build and deployment</p>
                </div>
              </div>
              <Switch 
                checked={hardware.cicdPipeline} 
                onCheckedChange={() => handleHardwareChange('cicdPipeline')}
              />
            </div>
          </div>
        </div>

        {/* Hardware Cost Summary */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Infrastructure Cost Estimate</h4>
          </div>
          
          <div className="grid gap-2">
            {hardware.linuxServer && (
              <div className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                <span>Linux Server</span>
                <span className="font-medium">{formatCurrency(HARDWARE_COSTS.linuxServer)}/mo</span>
              </div>
            )}
            {hardware.macOsBuildMachine && (
              <div className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                <span>Mac OS Build Machine</span>
                <span className="font-medium">{formatCurrency(HARDWARE_COSTS.macOsBuildMachine)}/mo</span>
              </div>
            )}
            {hardware.stagingEnvironment && (
              <div className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                <span>Staging Environment</span>
                <span className="font-medium">{formatCurrency(HARDWARE_COSTS.stagingEnvironment)}/mo</span>
              </div>
            )}
            {hardware.productionServer && (
              <div className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                <span>Production Server</span>
                <span className="font-medium">{formatCurrency(HARDWARE_COSTS.productionServer)}/mo</span>
              </div>
            )}
            {hardware.cicdPipeline && (
              <div className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                <span>CI/CD Pipeline</span>
                <span className="font-medium">{formatCurrency(HARDWARE_COSTS.cicdPipeline)}/mo</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Monthly Infrastructure Cost</span>
              <span className="text-lg font-bold text-accent-foreground">{formatCurrency(hardwareCosts.totalMonthly)}</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-accent/20">
              <span className="font-medium">Total Project Infrastructure ({desiredDurationMonths} months)</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(hardwareCosts.totalProject)}</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <h5 className="font-semibold mb-2">Resource Summary</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Team Size:</span>
              <span className="ml-2 font-medium">{staffing.total} FTE</span>
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span>
              <span className="ml-2 font-medium">{desiredDurationMonths} months</span>
            </div>
            <div>
              <span className="text-muted-foreground">Infrastructure/mo:</span>
              <span className="ml-2 font-medium">{formatCurrency(hardwareCosts.totalMonthly)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Hours/FTE/Month:</span>
              <span className="ml-2 font-medium">{HOURS_PER_FTE_PER_MONTH}h</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
