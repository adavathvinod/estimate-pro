import { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2, Download, GitCompare, Shield, PlayCircle, Pause, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UploadedDocument, DocumentAnalysis } from '@/types/estimator';
import { useDocumentAnalysis } from '@/hooks/useDocumentAnalysis';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDuration } from '@/lib/estimationEngine';
import { exportAnalysisToPDF } from '@/lib/analysisExport';
import { DocumentComparisonView } from './DocumentComparisonView';

interface FileUploadProps {
  documents: UploadedDocument[];
  projectType: string;
  onDocumentsChange: (documents: UploadedDocument[]) => void;
  onAnalysisComplete: (analysis: DocumentAnalysis) => void;
}

interface BatchProgress {
  total: number;
  completed: number;
  current: string;
  failed: string[];
}

export function FileUpload({ documents, projectType, onDocumentsChange, onAnalysisComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const { uploadDocument, analyzeDocument, readFileAsText, uploading, analyzing } = useDocumentAnalysis();

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 1) {
      setBatchMode(true);
      setPendingFiles(files);
    } else {
      await processFiles(files);
    }
  }, [projectType]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 1) {
      setBatchMode(true);
      setPendingFiles(files);
    } else {
      await processFiles(files);
    }
  };

  const startBatchAnalysis = async () => {
    const validFiles = pendingFiles.filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return ['.txt', '.md', '.doc', '.docx', '.pdf'].includes(ext);
    });

    if (validFiles.length === 0) {
      setPendingFiles([]);
      setBatchMode(false);
      return;
    }

    setBatchProgress({
      total: validFiles.length,
      completed: 0,
      current: validFiles[0].name,
      failed: []
    });

    const newDocs: UploadedDocument[] = [];
    
    for (let i = 0; i < validFiles.length; i++) {
      if (isPaused) {
        // Store remaining files and exit
        setPendingFiles(validFiles.slice(i));
        return;
      }

      const file = validFiles[i];
      setBatchProgress(prev => prev ? {
        ...prev,
        current: file.name,
        completed: i
      } : null);

      try {
        const uploadedDoc = await uploadDocument(file);
        if (!uploadedDoc) {
          setBatchProgress(prev => prev ? {
            ...prev,
            failed: [...prev.failed, file.name]
          } : null);
          continue;
        }

        const content = await readFileAsText(file);
        const analysis = await analyzeDocument(content, projectType);
        
        if (analysis) {
          uploadedDoc.analysis = {
            ...analysis,
            documentId: uploadedDoc.id
          };
          onAnalysisComplete(analysis);
        }
        
        newDocs.push(uploadedDoc);
      } catch (error) {
        console.error('Error processing file:', file.name, error);
        setBatchProgress(prev => prev ? {
          ...prev,
          failed: [...prev.failed, file.name]
        } : null);
      }

      setBatchProgress(prev => prev ? {
        ...prev,
        completed: i + 1
      } : null);

      // Small delay between files to avoid rate limiting
      if (i < validFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    onDocumentsChange([...documents, ...newDocs]);
    
    // Cleanup
    setTimeout(() => {
      setBatchProgress(null);
      setBatchMode(false);
      setPendingFiles([]);
      setIsPaused(false);
    }, 2000);
  };

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      const validTypes = ['.txt', '.md', '.doc', '.docx', '.pdf'];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(ext)) continue;

      const uploadedDoc = await uploadDocument(file);
      if (!uploadedDoc) continue;

      try {
        const content = await readFileAsText(file);
        const analysis = await analyzeDocument(content, projectType);
        
        if (analysis) {
          uploadedDoc.analysis = {
            ...analysis,
            documentId: uploadedDoc.id
          };
          onAnalysisComplete(analysis);
        }
        
        onDocumentsChange([...documents, uploadedDoc]);
      } catch (error) {
        console.error('Error processing file:', error);
        onDocumentsChange([...documents, uploadedDoc]);
      }
    }
  };

  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter(doc => doc.id !== id));
    setSelectedForComparison(prev => prev.filter(docId => docId !== id));
  };

  const toggleComparison = (id: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(id)) return prev.filter(docId => docId !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-100';
    if (score >= 60) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const comparisonItems = documents
    .filter(doc => selectedForComparison.includes(doc.id) && doc.analysis)
    .map(doc => ({
      id: doc.id,
      fileName: doc.fileName,
      analysis: doc.analysis!
    }));

  const progressPercent = batchProgress 
    ? (batchProgress.completed / batchProgress.total) * 100 
    : 0;

  return (
    <div className="space-y-4">
      {/* Batch Mode UI */}
      {batchMode && pendingFiles.length > 0 && !batchProgress && (
        <div className="p-4 bg-primary/5 rounded-xl border-2 border-primary/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Batch Analysis Ready
            </h4>
            <Badge variant="outline">{pendingFiles.length} files</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {pendingFiles.length} documents will be analyzed sequentially with AI
          </p>
          <div className="flex flex-wrap gap-2 mb-4 max-h-24 overflow-y-auto">
            {pendingFiles.map((file, i) => (
              <span key={i} className="px-2 py-1 bg-muted rounded text-xs truncate max-w-[200px]">
                {file.name}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={startBatchAnalysis} className="flex-1">
              <PlayCircle className="w-4 h-4 mr-2" />
              Start Batch Analysis
            </Button>
            <Button variant="outline" onClick={() => {
              setPendingFiles([]);
              setBatchMode(false);
            }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Batch Progress */}
      {batchProgress && (
        <div className="p-4 bg-primary/5 rounded-xl border-2 border-primary/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              Analyzing Documents
            </h4>
            <Badge variant="outline">
              {batchProgress.completed}/{batchProgress.total}
            </Badge>
          </div>
          
          <Progress value={progressPercent} className="h-2 mb-3" />
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground truncate max-w-[200px]">
              {batchProgress.completed < batchProgress.total 
                ? `Processing: ${batchProgress.current}`
                : 'Complete!'}
            </span>
            {batchProgress.completed < batchProgress.total && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? (
                  <>
                    <PlayCircle className="w-4 h-4 mr-1" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </>
                )}
              </Button>
            )}
          </div>

          {batchProgress.failed.length > 0 && (
            <div className="mt-3 p-2 bg-destructive/10 rounded text-xs text-destructive">
              Failed: {batchProgress.failed.join(', ')}
            </div>
          )}

          {batchProgress.completed === batchProgress.total && (
            <div className="mt-3 flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">All documents analyzed!</span>
            </div>
          )}
        </div>
      )}

      {/* Drop Zone */}
      {!batchProgress && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          {uploading || analyzing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">
                {uploading ? 'Uploading document...' : 'Analyzing with AI...'}
              </p>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">Drop PRD or requirements documents here</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports .txt, .md, .doc, .docx, .pdf files
              </p>
              <p className="text-xs text-primary mt-2">
                Drop multiple files for batch analysis
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Browse Files
              </Button>
            </>
          )}
          
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".txt,.md,.doc,.docx,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Compare Button */}
      {documents.filter(d => d.analysis).length >= 2 && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {selectedForComparison.length > 0 
              ? `${selectedForComparison.length} document(s) selected for comparison`
              : 'Select documents below to compare analyses'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComparison(true)}
            disabled={selectedForComparison.length < 2}
          >
            <GitCompare className="w-4 h-4 mr-2" />
            Compare Selected
          </Button>
        </div>
      )}

      {/* Comparison View */}
      {showComparison && comparisonItems.length >= 2 && (
        <DocumentComparisonView
          items={comparisonItems}
          onRemove={(id) => setSelectedForComparison(prev => prev.filter(docId => docId !== id))}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Uploaded Documents ({documents.length})</h4>
          {documents.map(doc => (
            <div
              key={doc.id}
              className={cn(
                "p-4 bg-card rounded-lg border transition-all",
                selectedForComparison.includes(doc.id) 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-border"
              )}
            >
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{doc.fileName}</p>
                    {doc.analysis && (
                      <Badge className={getConfidenceColor(doc.analysis.confidenceScore)}>
                        <Shield className="w-3 h-3 mr-1" />
                        {doc.analysis.confidenceScore}%
                      </Badge>
                    )}
                  </div>
                  
                  {doc.analysis && (
                    <div className="mt-3 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {doc.analysis.summary}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-2 bg-muted/50 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="font-semibold">{formatDuration(doc.analysis.estimatedWeeks)}</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Hours</p>
                          <p className="font-semibold">{doc.analysis.estimatedHours}h</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Cost</p>
                          <p className="font-semibold text-primary">{formatCurrency(doc.analysis.estimatedCost)}</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Complexity</p>
                          <p className="font-semibold capitalize">{doc.analysis.suggestedComplexity}</p>
                        </div>
                      </div>

                      {doc.analysis.breakdown && (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                          {Object.entries(doc.analysis.breakdown).map(([stage, hours]) => (
                            <div key={stage} className="p-2 bg-background rounded border text-center">
                              <p className="text-muted-foreground capitalize">{stage}</p>
                              <p className="font-medium">{hours}h</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {doc.analysis.suggestedFeatures.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {doc.analysis.suggestedFeatures.slice(0, 8).map((feature, i) => (
                            <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                              {feature}
                            </span>
                          ))}
                          {doc.analysis.suggestedFeatures.length > 8 && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                              +{doc.analysis.suggestedFeatures.length - 8} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportAnalysisToPDF(doc.analysis!, doc.fileName)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export PDF
                        </Button>
                        {documents.filter(d => d.analysis).length >= 2 && (
                          <Button
                            variant={selectedForComparison.includes(doc.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleComparison(doc.id)}
                          >
                            <GitCompare className="w-4 h-4 mr-2" />
                            {selectedForComparison.includes(doc.id) ? 'Selected' : 'Compare'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeDocument(doc.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
