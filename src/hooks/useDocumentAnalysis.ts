import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DocumentAnalysis, UploadedDocument } from '@/types/estimator';
import { toast } from 'sonner';

export function useDocumentAnalysis() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const uploadDocument = async (file: File): Promise<UploadedDocument | null> => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-documents')
        .getPublicUrl(filePath);

      return {
        id: crypto.randomUUID(),
        fileName: file.name,
        fileUrl: publicUrl,
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const analyzeDocument = async (content: string, projectType: string): Promise<DocumentAnalysis | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: { documentContent: content, projectType }
      });

      if (error) throw error;
      
      if (data.success && data.analysis) {
        toast.success('Document analyzed successfully!');
        return data.analysis;
      }
      
      throw new Error(data.error || 'Analysis failed');
    } catch (error) {
      console.error('Error analyzing document:', error);
      toast.error('Failed to analyze document');
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  return { uploadDocument, analyzeDocument, readFileAsText, uploading, analyzing };
}
