import { ProjectFormData, ComplexityLevel } from '@/types/estimator';

export interface IndustryTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'e-commerce' | 'fintech' | 'healthcare' | 'saas' | 'marketplace' | 'education';
  defaults: Partial<ProjectFormData>;
  features: string[];
  estimatedScreens: number;
  complexity: ComplexityLevel;
  techStack: string[];
  timeMultiplier: number;
  securityLevel: 'basic' | 'standard' | 'enterprise';
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  // E-Commerce Templates
  {
    id: 'ecommerce-basic',
    name: 'Basic E-Commerce Store',
    icon: '🛒',
    description: 'Simple online store with product catalog, cart, and checkout',
    category: 'e-commerce',
    defaults: {
      projectType: 'web-app',
      complexity: 'simple',
      uniqueScreens: 8,
      apiIntegrations: 3,
      securityLevel: 'standard',
      testCoverage: 'integration',
    },
    features: ['Product catalog', 'Shopping cart', 'Checkout flow', 'Order history', 'Basic search'],
    estimatedScreens: 8,
    complexity: 'simple',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    timeMultiplier: 1.0,
    securityLevel: 'standard',
  },
  {
    id: 'ecommerce-advanced',
    name: 'Advanced E-Commerce Platform',
    icon: '🏪',
    description: 'Full-featured e-commerce with inventory, analytics, and multi-vendor support',
    category: 'e-commerce',
    defaults: {
      projectType: 'web-app',
      complexity: 'complex',
      uniqueScreens: 25,
      apiIntegrations: 8,
      securityLevel: 'enterprise',
      testCoverage: 'e2e',
      businessLogicComplexity: 'complex',
    },
    features: ['Multi-vendor support', 'Inventory management', 'Analytics dashboard', 'Promotions engine', 'Advanced search', 'Reviews & ratings', 'Wishlist', 'Order tracking'],
    estimatedScreens: 25,
    complexity: 'complex',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Elasticsearch', 'Stripe'],
    timeMultiplier: 1.5,
    securityLevel: 'enterprise',
  },

  // Fintech Templates
  {
    id: 'fintech-wallet',
    name: 'Digital Wallet App',
    icon: '💳',
    description: 'Mobile wallet with payments, transfers, and transaction history',
    category: 'fintech',
    defaults: {
      projectType: 'mobile-app',
      complexity: 'complex',
      uniqueScreens: 15,
      apiIntegrations: 6,
      securityLevel: 'enterprise',
      testCoverage: 'e2e',
      businessLogicComplexity: 'complex',
    },
    features: ['Account management', 'P2P transfers', 'Bill payments', 'Transaction history', 'KYC verification', 'Biometric auth', 'Notifications'],
    estimatedScreens: 15,
    complexity: 'complex',
    techStack: ['React Native', 'Node.js', 'PostgreSQL', 'Plaid', 'Stripe'],
    timeMultiplier: 1.6,
    securityLevel: 'enterprise',
  },
  {
    id: 'fintech-trading',
    name: 'Trading Platform',
    icon: '📈',
    description: 'Stock/crypto trading platform with real-time data and portfolio management',
    category: 'fintech',
    defaults: {
      projectType: 'web-app',
      complexity: 'complex',
      uniqueScreens: 20,
      apiIntegrations: 10,
      securityLevel: 'enterprise',
      testCoverage: 'e2e',
      businessLogicComplexity: 'complex',
      animationLevel: 'advanced',
    },
    features: ['Real-time market data', 'Portfolio tracking', 'Order execution', 'Charts & analytics', 'Watchlists', 'Price alerts', 'News feed', 'Risk assessment'],
    estimatedScreens: 20,
    complexity: 'complex',
    techStack: ['React', 'Python', 'PostgreSQL', 'Redis', 'WebSocket', 'TradingView'],
    timeMultiplier: 1.8,
    securityLevel: 'enterprise',
  },

  // Healthcare Templates
  {
    id: 'healthcare-telehealth',
    name: 'Telehealth Platform',
    icon: '🏥',
    description: 'Video consultations with appointment booking and patient records',
    category: 'healthcare',
    defaults: {
      projectType: 'web-app',
      complexity: 'complex',
      uniqueScreens: 18,
      apiIntegrations: 7,
      securityLevel: 'enterprise',
      testCoverage: 'e2e',
      businessLogicComplexity: 'complex',
    },
    features: ['Video consultations', 'Appointment scheduling', 'Patient records', 'Prescription management', 'Secure messaging', 'Payment processing', 'Insurance verification'],
    estimatedScreens: 18,
    complexity: 'complex',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'WebRTC', 'Twilio', 'Stripe'],
    timeMultiplier: 1.7,
    securityLevel: 'enterprise',
  },
  {
    id: 'healthcare-ehr',
    name: 'Electronic Health Records',
    icon: '📋',
    description: 'Comprehensive EHR system for clinics and hospitals',
    category: 'healthcare',
    defaults: {
      projectType: 'web-app',
      complexity: 'complex',
      uniqueScreens: 30,
      apiIntegrations: 12,
      securityLevel: 'enterprise',
      testCoverage: 'e2e',
      businessLogicComplexity: 'complex',
      databaseSize: 'enterprise',
    },
    features: ['Patient records', 'Clinical documentation', 'Lab results', 'Imaging integration', 'Medication tracking', 'Billing & coding', 'Reporting', 'HL7/FHIR integration'],
    estimatedScreens: 30,
    complexity: 'complex',
    techStack: ['React', 'Java', 'PostgreSQL', 'HL7 FHIR', 'Redis'],
    timeMultiplier: 2.0,
    securityLevel: 'enterprise',
  },

  // SaaS Templates
  {
    id: 'saas-crm',
    name: 'CRM Platform',
    icon: '👥',
    description: 'Customer relationship management with sales pipeline and reporting',
    category: 'saas',
    defaults: {
      projectType: 'web-app',
      complexity: 'medium',
      uniqueScreens: 15,
      apiIntegrations: 5,
      securityLevel: 'standard',
      testCoverage: 'integration',
      businessLogicComplexity: 'medium',
    },
    features: ['Contact management', 'Sales pipeline', 'Email integration', 'Task management', 'Reporting dashboard', 'Team collaboration', 'Activity tracking'],
    estimatedScreens: 15,
    complexity: 'medium',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
    timeMultiplier: 1.2,
    securityLevel: 'standard',
  },
  {
    id: 'saas-pm',
    name: 'Project Management Tool',
    icon: '📊',
    description: 'Kanban boards, task tracking, and team collaboration',
    category: 'saas',
    defaults: {
      projectType: 'web-app',
      complexity: 'medium',
      uniqueScreens: 12,
      apiIntegrations: 4,
      securityLevel: 'standard',
      testCoverage: 'integration',
      animationLevel: 'advanced',
    },
    features: ['Kanban boards', 'Task management', 'Team workspaces', 'File sharing', 'Comments & mentions', 'Time tracking', 'Gantt charts'],
    estimatedScreens: 12,
    complexity: 'medium',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'WebSocket'],
    timeMultiplier: 1.1,
    securityLevel: 'standard',
  },

  // Marketplace Templates
  {
    id: 'marketplace-services',
    name: 'Service Marketplace',
    icon: '🤝',
    description: 'Platform connecting service providers with customers',
    category: 'marketplace',
    defaults: {
      projectType: 'web-app',
      complexity: 'complex',
      uniqueScreens: 20,
      apiIntegrations: 7,
      securityLevel: 'standard',
      testCoverage: 'e2e',
      businessLogicComplexity: 'complex',
    },
    features: ['Provider profiles', 'Service listings', 'Booking system', 'Reviews & ratings', 'Messaging', 'Payment escrow', 'Dispute resolution', 'Admin dashboard'],
    estimatedScreens: 20,
    complexity: 'complex',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe Connect', 'Twilio'],
    timeMultiplier: 1.4,
    securityLevel: 'standard',
  },

  // Education Templates
  {
    id: 'education-lms',
    name: 'Learning Management System',
    icon: '🎓',
    description: 'Online courses with video content, quizzes, and progress tracking',
    category: 'education',
    defaults: {
      projectType: 'web-app',
      complexity: 'medium',
      uniqueScreens: 16,
      apiIntegrations: 5,
      securityLevel: 'standard',
      testCoverage: 'integration',
    },
    features: ['Course catalog', 'Video player', 'Quizzes & assessments', 'Progress tracking', 'Certificates', 'Discussion forums', 'Instructor dashboard'],
    estimatedScreens: 16,
    complexity: 'medium',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Mux', 'Stripe'],
    timeMultiplier: 1.2,
    securityLevel: 'standard',
  },
];

export const getTemplatesByCategory = (category: string): IndustryTemplate[] => {
  return INDUSTRY_TEMPLATES.filter(t => t.category === category);
};

export const getTemplateById = (id: string): IndustryTemplate | undefined => {
  return INDUSTRY_TEMPLATES.find(t => t.id === id);
};

export const TEMPLATE_CATEGORIES = [
  { id: 'e-commerce', label: 'E-Commerce', icon: '🛒' },
  { id: 'fintech', label: 'Fintech', icon: '💳' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'saas', label: 'SaaS', icon: '☁️' },
  { id: 'marketplace', label: 'Marketplace', icon: '🤝' },
  { id: 'education', label: 'Education', icon: '🎓' },
];
