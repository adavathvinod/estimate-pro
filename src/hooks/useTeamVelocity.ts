import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VelocityRecord {
  id: string;
  estimateId: string;
  projectName: string;
  estimatedHours: number;
  actualHours: number | null;
  estimatedWeeks: number;
  actualWeeks: number | null;
  completedAt: string | null;
  status: 'in-progress' | 'completed';
  accuracy: number | null;
  variancePercent: number | null;
}

export interface VelocityStats {
  totalProjects: number;
  completedProjects: number;
  averageAccuracy: number;
  averageVariance: number;
  trend: 'improving' | 'declining' | 'stable';
  recentAccuracy: number;
}

export function useTeamVelocity() {
  const [velocityRecords, setVelocityRecords] = useState<VelocityRecord[]>([]);
  const [stats, setStats] = useState<VelocityStats | null>(null);
  const [loading, setLoading] = useState(false);

  const loadVelocityData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_estimates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to velocity records
      const records: VelocityRecord[] = (data || []).map((est: any) => {
        const formData = est.form_data as any;
        const actualHours = formData?.actualHours || null;
        const actualWeeks = formData?.actualWeeks || null;
        const completedAt = formData?.completedAt || null;
        const status = completedAt ? 'completed' : 'in-progress';
        
        let accuracy = null;
        let variancePercent = null;
        
        if (actualHours && est.total_hours) {
          accuracy = Math.min(100, (1 - Math.abs(actualHours - est.total_hours) / est.total_hours) * 100);
          variancePercent = ((actualHours - est.total_hours) / est.total_hours) * 100;
        }

        return {
          id: est.id,
          estimateId: est.id,
          projectName: est.project_name,
          estimatedHours: est.total_hours,
          actualHours,
          estimatedWeeks: est.total_weeks,
          actualWeeks,
          completedAt,
          status,
          accuracy,
          variancePercent,
        };
      });

      setVelocityRecords(records);
      
      // Calculate stats
      const completed = records.filter(r => r.status === 'completed' && r.accuracy !== null);
      const recent = completed.slice(0, 5);
      
      if (completed.length > 0) {
        const avgAccuracy = completed.reduce((sum, r) => sum + (r.accuracy || 0), 0) / completed.length;
        const avgVariance = completed.reduce((sum, r) => sum + Math.abs(r.variancePercent || 0), 0) / completed.length;
        const recentAccuracy = recent.length > 0 
          ? recent.reduce((sum, r) => sum + (r.accuracy || 0), 0) / recent.length 
          : 0;
        
        // Determine trend
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (recent.length >= 3) {
          const oldAccuracy = completed.slice(5, 10).reduce((sum, r) => sum + (r.accuracy || 0), 0) / Math.max(1, completed.slice(5, 10).length);
          if (recentAccuracy > oldAccuracy + 5) trend = 'improving';
          else if (recentAccuracy < oldAccuracy - 5) trend = 'declining';
        }

        setStats({
          totalProjects: records.length,
          completedProjects: completed.length,
          averageAccuracy: Math.round(avgAccuracy * 10) / 10,
          averageVariance: Math.round(avgVariance * 10) / 10,
          trend,
          recentAccuracy: Math.round(recentAccuracy * 10) / 10,
        });
      } else {
        setStats({
          totalProjects: records.length,
          completedProjects: 0,
          averageAccuracy: 0,
          averageVariance: 0,
          trend: 'stable',
          recentAccuracy: 0,
        });
      }
    } catch (error) {
      console.error('Error loading velocity data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateActualTime = useCallback(async (
    estimateId: string, 
    actualHours: number, 
    actualWeeks: number
  ) => {
    try {
      // Get current estimate
      const { data: current, error: fetchError } = await supabase
        .from('project_estimates')
        .select('form_data')
        .eq('id', estimateId)
        .single();
      
      if (fetchError) throw fetchError;

      const formData = (current?.form_data as any) || {};
      const updatedFormData = {
        ...formData,
        actualHours,
        actualWeeks,
        completedAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('project_estimates')
        .update({ form_data: updatedFormData })
        .eq('id', estimateId);

      if (error) throw error;
      
      await loadVelocityData();
      return true;
    } catch (error) {
      console.error('Error updating actual time:', error);
      return false;
    }
  }, [loadVelocityData]);

  useEffect(() => {
    loadVelocityData();
  }, [loadVelocityData]);

  return {
    velocityRecords,
    stats,
    loading,
    loadVelocityData,
    updateActualTime,
  };
}
