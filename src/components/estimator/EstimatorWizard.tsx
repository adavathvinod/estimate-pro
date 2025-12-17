import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Calculator, History, GitCompare, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressIndicator } from './ProgressIndicator';
import { ProjectSetupStep } from './steps/ProjectSetupStep';
import { PlatformStep } from './steps/PlatformStep';
import { PMDesignStep } from './steps/PMDesignStep';
import { DevelopmentStep } from './steps/DevelopmentStep';
import { QADeployStep } from './steps/QADeployStep';
import { SummaryStep } from './steps/SummaryStep';
import { ComparisonView } from './ComparisonView';
import { ProjectFormData, defaultFormData, ProjectEstimate, CustomItem } from '@/types/estimator';
import { calculateEstimate, formatCurrency, formatDuration } from '@/lib/estimationEngine';
import { useEstimateStorage } from '@/hooks/useEstimateStorage';
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
  const [showHistory, setShowHistory] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [historicalEstimates, setHistoricalEstimates] = useState<any[]>([]);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  
  const { saveEstimate, loadEstimates, getHistoricalMatch, saving, loading } = useEstimateStorage();

  const handleChange = (updates: Partial<ProjectFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleCustomItemsChange = (customItems: CustomItem[]) => {
    setFormData((prev) => ({ ...prev, customItems }));
  };

  const liveEstimate = useMemo(() => calculateEstimate(formData), [formData]);

  useEffect(() => {
    loadEstimates().then(setHistoricalEstimates);
  }, []);

  const handleNext = async () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
    if (currentStep === 5) {
      const estimate = calculateEstimate(formData);
      
      // Check for historical matches
      const matchResult = await getHistoricalMatch(
        formData.projectTypes?.[0] || 'web-app',
        formData.platforms[0] || 'web',
        formData.complexity,
        estimate.totalHours
      );
      
      if (matchResult?.match) {
        estimate.historicalMatch = matchResult.match;
        toast.info(`AI Insight: Similar to "${matchResult.match.projectName}" with ${matchResult.match.accuracy}% match`);
      }
      
      setFinalEstimate(estimate);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep) setCurrentStep(step);
  };

  const handleSaveEstimate = async () => {
    if (finalEstimate) {
      await saveEstimate(finalEstimate, formData);
      const updated = await loadEstimates();
      setHistoricalEstimates(updated);
    }
  };

  const handleStartNew = () => {
    setFormData(defaultFormData);
    setFinalEstimate(null);
    setCurrentStep(1);
  };

  const toggleCompareSelection = (id: string) => {
    setSelectedForCompare(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(-4)
    );
  };

  const canProceed = () => currentStep === 1 ? formData.projectName.trim().length > 0 : true;

  return (
    <div className="max-w-4xl mx-auto">
      {/* History & Compare Controls */}
      <div className="mb-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
          <History className="w-4 h-4 mr-1" />
          History ({historicalEstimates.length})
        </Button>
        {selectedForCompare.length >= 2 && (
          <Button variant="accent" size="sm" onClick={() => setShowComparison(true)}>
            <GitCompare className="w-4 h-4 mr-1" />
            Compare ({selectedForCompare.length})
          </Button>
        )}
      </div>

      {/* Historical Estimates Panel */}
      {showHistory && historicalEstimates.length > 0 && (
        <div className="mb-6 p-4 bg-card rounded-xl border shadow-card max-h-64 overflow-auto">
          <h4 className="font-semibold mb-3">Previous Estimates</h4>
          <div className="space-y-2">
            {historicalEstimates.slice(0, 10).map(est => (
              <div key={est.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedForCompare.includes(est.id)}
                    onChange={() => toggleCompareSelection(est.id)}
                    className="rounded"
                  />
                  <span className="font-medium">{est.project_name}</span>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>{formatDuration(est.total_weeks)}</span>
                  <span>{formatCurrency(est.total_cost)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ProgressIndicator steps={STEPS} currentStep={currentStep} onStepClick={handleStepClick} />

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

      <div className="mb-8">
        {currentStep === 1 && <ProjectSetupStep data={formData} onChange={handleChange} />}
        {currentStep === 2 && <PlatformStep data={formData} onChange={handleChange} />}
        {currentStep === 3 && <PMDesignStep data={formData} onChange={handleChange} onCustomItemsChange={handleCustomItemsChange} />}
        {currentStep === 4 && <DevelopmentStep data={formData} onChange={handleChange} onCustomItemsChange={handleCustomItemsChange} />}
        {currentStep === 5 && <QADeployStep data={formData} onChange={handleChange} onCustomItemsChange={handleCustomItemsChange} />}
        {currentStep === 6 && finalEstimate && (
          <SummaryStep
            estimate={finalEstimate}
            onSave={handleSaveEstimate}
            onStartNew={handleStartNew}
            saving={saving}
          />
        )}
      </div>

      {currentStep < 6 && (
        <div className="flex justify-between gap-4">
          <Button variant="outline" size="lg" onClick={handleBack} disabled={currentStep === 1} className="min-w-32">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button variant="hero" size="lg" onClick={handleNext} disabled={!canProceed()} className="min-w-32">
            {currentStep === 5 ? 'Generate Estimate' : 'Continue'} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {showComparison && (
        <ComparisonView
          estimates={historicalEstimates.filter(e => selectedForCompare.includes(e.id))}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
