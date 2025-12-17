import { 
  ProjectFormData, 
  StageEstimate, 
  ProjectEstimate, 
  HOURLY_RATES, 
  STAGE_PERSONNEL,
  STAGE_TIME_REASONS,
  ComplexityLevel,
  CustomItem,
  TeamComposition,
  DEFAULT_HOURLY_RATES,
  TeamRoleConfig
} from '@/types/estimator';

const COMPLEXITY_MULTIPLIERS: Record<ComplexityLevel, number> = {
  simple: 0.7,
  medium: 1.0,
  complex: 1.5,
};

const PLATFORM_MULTIPLIERS: Record<string, number> = {
  web: 1.0,
  android: 1.2,
  ios: 1.3,
  'linux-server': 0.9,
  'cross-platform': 1.8,
};

// Base hours per project type for Sum of Parts calculation
const PROJECT_TYPE_BASE_HOURS: Record<string, { pm: number; design: number; frontend: number; backend: number; qa: number; devops: number }> = {
  'website': { pm: 20, design: 40, frontend: 60, backend: 20, qa: 16, devops: 8 },
  'web-app': { pm: 40, design: 60, frontend: 120, backend: 80, qa: 40, devops: 24 },
  'mobile-app': { pm: 50, design: 80, frontend: 160, backend: 100, qa: 60, devops: 32 },
  'it-service': { pm: 30, design: 20, frontend: 40, backend: 120, qa: 40, devops: 40 },
};

// Productivity multipliers based on experience level
const PRODUCTIVITY_MULTIPLIERS: Record<string, number> = {
  junior: 1.4,   // Takes 40% more time
  mid: 1.1,      // Takes 10% more time
  senior: 1.0,   // Baseline
  lead: 0.9,     // 10% faster
  architect: 0.85, // 15% faster
};

function getCustomItemsHours(customItems: CustomItem[], stage: string): number {
  return customItems
    .filter(item => item.stage === stage)
    .reduce((sum, item) => sum + item.hours, 0);
}

// Calculate total team headcount
export function getTeamHeadcount(team: TeamComposition): number {
  const standardRoles = team.junior.count + team.mid.count + team.senior.count + team.lead.count + team.architect.count;
  const customRoles = team.customRoles.reduce((sum, r) => sum + r.count, 0);
  return standardRoles + customRoles;
}

// Calculate weighted productivity multiplier based on team composition
export function getTeamProductivityMultiplier(team: TeamComposition): number {
  const headcount = getTeamHeadcount(team);
  if (headcount === 0) return 1.0;

  const weightedSum = 
    (team.junior.count * PRODUCTIVITY_MULTIPLIERS.junior) +
    (team.mid.count * PRODUCTIVITY_MULTIPLIERS.mid) +
    (team.senior.count * PRODUCTIVITY_MULTIPLIERS.senior) +
    (team.lead.count * PRODUCTIVITY_MULTIPLIERS.lead) +
    (team.architect.count * PRODUCTIVITY_MULTIPLIERS.architect) +
    (team.customRoles.reduce((sum, r) => sum + r.count * 1.1, 0)); // Custom roles default to mid-level productivity

  return weightedSum / headcount;
}

// Calculate monthly team cost (160 hours/month)
export function getMonthlyTeamCost(team: TeamComposition): number {
  const hoursPerMonth = 160;
  
  const standardCost = 
    (team.junior.count * team.junior.hourlyRate * hoursPerMonth) +
    (team.mid.count * team.mid.hourlyRate * hoursPerMonth) +
    (team.senior.count * team.senior.hourlyRate * hoursPerMonth) +
    (team.lead.count * team.lead.hourlyRate * hoursPerMonth) +
    (team.architect.count * team.architect.hourlyRate * hoursPerMonth);
  
  const customCost = team.customRoles.reduce(
    (sum, r) => sum + (r.count * r.hourlyRate * hoursPerMonth), 0
  );

  return standardCost + customCost;
}

// Calculate team salary breakdown for analytics
export function getTeamSalaryBreakdown(team: TeamComposition, totalHours: number): Array<{ name: string; cost: number; hours: number }> {
  const breakdown: Array<{ name: string; cost: number; hours: number }> = [];
  const headcount = getTeamHeadcount(team);
  if (headcount === 0) return breakdown;

  const hoursPerPerson = totalHours / headcount;

  const roles: Array<{ key: keyof TeamComposition; label: string }> = [
    { key: 'junior', label: 'Junior' },
    { key: 'mid', label: 'Mid-Level' },
    { key: 'senior', label: 'Senior' },
    { key: 'lead', label: 'Tech Lead' },
    { key: 'architect', label: 'Architect' },
  ];

  roles.forEach(({ key, label }) => {
    const role = team[key] as TeamRoleConfig;
    if (role.count > 0) {
      const roleHours = hoursPerPerson * role.count;
      breakdown.push({
        name: label,
        hours: Math.round(roleHours),
        cost: Math.round(roleHours * role.hourlyRate),
      });
    }
  });

  team.customRoles.forEach(role => {
    if (role.count > 0) {
      const roleHours = hoursPerPerson * role.count;
      breakdown.push({
        name: role.name,
        hours: Math.round(roleHours),
        cost: Math.round(roleHours * role.hourlyRate),
      });
    }
  });

  return breakdown;
}

// Calculate weighted average hourly rate from team
function getWeightedHourlyRate(team: TeamComposition): number {
  const headcount = getTeamHeadcount(team);
  if (headcount === 0) return 75; // Default fallback rate

  const totalCost = 
    (team.junior.count * team.junior.hourlyRate) +
    (team.mid.count * team.mid.hourlyRate) +
    (team.senior.count * team.senior.hourlyRate) +
    (team.lead.count * team.lead.hourlyRate) +
    (team.architect.count * team.architect.hourlyRate) +
    team.customRoles.reduce((sum, r) => sum + (r.count * r.hourlyRate), 0);

  return totalCost / headcount;
}

function generateStageReason(stage: string, data: ProjectFormData): string {
  const platforms = data.platforms || ['web'];
  const platform = platforms[0];
  
  switch (stage) {
    case 'Project Management':
      const pmReasons = [STAGE_TIME_REASONS.pm.base];
      if (data.complexity === 'complex') pmReasons.push(STAGE_TIME_REASONS.pm.complexity);
      if (platform !== 'web') pmReasons.push(STAGE_TIME_REASONS.pm.platform);
      return pmReasons.join(' ');
    
    case 'UX/UI Design':
      const designReasons = [STAGE_TIME_REASONS.design.base];
      if (data.customBranding) designReasons.push(STAGE_TIME_REASONS.design.branding);
      if (data.complexity === 'complex') designReasons.push(STAGE_TIME_REASONS.design.complexity);
      return designReasons.join(' ');
    
    case 'Frontend Development':
      const feReasons = [STAGE_TIME_REASONS.frontend.base];
      if (data.animationLevel === 'advanced') feReasons.push(STAGE_TIME_REASONS.frontend.animations);
      if (data.apiIntegrations > 5) feReasons.push(STAGE_TIME_REASONS.frontend.integrations);
      return feReasons.join(' ');
    
    case 'Backend Development':
      const beReasons = [STAGE_TIME_REASONS.backend.base];
      if (data.securityLevel === 'enterprise') beReasons.push(STAGE_TIME_REASONS.backend.security);
      if (data.databaseSize === 'enterprise') beReasons.push(STAGE_TIME_REASONS.backend.database);
      return beReasons.join(' ');
    
    case 'Quality Assurance':
      const qaReasons = [STAGE_TIME_REASONS.qa.base];
      if (data.testCoverage === 'e2e') qaReasons.push(STAGE_TIME_REASONS.qa.coverage);
      if (data.uatDays > 5) qaReasons.push(STAGE_TIME_REASONS.qa.uat);
      return qaReasons.join(' ');
    
    case 'Deployment & Support':
      const deployReasons = [STAGE_TIME_REASONS.deploy.base];
      if (data.cicdSetup) deployReasons.push(STAGE_TIME_REASONS.deploy.cicd);
      if (platform === 'ios' || platform === 'android') deployReasons.push(STAGE_TIME_REASONS.deploy.appstore);
      return deployReasons.join(' ');
    
    default:
      return 'Time allocated based on project requirements and industry standards.';
  }
}

export function calculateEstimate(data: ProjectFormData): ProjectEstimate {
  const complexityMult = COMPLEXITY_MULTIPLIERS[data.complexity];
  const platforms = data.platforms || ['web'];
  const platform = platforms[0];
  const platformMult = PLATFORM_MULTIPLIERS[platform] || 1;
  const stages: StageEstimate[] = [];
  const customItems = data.customItems || [];
  const teamComposition = data.teamComposition;

  // Calculate productivity multiplier from team composition
  const productivityMult = teamComposition ? getTeamProductivityMultiplier(teamComposition) : 1.0;
  
  // Get weighted hourly rate from team or use defaults
  const teamHourlyRate = teamComposition ? getWeightedHourlyRate(teamComposition) : 75;

  // Calculate cumulative base hours from all selected project types (Sum of Parts)
  const selectedTypes = data.projectTypes || [];
  let cumulativeBaseHours = { pm: 0, design: 0, frontend: 0, backend: 0, qa: 0, devops: 0 };
  
  selectedTypes.forEach(type => {
    const typeHours = PROJECT_TYPE_BASE_HOURS[type];
    if (typeHours) {
      cumulativeBaseHours.pm += typeHours.pm;
      cumulativeBaseHours.design += typeHours.design;
      cumulativeBaseHours.frontend += typeHours.frontend;
      cumulativeBaseHours.backend += typeHours.backend;
      cumulativeBaseHours.qa += typeHours.qa;
      cumulativeBaseHours.devops += typeHours.devops;
    }
  });

  // Apply multipliers to base hours
  const baseProjectHours = data.uniqueScreens * 8 * complexityMult;
  
  // PM Stage - use cumulative hours + screen-based calculation
  const pmCustomHours = getCustomItemsHours(customItems, 'pm');
  const pmBaseHours = cumulativeBaseHours.pm + (baseProjectHours * (data.pmInvolvement / 100));
  const pmHours = (pmBaseHours * platformMult * productivityMult) + pmCustomHours;
  stages.push({
    stage: 'Project Management',
    hours: Math.round(pmHours),
    weeks: Math.round(pmHours / 40 * 10) / 10,
    cost: Math.round(pmHours * (teamComposition?.lead.hourlyRate || HOURLY_RATES.pm)),
    personnel: STAGE_PERSONNEL.pm.count,
    experience: STAGE_PERSONNEL.pm.experience,
    tools: STAGE_PERSONNEL.pm.tools,
    reason: generateStageReason('Project Management', data),
    customItems: customItems.filter(i => i.stage === 'pm'),
  });

  // Design Stage
  const designHoursPerScreen = data.customBranding ? 12 : 6;
  const designCustomHours = getCustomItemsHours(customItems, 'design');
  const designBaseHours = cumulativeBaseHours.design + (data.uniqueScreens * designHoursPerScreen);
  const designHours = (designBaseHours * complexityMult * productivityMult) + designCustomHours;
  stages.push({
    stage: 'UX/UI Design',
    hours: Math.round(designHours),
    weeks: Math.round(designHours / 40 * 10) / 10,
    cost: Math.round(designHours * (teamComposition?.senior.hourlyRate || HOURLY_RATES.design)),
    personnel: STAGE_PERSONNEL.design.count,
    experience: STAGE_PERSONNEL.design.experience,
    tools: STAGE_PERSONNEL.design.tools,
    reason: generateStageReason('UX/UI Design', data),
    customItems: customItems.filter(i => i.stage === 'design'),
  });

  // Frontend Stage
  const animationMult = data.animationLevel === 'none' ? 0.8 : data.animationLevel === 'simple' ? 1.0 : 1.4;
  const frontendCustomHours = getCustomItemsHours(customItems, 'frontend');
  const frontendBaseHours = cumulativeBaseHours.frontend + (data.uniqueScreens * 16 + data.apiIntegrations * 8);
  const frontendHours = (frontendBaseHours * complexityMult * animationMult * platformMult * productivityMult) + frontendCustomHours;
  const isMobile = platform === 'ios' || platform === 'android' || platform === 'cross-platform';
  stages.push({
    stage: 'Frontend Development',
    hours: Math.round(frontendHours),
    weeks: Math.round(frontendHours / 40 * 10) / 10,
    cost: Math.round(frontendHours * teamHourlyRate),
    personnel: STAGE_PERSONNEL.frontend.count,
    experience: STAGE_PERSONNEL.frontend.experience,
    tools: isMobile ? ['React Native', 'TypeScript', 'REST/GraphQL'] : STAGE_PERSONNEL.frontend.tools,
    reason: generateStageReason('Frontend Development', data),
    customItems: customItems.filter(i => i.stage === 'frontend'),
  });

  // Backend Stage
  const logicMult = COMPLEXITY_MULTIPLIERS[data.businessLogicComplexity];
  const securityMult = data.securityLevel === 'basic' ? 0.8 : data.securityLevel === 'standard' ? 1.0 : 1.5;
  const dbMult = data.databaseSize === 'small' ? 0.7 : data.databaseSize === 'medium' ? 1.0 : 1.6;
  const backendCustomHours = getCustomItemsHours(customItems, 'backend');
  const backendBaseHours = cumulativeBaseHours.backend + (data.uniqueScreens * 12 + data.apiIntegrations * 16);
  const backendHours = (backendBaseHours * logicMult * securityMult * dbMult * productivityMult) + backendCustomHours;
  stages.push({
    stage: 'Backend Development',
    hours: Math.round(backendHours),
    weeks: Math.round(backendHours / 40 * 10) / 10,
    cost: Math.round(backendHours * teamHourlyRate),
    personnel: STAGE_PERSONNEL.backend.count,
    experience: STAGE_PERSONNEL.backend.experience,
    tools: [...STAGE_PERSONNEL.backend.tools, data.cloudProvider.toUpperCase()],
    reason: generateStageReason('Backend Development', data),
    customItems: customItems.filter(i => i.stage === 'backend'),
  });

  // QA Stage
  const testMult = data.testCoverage === 'unit' ? 0.6 : data.testCoverage === 'integration' ? 1.0 : 1.5;
  const qaCustomHours = getCustomItemsHours(customItems, 'qa');
  const qaBaseHours = cumulativeBaseHours.qa + ((frontendHours + backendHours) * 0.25);
  const qaHours = (qaBaseHours * testMult * productivityMult) + data.uatDays * 8 + qaCustomHours;
  stages.push({
    stage: 'Quality Assurance',
    hours: Math.round(qaHours),
    weeks: Math.round(qaHours / 40 * 10) / 10,
    cost: Math.round(qaHours * (teamComposition?.mid.hourlyRate || HOURLY_RATES.qa)),
    personnel: STAGE_PERSONNEL.qa.count,
    experience: STAGE_PERSONNEL.qa.experience,
    tools: STAGE_PERSONNEL.qa.tools,
    reason: generateStageReason('Quality Assurance', data),
    customItems: customItems.filter(i => i.stage === 'qa'),
  });

  // Deployment Stage
  const cicdHours = data.cicdSetup ? 24 : 8;
  const deployCustomHours = getCustomItemsHours(customItems, 'deploy');
  const appStoreHours = (platform === 'ios' || platform === 'android') ? 16 : 0;
  const deployBaseHours = cumulativeBaseHours.devops + cicdHours + appStoreHours;
  const deployHours = (deployBaseHours * productivityMult) + data.supportDays * 2 + deployCustomHours;
  stages.push({
    stage: 'Deployment & Support',
    hours: Math.round(deployHours),
    weeks: Math.round(deployHours / 40 * 10) / 10,
    cost: Math.round(deployHours * (teamComposition?.senior.hourlyRate || HOURLY_RATES.devops)),
    personnel: STAGE_PERSONNEL.devops.count,
    experience: STAGE_PERSONNEL.devops.experience,
    tools: [...STAGE_PERSONNEL.devops.tools, data.cloudProvider.toUpperCase()],
    reason: generateStageReason('Deployment & Support', data),
    customItems: customItems.filter(i => i.stage === 'deploy'),
  });

  const totalHours = stages.reduce((sum, s) => sum + s.hours, 0);
  const totalCost = stages.reduce((sum, s) => sum + s.cost, 0);

  return {
    id: crypto.randomUUID(),
    projectName: data.projectName || 'Untitled Project',
    projectType: data.projectTypes?.[0] || 'web-app',
    projectTypes: data.projectTypes,
    platform: platforms,
    complexity: data.complexity,
    stages,
    totalHours,
    totalWeeks: Math.round(totalHours / 40 * 10) / 10,
    totalCost,
    createdAt: new Date(),
    customItems,
    teamComposition: data.teamComposition,
  };
}

// Safe number helper to prevent NaN
export function safeNumber(value: number, fallback: number = 0): number {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return fallback;
  }
  return value;
}

export function formatCurrency(amount: number): string {
  const safeAmount = safeNumber(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeAmount);
}

export function formatDuration(weeks: number): string {
  const safeWeeks = safeNumber(weeks);
  if (safeWeeks <= 0) return '--';
  if (safeWeeks < 1) return `${Math.round(safeWeeks * 5)} days`;
  const months = Math.floor(safeWeeks / 4);
  const remainingWeeks = Math.round(safeWeeks % 4);
  if (months === 0) return `${Math.round(safeWeeks)} week${safeWeeks !== 1 ? 's' : ''}`;
  if (remainingWeeks === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  return `${months} month${months !== 1 ? 's' : ''}, ${remainingWeeks} week${remainingWeeks !== 1 ? 's' : ''}`;
}

export function calculateItemHours(complexity: 'low' | 'medium' | 'high'): number {
  const ITEM_COMPLEXITY_HOURS = { low: 4, medium: 12, high: 24 };
  return ITEM_COMPLEXITY_HOURS[complexity];
}