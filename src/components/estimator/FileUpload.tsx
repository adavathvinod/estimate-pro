import { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadedDocument, DocumentAnalysis } from '@/types/estimator';
import { useDocumentAnalysis } from '@/hooks/useDocumentAnalysis';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  documents: UploadedDocument[];
  projectType: string;
  onDocumentsChange: (documents: UploadedDocument[]) => void;
  onAnalysisComplete: (analysis: DocumentAnalysis) => void;
}

export function FileUpload({ documents, projectType, onDocumentsChange, onAnalysisComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { uploadDocument, analyzeDocument, readFileAsText, uploading, analyzing } = useDocumentAnalysis();

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, [projectType]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      // Only accept text-based files for analysis
      const validTypes = ['.txt', '.md', '.doc', '.docx', '.pdf'];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(ext)) {
        continue;
      }

      // Upload file
      const uploadedDoc = await uploadDocument(file);
      if (!uploadedDoc) continue;

      // Read content for analysis (works best with text files)
      try {
        const content = await readFileAsText(file);
        
        // Analyze the document
        const analysis = await analyzeDocument(content, projectType);
        
        if (analysis) {
          uploadedDoc.analysis = analysis;
          onAnalysisComplete(analysis);
        }
        
        onDocumentsChange([...documents, uploadedDoc]);
      } catch (error) {
        console.error('Error processing file:', error);
        // Still add the file even if analysis fails
        onDocumentsChange([...documents, uploadedDoc]);
      }
    }
  };

  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter(doc => doc.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
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

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Uploaded Documents</h4>
          {documents.map(doc => (
            <div
              key={doc.id}
              className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border"
            >
              <FileText className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{doc.fileName}</p>
                
                {doc.analysis && (
                  <div className="mt-2 p-2 bg-muted/50 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle className="w-3 h-3" />
                      AI Analysis Complete
                    </div>
                    <p className="text-muted-foreground line-clamp-2">
                      {doc.analysis.summary}
                    </p>
                    <div className="flex gap-4 mt-1">
                      <span>Screens: <strong>{doc.analysis.suggestedScreens}</strong></span>
                      <span>Complexity: <strong className="capitalize">{doc.analysis.suggestedComplexity}</strong></span>
                    </div>
                    {doc.analysis.suggestedFeatures.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {doc.analysis.suggestedFeatures.slice(0, 5).map((feature, i) => (
                          <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
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
          ))}
        </div>
      )}
    </div>
  );
}
