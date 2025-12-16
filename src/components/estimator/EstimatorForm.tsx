import { useState, useMemo, useEffect, useRef } from 'react';
import { Calculator, Clock, DollarSign, Download, Save, History, GitCompare, ChevronUp, Loader2, Users, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectInfoSection } from './sections/ProjectInfoSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { TechnologySection } from './sections/TechnologySection';
import { PlatformSection } from './sections/PlatformSection';
import { PMSection } from './sections/PMSection';
import { DevelopmentSection } from './sections/DevelopmentSection';
import { QADeploySection } from './sections/QADeploySection';
import { ComparisonView } from './ComparisonView';
import { ShareEstimateDialog } from './ShareEstimateDialog';
import { CommentsSection } from './CommentsSection';
import { SprintBreakdown } from './SprintBreakdown';
import { HistoricalMatchPanel } from './HistoricalMatchPanel';
import { ProjectFormData, defaultFormData, ProjectEstimate, CustomItem, EXPERIENCE_LEVELS } from '@/types/estimator';
import { calculateEstimate, formatCurrency, formatDuration } from '@/lib/estimationEngine';
import { generatePDFReport } from '@/lib/pdfExport';
import { useEstimateStorage } from '@/hooks/useEstimateStorage';
import { toast } from 'sonner';

export function EstimatorForm() {
  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData);
  const [showHistory, setShowHistory] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [historicalEstimates, setHistoricalEstimates] = useState<any[]>([]);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeViewers, setActiveViewers] = useState(0);
  
  const [showEstimate, setShowEstimate] = useState(false);
  
  const { saveEstimate, loadEstimates, getHistoricalMatch, saving, loading } = useEstimateStorage();
  const summaryRef = useRef<HTMLDivElement>(null);

  const handleChange = (updates: Partial<ProjectFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleCustomItemsChange = (customItems: CustomItem[]) => {
    setFormData((prev) => ({ ...prev, customItems }));
  };

  // Calculate estimate with experience multiplier
  const liveEstimate = useMemo(() => {
    const baseEstimate = calculateEstimate(formData);
    const experienceLevel = EXPERIENCE_LEVELS.find(e => e.value === formData.teamExperience);
    const multiplier = experienceLevel?.multiplier || 1;
    
    // Apply platform multiplier for multi-platform
    const platformMultiplier = 1 + ((formData.platforms?.length || 1) - 1) * 0.2;
    
    return {
      ...baseEstimate,
      totalHours: Math.round(baseEstimate.totalHours * multiplier * platformMultiplier),
      totalWeeks: Math.round(baseEstimate.totalWeeks * multiplier * platformMultiplier * 10) / 10,
      totalCost: Math.round(baseEstimate.totalCost * multiplier * platformMultiplier),
      teamExperience: formData.teamExperience,
      technologies: formData.technologies,
    };
  }, [formData]);

  useEffect(() => {
    loadEstimates().then(setHistoricalEstimates);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate active viewers (in real app, use Supabase Realtime presence)
  useEffect(() => {
    const randomViewers = Math.floor(Math.random() * 3);
    setActiveViewers(randomViewers);
  }, []);

  const handleSaveEstimate = async () => {
    if (!formData.projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    await saveEstimate(liveEstimate, formData);
    const updated = await loadEstimates();
    setHistoricalEstimates(updated);
    toast.success('Estimate saved successfully!');
  };

  const handleNewEstimate = () => {
    setFormData(defaultFormData);
    setShowEstimate(false);
    scrollToTop();
    toast.success('Started new estimate');
  };

  const handleGenerateEstimate = () => {
    if (!formData.projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    setShowEstimate(true);
    setTimeout(() => {
      summaryRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDownloadPDF = async () => {
    if (!formData.projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    setGenerating(true);
    try {
      await generatePDFReport(liveEstimate);
      toast.success('PDF report downloaded!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  const toggleCompareSelection = (id: string) => {
    setSelectedForCompare(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(-4)
    );
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b -mx-4 px-4 py-3 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-primary" />
            <span className="font-semibold hidden sm:inline">Project Estimator</span>
            {activeViewers > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{activeViewers} viewing</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-primary">{formatDuration(liveEstimate.totalWeeks)}</div>
                <div className="text-xs text-muted-foreground hidden sm:block">Time</div>
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div className="text-center hidden sm:block">
                <div className="font-bold">{formatCurrency(liveEstimate.totalCost)}</div>
                <div className="text-xs text-muted-foreground">Cost</div>
              </div>
            </div>
            
            <Button 
              size="sm" 
              onClick={handleNewEstimate}
              variant="outline"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">New</span>
            </Button>
            
            <ShareEstimateDialog 
              estimateId={liveEstimate.id} 
              projectName={formData.projectName || 'Untitled'} 
            />
            
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
              <History className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">({historicalEstimates.length})</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Historical Estimates Panel */}
      {showHistory && historicalEstimates.length > 0 && (
        <div className="mb-6 p-4 bg-card rounded-xl border shadow-card max-h-64 overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Previous Estimates</h4>
            {selectedForCompare.length >= 2 && (
              <Button variant="outline" size="sm" onClick={() => setShowComparison(true)}>
                <GitCompare className="w-4 h-4 mr-1" />
                Compare ({selectedForCompare.length})
              </Button>
            )}
          </div>
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

      {/* Form Sections */}
      <div className="space-y-8">
        <div>
          <ProjectInfoSection data={formData} onChange={handleChange} />
          <CommentsSection section="project-info" sectionLabel="Project Info" />
        </div>
        
        <div className="h-px bg-border" />
        
        <div>
          <ExperienceSection data={formData} onChange={handleChange} />
          <CommentsSection section="experience" sectionLabel="Experience Level" />
        </div>
        
        <div className="h-px bg-border" />
        
        <div>
          <TechnologySection data={formData} onChange={handleChange} />
          <CommentsSection section="technology" sectionLabel="Technologies" />
        </div>
        
        <div className="h-px bg-border" />
        
        <div>
          <PlatformSection data={formData} onChange={handleChange} />
          <CommentsSection section="platform" sectionLabel="Platforms" />
        </div>
        
        <div className="h-px bg-border" />
        
        <div>
          <PMSection data={formData} onChange={handleChange} onCustomItemsChange={handleCustomItemsChange} />
          <CommentsSection section="pm" sectionLabel="Project Management" />
        </div>
        
        <div className="h-px bg-border" />
        
        <div>
          <DevelopmentSection data={formData} onChange={handleChange} onCustomItemsChange={handleCustomItemsChange} />
          <CommentsSection section="development" sectionLabel="Development" />
        </div>
        
        <div className="h-px bg-border" />
        
        <div>
          <QADeploySection data={formData} onChange={handleChange} onCustomItemsChange={handleCustomItemsChange} />
          <CommentsSection section="qa-deploy" sectionLabel="QA & Deployment" />
        </div>
      </div>

      {/* Generate Estimate Button */}
      <div className="mt-8 flex justify-center">
        <Button 
          size="lg" 
          onClick={handleGenerateEstimate}
          className="px-8"
        >
          <FileText className="w-5 h-5 mr-2" />
          Generate Estimate
        </Button>
      </div>

      {/* Summary Section */}
      {showEstimate && (
        <div ref={summaryRef} className="mt-12 space-y-6">
          <div className="p-6 border-2 border-primary rounded-xl bg-card">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-primary" />
              Final Estimate
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-muted rounded-lg text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{formatDuration(liveEstimate.totalWeeks)}</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{formatCurrency(liveEstimate.totalCost)}</div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <div className="text-2xl font-bold">{liveEstimate.totalHours}</div>
                <div className="text-sm text-muted-foreground">Total Hours</div>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <div className="text-2xl font-bold">{liveEstimate.stages.length}</div>
                <div className="text-sm text-muted-foreground">Stages</div>
              </div>
            </div>

            {/* Stage Breakdown */}
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold">Stage Breakdown</h4>
              {liveEstimate.stages.map((stage, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium capitalize">{stage.stage}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{stage.hours}h</span>
                    <span className="text-muted-foreground">{formatCurrency(stage.cost)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleDownloadPDF} 
                disabled={generating || !formData.projectName.trim()}
                className="flex-1"
                size="lg"
              >
                {generating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Download className="w-5 h-5 mr-2" />}
                {generating ? 'Generating...' : 'Download PDF'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveEstimate} 
                disabled={saving || !formData.projectName.trim()}
                className="flex-1"
                size="lg"
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Saving...' : 'Save Estimate'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleNewEstimate}
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Estimate
              </Button>
            </div>
          </div>

          {/* Sprint Breakdown */}
          <SprintBreakdown stages={liveEstimate.stages} totalWeeks={liveEstimate.totalWeeks} />

          {/* Historical Match Panel */}
          <HistoricalMatchPanel
            projectType={formData.projectType}
            platform={formData.platforms[0] || 'web'}
            complexity={formData.complexity}
            currentHours={liveEstimate.totalHours}
            onApplyAdjustment={(adjustedHours) => {
              toast.info(`Historical data suggests ${adjustedHours} hours - consider adjusting your estimate`);
            }}
          />
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Comparison Modal */}
      {showComparison && (
        <ComparisonView
          estimates={historicalEstimates.filter(e => selectedForCompare.includes(e.id))}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}