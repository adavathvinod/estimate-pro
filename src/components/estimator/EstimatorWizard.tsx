import { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressIndicator } from './ProgressIndicator';
import { ProjectSetupStep } from './steps/ProjectSetupStep';
import { PlatformStep } from './steps/PlatformStep';
import { PMDesignStep } from './steps/PMDesignStep';
import { DevelopmentStep } from './steps/DevelopmentStep';
import { QADeployStep } from './steps/QADeployStep';
import { SummaryStep } from './steps/SummaryStep';
import { ProjectFormData, defaultFormData, ProjectEstimate } from '@/types/estimator';
import { calculateEstimate, formatCurrency, formatDuration } from '@/lib/estimationEngine';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, name: 'Project Setup', shortName: 'Setup' },
  { id: 2, name: 'Platform & Complexity', shortName: 'Platform' },
  { id: 3, name: 'PM & Design', shortName: 'Design' },
  { id: 4, name: 'Development', shortName: 'Dev' },
  { id: 5, name: 'QA & Deployment', shortName: 'QA' },
  { id: 6, name: 'Summary', shortName: 'Summary' },
];

export function EstimatorWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData);
  const [finalEstimate, setFinalEstimate] = useState<ProjectEstimate | null>(null);

  const handleChange = (updates: Partial<ProjectFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const liveEstimate = useMemo(() => calculateEstimate(formData), [formData]);

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
    if (currentStep === 5) {
      setFinalEstimate(calculateEstimate(formData));
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleDownload = () => {
    if (!finalEstimate) return;
    
    const report = generateReportText(finalEstimate);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${finalEstimate.projectName.replace(/\s+/g, '-')}-estimate.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded successfully!');
  };

  const handleStartNew = () => {
    setFormData(defaultFormData);
    setFinalEstimate(null);
    setCurrentStep(1);
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.projectName.trim().length > 0;
    }
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ProgressIndicator
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {/* Live Estimate Preview */}
      {currentStep < 6 && (
        <div className="mb-6 p-4 bg-card rounded-xl shadow-card border border-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Live Estimate:</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{formatDuration(liveEstimate.totalWeeks)}</div>
              <div className="text-xs text-muted-foreground">Time</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-lg font-bold text-accent">{formatCurrency(liveEstimate.totalCost)}</div>
              <div className="text-xs text-muted-foreground">Cost</div>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="mb-8">
        {currentStep === 1 && <ProjectSetupStep data={formData} onChange={handleChange} />}
        {currentStep === 2 && <PlatformStep data={formData} onChange={handleChange} />}
        {currentStep === 3 && <PMDesignStep data={formData} onChange={handleChange} />}
        {currentStep === 4 && <DevelopmentStep data={formData} onChange={handleChange} />}
        {currentStep === 5 && <QADeployStep data={formData} onChange={handleChange} />}
        {currentStep === 6 && finalEstimate && (
          <SummaryStep
            estimate={finalEstimate}
            onDownload={handleDownload}
            onStartNew={handleStartNew}
          />
        )}
      </div>

      {/* Navigation */}
      {currentStep < 6 && (
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="min-w-32"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            variant="hero"
            size="lg"
            onClick={handleNext}
            disabled={!canProceed()}
            className="min-w-32"
          >
            {currentStep === 5 ? 'Generate Estimate' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function generateReportText(estimate: ProjectEstimate): string {
  const lines = [
    '═══════════════════════════════════════════════════════════════',
    '                 IT SERVICE PRODUCT ESTIMATE',
    '═══════════════════════════════════════════════════════════════',
    '',
    `Project Name: ${estimate.projectName}`,
    `Project Type: ${estimate.projectType.replace('-', ' ').toUpperCase()}`,
    `Platform: ${estimate.platform.replace('-', ' ').toUpperCase()}`,
    `Complexity: ${estimate.complexity.toUpperCase()}`,
    `Generated: ${estimate.createdAt.toLocaleDateString()}`,
    '',
    '───────────────────────────────────────────────────────────────',
    '                     EXECUTIVE SUMMARY',
    '───────────────────────────────────────────────────────────────',
    '',
    `Total Time: ${formatDuration(estimate.totalWeeks)} (~${estimate.totalHours} hours)`,
    `Total Cost: ${formatCurrency(estimate.totalCost)}`,
    '',
    '───────────────────────────────────────────────────────────────',
    '                   RESOURCE BREAKDOWN',
    '───────────────────────────────────────────────────────────────',
    '',
  ];

  estimate.stages.forEach((stage) => {
    lines.push(`▸ ${stage.stage}`);
    lines.push(`  Time: ${formatDuration(stage.weeks)} (${stage.hours} hours)`);
    lines.push(`  Cost: ${formatCurrency(stage.cost)}`);
    lines.push(`  Personnel: ${stage.personnel}, ${stage.experience}`);
    lines.push(`  Tools: ${stage.tools.join(', ')}`);
    lines.push('');
  });

  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('       Generated by IT Service Product Estimator');
  lines.push('═══════════════════════════════════════════════════════════════');

  return lines.join('\n');
}
