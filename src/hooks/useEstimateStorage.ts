import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectEstimate, ProjectFormData } from '@/types/estimator';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export function useEstimateStorage() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const saveEstimate = async (estimate: ProjectEstimate, formData: ProjectFormData) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('project_estimates').insert([{
        project_name: estimate.projectName,
        project_type: estimate.projectType,
        project_stage: formData.projectStage,
        platform: Array.isArray(estimate.platform) ? estimate.platform.join(',') : String(estimate.platform),
        complexity: estimate.complexity,
        total_hours: estimate.totalHours,
        total_weeks: estimate.totalWeeks,
        total_cost: estimate.totalCost,
        form_data: JSON.parse(JSON.stringify(formData)) as Json,
        stage_estimates: JSON.parse(JSON.stringify(estimate.stages)) as Json,
        custom_items: JSON.parse(JSON.stringify(estimate.customItems || [])) as Json,
      }]);

      if (error) throw error;
      toast.success('Estimate saved to history!');
      return true;
    } catch (error) {
      console.error('Error saving estimate:', error);
      toast.error('Failed to save estimate');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const loadEstimates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_estimates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading estimates:', error);
      toast.error('Failed to load estimates');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getHistoricalMatch = async (projectType: string, platform: string, complexity: string, totalHours: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-historical-match', {
        body: { projectType, platform, complexity, totalHours }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting historical match:', error);
      return null;
    }
  };

  return { saveEstimate, loadEstimates, getHistoricalMatch, saving, loading };
}
