-- Create table for historical project estimates
CREATE TABLE public.project_estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  project_stage TEXT NOT NULL,
  platform TEXT NOT NULL,
  complexity TEXT NOT NULL,
  total_hours NUMERIC NOT NULL,
  total_weeks NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  form_data JSONB NOT NULL,
  stage_estimates JSONB NOT NULL,
  custom_items JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for uploaded documents
CREATE TABLE public.project_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID REFERENCES public.project_estimates(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  analysis_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public access for now (no auth required)
ALTER TABLE public.project_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access" ON public.project_estimates FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.project_estimates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.project_estimates FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.project_estimates FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.project_documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.project_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.project_documents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.project_documents FOR DELETE USING (true);

-- Create storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('project-documents', 'project-documents', true);

-- Create storage policies
CREATE POLICY "Allow public document uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-documents');
CREATE POLICY "Allow public document reads" ON storage.objects FOR SELECT USING (bucket_id = 'project-documents');
CREATE POLICY "Allow public document deletes" ON storage.objects FOR DELETE USING (bucket_id = 'project-documents');