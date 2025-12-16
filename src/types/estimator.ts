export type ProjectType = 'website' | 'web-app' | 'mobile-app' | 'it-service';
export type ProjectStage = 'pre-idea' | 'documented';
export type ComplexityLevel = 'simple' | 'medium' | 'complex';
export type Platform = 'web' | 'android' | 'ios' | 'linux-server' | 'cross-platform';
export type ItemComplexity = 'low' | 'medium' | 'high';
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'architect';

export interface CustomItem {
  id: string;
  name: string;
  complexity: ItemComplexity;
  stage: string;
  hours: number;
  reason: string;
}

export interface StageEstimate {
  stage: string;
  hours: number;
  weeks: number;
  cost: number;
  personnel: number;
  experience: string;
  tools: string[];
  reason: string;
  customItems?: CustomItem[];
}

export interface HardwareCosts {
  linuxServer: number;
  macOsBuildMachine: number;
  stagingEnvironment: number;
  productionServer: number;
  cicdPipeline: number;
  totalMonthly: number;
  totalProject: number;
}

export interface ResourceAllocation {
  desiredDurationMonths: number;
  staffing: {
    frontend: number;
    backend: number;
    qa: number;
    pm: number;
    devops: number;
    total: number;
  };
  hardware: {
    linuxServer: boolean;
    macOsBuildMachine: boolean;
    stagingEnvironment: boolean;
    productionServer: boolean;
    cicdPipeline: boolean;
  };
  hardwareCosts?: HardwareCosts;
  workingHoursPerMonth: number;
}

export interface ProjectEstimate {
  id: string;
  projectName: string;
  projectType: ProjectType;
  platform: Platform | Platform[];
  complexity: ComplexityLevel;
  stages: StageEstimate[];
  totalHours: number;
  totalWeeks: number;
  totalCost: number;
  createdAt: Date;
  customItems?: CustomItem[];
  aiSuggestions?: string;
  historicalMatch?: {
    projectName: string;
    accuracy: number;
    adjustedHours: number;
  };
  teamExperience?: ExperienceLevel;
  technologies?: string[];
  resourceAllocation?: ResourceAllocation;
}

export interface ProjectFormData {
  projectName: string;
  projectType: ProjectType;
  projectStage: ProjectStage;
  platforms: Platform[];  // Changed to array for multi-platform
  complexity: ComplexityLevel;
  
  // Team Experience
  teamExperience: ExperienceLevel;
  yearsOfExperience: number;
  
  // Technologies
  technologies: string[];
  
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
  
  // Custom items per stage
  customItems: CustomItem[];
  
  // Uploaded documents
  uploadedDocuments?: UploadedDocument[];
  
  // Voice input transcript
  voiceDescription?: string;
}

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  analysis?: DocumentAnalysis;
}

export interface DocumentAnalysis {
  suggestedScreens: number;
  suggestedComplexity: ComplexityLevel;
  suggestedFeatures: string[];
  summary: string;
  estimatedWeeks: number;
  estimatedHours: number;
  estimatedCost: number;
  confidenceScore: number;
  confidenceReason: string;
  breakdown?: {
    pm: number;
    design: number;
    frontend: number;
    backend: number;
    qa: number;
    devops: number;
  };
  technicalRequirements?: string[];
  risks?: string[];
  assumptions?: string[];
  analyzedAt?: string;
  documentId?: string;
}

// Available technologies
export const AVAILABLE_TECHNOLOGIES = {
  frontend: ['React', 'Vue.js', 'Angular', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Flutter', 'React Native', 'Swift', 'Kotlin'],
  backend: ['Node.js', 'Python', 'Java', 'Go', 'Rust', '.NET', 'PHP', 'Ruby'],
  database: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Firebase', 'Supabase'],
  cloud: ['AWS', 'Azure', 'GCP', 'Vercel', 'Netlify', 'DigitalOcean'],
  tools: ['Docker', 'Kubernetes', 'GitHub Actions', 'Jenkins', 'Terraform'],
};

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; years: string; multiplier: number }[] = [
  { value: 'junior', label: 'Junior', years: '0-2 years', multiplier: 1.4 },
  { value: 'mid', label: 'Mid-Level', years: '2-5 years', multiplier: 1.1 },
  { value: 'senior', label: 'Senior', years: '5-8 years', multiplier: 1.0 },
  { value: 'lead', label: 'Tech Lead', years: '8-12 years', multiplier: 0.9 },
  { value: 'architect', label: 'Architect', years: '12+ years', multiplier: 0.85 },
];

// Blank initial state - NO pre-selected options
export const defaultFormData: ProjectFormData = {
  projectName: '',
  projectType: '' as ProjectType, // Blank - user must select
  projectStage: '' as ProjectStage, // Blank - user must select
  platforms: [], // Empty - user must select
  complexity: '' as ComplexityLevel, // Blank - user must select
  teamExperience: '' as ExperienceLevel, // Blank - user must select
  yearsOfExperience: 0,
  technologies: [],
  pmInvolvement: 0,
  uniqueScreens: 0,
  customBranding: false,
  animationLevel: '' as 'none' | 'simple' | 'advanced', // Blank
  apiIntegrations: 0,
  businessLogicComplexity: '' as ComplexityLevel, // Blank
  securityLevel: '' as 'basic' | 'standard' | 'enterprise', // Blank
  databaseSize: '' as 'small' | 'medium' | 'enterprise', // Blank
  testCoverage: '' as 'unit' | 'integration' | 'e2e', // Blank
  uatDays: 0,
  cloudProvider: '' as 'aws' | 'azure' | 'gcp', // Blank
  cicdSetup: false,
  supportDays: 0,
  customItems: [],
  uploadedDocuments: [],
  voiceDescription: '',
};

// Check if minimum required fields are selected
export const hasMinimumSelections = (formData: ProjectFormData): boolean => {
  return !!(
    formData.projectType &&
    formData.projectStage &&
    formData.platforms.length > 0 &&
    formData.complexity
  );
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

export const ITEM_COMPLEXITY_HOURS: Record<ItemComplexity, number> = {
  low: 4,
  medium: 12,
  high: 24,
};

export const STAGE_TIME_REASONS = {
  pm: {
    base: 'Project management overhead scales with team size and project complexity.',
    complexity: 'Higher complexity requires more coordination, risk management, and stakeholder communication.',
    platform: 'Mobile and cross-platform projects need additional coordination between specialized teams.',
  },
  design: {
    base: 'Each unique screen requires wireframing, mockups, and multiple design iterations.',
    branding: 'Custom branding adds logo design, color palette development, and brand guidelines.',
    complexity: 'Complex interfaces need detailed interaction design and accessibility considerations.',
  },
  frontend: {
    base: 'Frontend development includes component building, state management, and responsive design.',
    animations: 'Advanced animations require careful implementation and performance optimization.',
    integrations: 'Each API integration needs implementation, error handling, and testing.',
  },
  backend: {
    base: 'Backend development covers API design, business logic, and database operations.',
    security: 'Enterprise security requires authentication, authorization, encryption, and audit logging.',
    database: 'Larger databases need schema optimization, indexing, and migration strategies.',
  },
  qa: {
    base: 'Quality assurance ensures reliability through systematic testing approaches.',
    coverage: 'End-to-end testing provides comprehensive coverage but requires more time.',
    uat: 'User acceptance testing validates business requirements with real stakeholders.',
  },
  deploy: {
    base: 'Deployment includes environment setup, configuration, and initial launch.',
    cicd: 'CI/CD pipelines automate testing and deployment for faster, safer releases.',
    appstore: 'App store submissions require compliance reviews, assets, and iteration time.',
  },
};