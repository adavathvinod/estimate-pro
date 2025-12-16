import { useMemo } from 'react';
import { AlertTriangle, Shield, TrendingDown, Users, Clock, Code, Server, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectFormData, ComplexityLevel, Platform } from '@/types/estimator';

interface RiskAssessmentModuleProps {
  formData: ProjectFormData;
  totalHours: number;
  totalCost: number;
}

interface Risk {
  id: string;
  category: 'technical' | 'schedule' | 'resource' | 'budget' | 'scope';
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100
  impact: number; // 0-100
  score: number;
  mitigations: string[];
}

const RISK_COLORS = {
  low: 'bg-green-500/20 text-green-700 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-700 border-red-500/30',
};

const CATEGORY_ICONS = {
  technical: Code,
  schedule: Clock,
  resource: Users,
  budget: DollarSign,
  scope: TrendingDown,
};

export function RiskAssessmentModule({ formData, totalHours, totalCost }: RiskAssessmentModuleProps) {
  const risks = useMemo(() => {
    const identifiedRisks: Risk[] = [];
    
    // Technical Risks
    if (formData.complexity === 'complex') {
      identifiedRisks.push({
        id: 'tech-complexity',
        category: 'technical',
        name: 'High Technical Complexity',
        description: 'Complex projects have higher chance of technical challenges and unforeseen issues.',
        severity: 'high',
        probability: 70,
        impact: 80,
        score: 56,
        mitigations: [
          'Conduct thorough technical discovery phase',
          'Implement proof-of-concept for critical features',
          'Allocate additional buffer time for R&D',
          'Consider engaging technical consultants',
        ],
      });
    }

    if (formData.technologies.length > 5) {
      identifiedRisks.push({
        id: 'tech-stack',
        category: 'technical',
        name: 'Large Technology Stack',
        description: `Using ${formData.technologies.length} technologies increases integration complexity.`,
        severity: 'medium',
        probability: 60,
        impact: 50,
        score: 30,
        mitigations: [
          'Ensure team expertise covers all technologies',
          'Create detailed integration test plans',
          'Document inter-service communication patterns',
          'Consider reducing tech stack if possible',
        ],
      });
    }

    if (formData.securityLevel === 'enterprise') {
      identifiedRisks.push({
        id: 'tech-security',
        category: 'technical',
        name: 'Enterprise Security Requirements',
        description: 'Enterprise-grade security requires specialized expertise and thorough auditing.',
        severity: 'high',
        probability: 50,
        impact: 90,
        score: 45,
        mitigations: [
          'Engage security specialists for architecture review',
          'Plan for penetration testing and security audits',
          'Implement security best practices from day one',
          'Document compliance requirements clearly',
        ],
      });
    }

    // Schedule Risks
    if (totalHours > 2000) {
      identifiedRisks.push({
        id: 'schedule-large',
        category: 'schedule',
        name: 'Large Project Duration',
        description: 'Projects over 2000 hours face increased schedule uncertainty.',
        severity: 'medium',
        probability: 65,
        impact: 60,
        score: 39,
        mitigations: [
          'Break project into smaller phases with milestones',
          'Implement agile methodology with regular check-ins',
          'Build in buffer time at phase boundaries',
          'Consider MVP approach for initial release',
        ],
      });
    }

    // Multi-platform Risk
    if (formData.platforms.length > 2) {
      identifiedRisks.push({
        id: 'schedule-multiplatform',
        category: 'schedule',
        name: 'Multi-Platform Development',
        description: `Developing for ${formData.platforms.length} platforms increases coordination overhead.`,
        severity: 'medium',
        probability: 55,
        impact: 55,
        score: 30,
        mitigations: [
          'Consider cross-platform frameworks where appropriate',
          'Stagger platform releases to reduce parallel workstreams',
          'Ensure dedicated resources for each platform',
          'Implement shared code/component libraries',
        ],
      });
    }

    // Resource Risks
    if (formData.teamExperience === 'junior') {
      identifiedRisks.push({
        id: 'resource-experience',
        category: 'resource',
        name: 'Junior Team Experience',
        description: 'Less experienced teams may face steeper learning curves and require more guidance.',
        severity: 'high',
        probability: 70,
        impact: 60,
        score: 42,
        mitigations: [
          'Pair junior developers with senior mentors',
          'Allocate time for training and skill development',
          'Implement thorough code review processes',
          'Create detailed technical documentation',
        ],
      });
    }

    // Budget Risks
    if (totalCost > 500000) {
      identifiedRisks.push({
        id: 'budget-large',
        category: 'budget',
        name: 'Large Budget Exposure',
        description: 'High-value projects require careful financial management.',
        severity: 'medium',
        probability: 40,
        impact: 85,
        score: 34,
        mitigations: [
          'Implement strict change management process',
          'Set up regular budget reviews and forecasting',
          'Establish contingency reserve (15-20%)',
          'Consider phased funding approval',
        ],
      });
    }

    // Scope Risks
    if (formData.projectStage === 'pre-idea') {
      identifiedRisks.push({
        id: 'scope-unclear',
        category: 'scope',
        name: 'Pre-Idea Stage Uncertainty',
        description: 'Requirements may evolve significantly as ideas mature.',
        severity: 'high',
        probability: 80,
        impact: 70,
        score: 56,
        mitigations: [
          'Plan for requirements discovery phase',
          'Use iterative development approach',
          'Document assumptions clearly',
          'Build flexibility into contracts and timelines',
        ],
      });
    }

    if (formData.apiIntegrations > 5) {
      identifiedRisks.push({
        id: 'scope-integrations',
        category: 'scope',
        name: 'Multiple External Integrations',
        description: `${formData.apiIntegrations} API integrations introduce third-party dependencies.`,
        severity: 'medium',
        probability: 60,
        impact: 50,
        score: 30,
        mitigations: [
          'Document API dependencies and SLAs',
          'Create fallback mechanisms for critical integrations',
          'Build abstraction layers for easier switching',
          'Monitor API changes and deprecations',
        ],
      });
    }

    // iOS-specific risks
    if (formData.platforms.includes('ios')) {
      identifiedRisks.push({
        id: 'tech-ios',
        category: 'technical',
        name: 'App Store Submission',
        description: 'iOS apps require Apple review which can cause unpredictable delays.',
        severity: 'medium',
        probability: 50,
        impact: 40,
        score: 20,
        mitigations: [
          'Plan for 1-2 week review buffer',
          'Study Apple guidelines thoroughly',
          'Prepare detailed app review documentation',
          'Consider TestFlight for beta testing',
        ],
      });
    }

    return identifiedRisks.sort((a, b) => b.score - a.score);
  }, [formData, totalHours, totalCost]);

  const overallRiskScore = useMemo(() => {
    if (risks.length === 0) return 0;
    return Math.round(risks.reduce((sum, r) => sum + r.score, 0) / risks.length);
  }, [risks]);

  const getOverallRiskLevel = (score: number): string => {
    if (score <= 25) return 'Low';
    if (score <= 45) return 'Medium';
    if (score <= 65) return 'High';
    return 'Critical';
  };

  const getOverallRiskColor = (score: number): string => {
    if (score <= 25) return 'text-green-500';
    if (score <= 45) return 'text-yellow-500';
    if (score <= 65) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <Card className="border-2 border-orange-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Risk Assessment
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Overall Risk:</span>
            <Badge className={`${RISK_COLORS[getOverallRiskLevel(overallRiskScore).toLowerCase() as keyof typeof RISK_COLORS]} text-lg px-3`}>
              {getOverallRiskLevel(overallRiskScore)}
            </Badge>
            <span className={`text-2xl font-bold ${getOverallRiskColor(overallRiskScore)}`}>
              {overallRiskScore}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {risks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p>No significant risks identified for this project configuration.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {risks.map((risk) => {
              const Icon = CATEGORY_ICONS[risk.category];
              return (
                <div 
                  key={risk.id} 
                  className={`p-4 rounded-lg border ${RISK_COLORS[risk.severity]}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <h4 className="font-semibold">{risk.name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {risk.category}
                      </Badge>
                      <Badge className={RISK_COLORS[risk.severity]}>
                        {risk.severity}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3">{risk.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Probability:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={risk.probability} className="h-2 flex-1" />
                        <span className="font-medium">{risk.probability}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Impact:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={risk.impact} className="h-2 flex-1" />
                        <span className="font-medium">{risk.impact}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risk Score:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={risk.score} className="h-2 flex-1" />
                        <span className="font-medium">{risk.score}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-background/50 rounded p-3">
                    <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                      Mitigation Strategies
                    </h5>
                    <ul className="text-sm space-y-1">
                      {risk.mitigations.map((m, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Shield className="w-3 h-3 mt-1 text-green-500 shrink-0" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Risk Matrix Summary */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-3">Risk Distribution</h4>
          <div className="grid grid-cols-4 gap-3 text-center text-sm">
            <div className="p-2 bg-green-500/10 rounded">
              <div className="font-bold text-green-600">{risks.filter(r => r.severity === 'low').length}</div>
              <div className="text-muted-foreground">Low</div>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded">
              <div className="font-bold text-yellow-600">{risks.filter(r => r.severity === 'medium').length}</div>
              <div className="text-muted-foreground">Medium</div>
            </div>
            <div className="p-2 bg-orange-500/10 rounded">
              <div className="font-bold text-orange-600">{risks.filter(r => r.severity === 'high').length}</div>
              <div className="text-muted-foreground">High</div>
            </div>
            <div className="p-2 bg-red-500/10 rounded">
              <div className="font-bold text-red-600">{risks.filter(r => r.severity === 'critical').length}</div>
              <div className="text-muted-foreground">Critical</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
