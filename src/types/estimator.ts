export type ProjectType = 'website' | 'web-app' | 'mobile-app' | 'it-service';
export type ProjectStage = 'pre-idea' | 'documented';
export type ComplexityLevel = 'simple' | 'medium' | 'complex';
export type Platform = 'web' | 'android' | 'ios' | 'linux-server' | 'cross-platform';

export interface StageEstimate {
  stage: string;
  hours: number;
  weeks: number;
  cost: number;
  personnel: number;
  experience: string;
  tools: string[];
}

export interface ProjectEstimate {
  id: string;
  projectName: string;
  projectType: ProjectType;
  platform: Platform;
  complexity: ComplexityLevel;
  stages: StageEstimate[];
  totalHours: number;
  totalWeeks: number;
  totalCost: number;
  createdAt: Date;
}

export interface ProjectFormData {
  projectName: string;
  projectType: ProjectType;
  projectStage: ProjectStage;
  platform: Platform;
  complexity: ComplexityLevel;
  
  // PM Stage
  pmInvolvement: number;
  
  // Design Stage
  uniqueScreens: number;
  customBranding: boolean;
  
  // Frontend Stage
  animationLevel: 'none' | 'simple' | 'advanced';
  apiIntegrations: number;
  
  // Backend Stage
  businessLogicComplexity: ComplexityLevel;
  securityLevel: 'basic' | 'standard' | 'enterprise';
  databaseSize: 'small' | 'medium' | 'enterprise';
  
  // QA Stage
  testCoverage: 'unit' | 'integration' | 'e2e';
  uatDays: number;
  
  // Deployment Stage
  cloudProvider: 'aws' | 'azure' | 'gcp';
  cicdSetup: boolean;
  supportDays: number;
}

export const defaultFormData: ProjectFormData = {
  projectName: '',
  projectType: 'web-app',
  projectStage: 'pre-idea',
  platform: 'web',
  complexity: 'medium',
  pmInvolvement: 20,
  uniqueScreens: 10,
  customBranding: false,
  animationLevel: 'simple',
  apiIntegrations: 3,
  businessLogicComplexity: 'medium',
  securityLevel: 'standard',
  databaseSize: 'medium',
  testCoverage: 'integration',
  uatDays: 5,
  cloudProvider: 'aws',
  cicdSetup: true,
  supportDays: 30,
};

export const HOURLY_RATES = {
  pm: 85,
  design: 75,
  frontend: 90,
  backend: 100,
  qa: 70,
  devops: 95,
};

export const STAGE_PERSONNEL = {
  pm: { count: 1, experience: '5+ years', tools: ['JIRA', 'Confluence', 'Slack'] },
  design: { count: 2, experience: '3+ years', tools: ['Figma', 'Sketch', 'Adobe XD'] },
  frontend: { count: 3, experience: '4+ years', tools: ['React', 'TypeScript', 'REST/GraphQL'] },
  backend: { count: 2, experience: '5+ years', tools: ['Node.js', 'PostgreSQL', 'Docker'] },
  qa: { count: 1, experience: '3+ years', tools: ['Selenium', 'Cypress', 'Jest'] },
  devops: { count: 1, experience: '4+ years', tools: ['Docker', 'Kubernetes', 'CI/CD'] },
};
