import { 
  ProjectFormData, 
  StageEstimate, 
  ProjectEstimate, 
  HOURLY_RATES, 
  STAGE_PERSONNEL,
  STAGE_TIME_REASONS,
  ITEM_COMPLEXITY_HOURS,
  ComplexityLevel,
  CustomItem
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

function getCustomItemsHours(customItems: CustomItem[], stage: string): number {
  return customItems
    .filter(item => item.stage === stage)
    .reduce((sum, item) => sum + item.hours, 0);
}

function generateStageReason(stage: string, data: ProjectFormData): string {
  switch (stage) {
    case 'Project Management':
      const pmReasons = [STAGE_TIME_REASONS.pm.base];
      if (data.complexity === 'complex') pmReasons.push(STAGE_TIME_REASONS.pm.complexity);
      if (data.platform !== 'web') pmReasons.push(STAGE_TIME_REASONS.pm.platform);
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
      if (data.platform === 'ios' || data.platform === 'android') deployReasons.push(STAGE_TIME_REASONS.deploy.appstore);
      return deployReasons.join(' ');
    
    default:
      return 'Time allocated based on project requirements and industry standards.';
  }
}

export function calculateEstimate(data: ProjectFormData): ProjectEstimate {
  const complexityMult = COMPLEXITY_MULTIPLIERS[data.complexity];
  const platformMult = PLATFORM_MULTIPLIERS[data.platform];
  const stages: StageEstimate[] = [];
  const customItems = data.customItems || [];

  // PM Stage Calculation
  const baseProjectHours = data.uniqueScreens * 8 * complexityMult;
  const pmCustomHours = getCustomItemsHours(customItems, 'pm');
  const pmHours = baseProjectHours * (data.pmInvolvement / 100) * platformMult + pmCustomHours;
  stages.push({
    stage: 'Project Management',
    hours: Math.round(pmHours),
    weeks: Math.round(pmHours / 40 * 10) / 10,
    cost: Math.round(pmHours * HOURLY_RATES.pm),
    personnel: STAGE_PERSONNEL.pm.count,
    experience: STAGE_PERSONNEL.pm.experience,
    tools: STAGE_PERSONNEL.pm.tools,
    reason: generateStageReason('Project Management', data),
    customItems: customItems.filter(i => i.stage === 'pm'),
  });

  // Design Stage Calculation
  const designHoursPerScreen = data.customBranding ? 12 : 6;
  const designCustomHours = getCustomItemsHours(customItems, 'design');
  const designHours = data.uniqueScreens * designHoursPerScreen * complexityMult + designCustomHours;
  stages.push({
    stage: 'UX/UI Design',
    hours: Math.round(designHours),
    weeks: Math.round(designHours / 40 * 10) / 10,
    cost: Math.round(designHours * HOURLY_RATES.design),
    personnel: STAGE_PERSONNEL.design.count,
    experience: STAGE_PERSONNEL.design.experience,
    tools: STAGE_PERSONNEL.design.tools,
    reason: generateStageReason('UX/UI Design', data),
    customItems: customItems.filter(i => i.stage === 'design'),
  });

  // Frontend Stage Calculation
  const animationMult = data.animationLevel === 'none' ? 0.8 : data.animationLevel === 'simple' ? 1.0 : 1.4;
  const frontendCustomHours = getCustomItemsHours(customItems, 'frontend');
  const frontendHours = (data.uniqueScreens * 16 + data.apiIntegrations * 8) * complexityMult * animationMult * platformMult + frontendCustomHours;
  stages.push({
    stage: 'Frontend Development',
    hours: Math.round(frontendHours),
    weeks: Math.round(frontendHours / 40 * 10) / 10,
    cost: Math.round(frontendHours * HOURLY_RATES.frontend),
    personnel: STAGE_PERSONNEL.frontend.count,
    experience: STAGE_PERSONNEL.frontend.experience,
    tools: data.platform === 'ios' || data.platform === 'android' || data.platform === 'cross-platform'
      ? ['React Native', 'TypeScript', 'REST/GraphQL']
      : STAGE_PERSONNEL.frontend.tools,
    reason: generateStageReason('Frontend Development', data),
    customItems: customItems.filter(i => i.stage === 'frontend'),
  });

  // Backend Stage Calculation
  const logicMult = COMPLEXITY_MULTIPLIERS[data.businessLogicComplexity];
  const securityMult = data.securityLevel === 'basic' ? 0.8 : data.securityLevel === 'standard' ? 1.0 : 1.5;
  const dbMult = data.databaseSize === 'small' ? 0.7 : data.databaseSize === 'medium' ? 1.0 : 1.6;
  const backendCustomHours = getCustomItemsHours(customItems, 'backend');
  const backendHours = (data.uniqueScreens * 12 + data.apiIntegrations * 16) * logicMult * securityMult * dbMult + backendCustomHours;
  stages.push({
    stage: 'Backend Development',
    hours: Math.round(backendHours),
    weeks: Math.round(backendHours / 40 * 10) / 10,
    cost: Math.round(backendHours * HOURLY_RATES.backend),
    personnel: STAGE_PERSONNEL.backend.count,
    experience: STAGE_PERSONNEL.backend.experience,
    tools: [...STAGE_PERSONNEL.backend.tools, data.cloudProvider.toUpperCase()],
    reason: generateStageReason('Backend Development', data),
    customItems: customItems.filter(i => i.stage === 'backend'),
  });

  // QA Stage Calculation
  const testMult = data.testCoverage === 'unit' ? 0.6 : data.testCoverage === 'integration' ? 1.0 : 1.5;
  const qaCustomHours = getCustomItemsHours(customItems, 'qa');
  const qaHours = (frontendHours + backendHours) * 0.25 * testMult + data.uatDays * 8 + qaCustomHours;
  stages.push({
    stage: 'Quality Assurance',
    hours: Math.round(qaHours),
    weeks: Math.round(qaHours / 40 * 10) / 10,
    cost: Math.round(qaHours * HOURLY_RATES.qa),
    personnel: STAGE_PERSONNEL.qa.count,
    experience: STAGE_PERSONNEL.qa.experience,
    tools: STAGE_PERSONNEL.qa.tools,
    reason: generateStageReason('Quality Assurance', data),
    customItems: customItems.filter(i => i.stage === 'qa'),
  });

  // Deployment Stage Calculation
  const cicdHours = data.cicdSetup ? 24 : 8;
  const deployCustomHours = getCustomItemsHours(customItems, 'deploy');
  const deployHours = cicdHours + data.supportDays * 2 + (data.platform === 'ios' || data.platform === 'android' ? 16 : 0) + deployCustomHours;
  stages.push({
    stage: 'Deployment & Support',
    hours: Math.round(deployHours),
    weeks: Math.round(deployHours / 40 * 10) / 10,
    cost: Math.round(deployHours * HOURLY_RATES.devops),
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
    projectType: data.projectType,
    platform: data.platform,
    complexity: data.complexity,
    stages,
    totalHours,
    totalWeeks: Math.round(totalHours / 40 * 10) / 10,
    totalCost,
    createdAt: new Date(),
    customItems,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(weeks: number): string {
  if (weeks < 1) {
    return `${Math.round(weeks * 5)} days`;
  }
  const months = Math.floor(weeks / 4);
  const remainingWeeks = Math.round(weeks % 4);
  
  if (months === 0) {
    return `${Math.round(weeks)} week${weeks !== 1 ? 's' : ''}`;
  }
  if (remainingWeeks === 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  return `${months} month${months !== 1 ? 's' : ''}, ${remainingWeeks} week${remainingWeeks !== 1 ? 's' : ''}`;
}

export function calculateItemHours(complexity: 'low' | 'medium' | 'high'): number {
  return ITEM_COMPLEXITY_HOURS[complexity];
}
