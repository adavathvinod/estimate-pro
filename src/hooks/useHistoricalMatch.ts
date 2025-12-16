import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HistoricalMatch {
  projectName: string;
  accuracy: number;
  adjustedHours: number;
  originalHours: number;
  suggestion: string;
}

interface UseHistoricalMatchResult {
  match: HistoricalMatch | null;
  message: string | null;
  loading: boolean;
  error: string | null;
  findMatch: (params: {
    projectType: string;
    platform: string;
    complexity: string;
    totalHours: number;
  }) => Promise<void>;
}

export function useHistoricalMatch(): UseHistoricalMatchResult {
  const [match, setMatch] = useState<HistoricalMatch | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findMatch = async (params: {
    projectType: string;
    platform: string;
    complexity: string;
    totalHours: number;
  }) => {
    setLoading(true);
    setError(null);
    setMatch(null);
    setMessage(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-historical-match', {
        body: params
      });

      if (fnError) throw fnError;

      if (data.success) {
        if (data.match) {
          setMatch(data.match);
        } else {
          setMessage(data.message || 'No matching historical data found.');
        }
      } else {
        throw new Error(data.error || 'Failed to find historical match');
      }
    } catch (err) {
      console.error('Historical match error:', err);
      setError(err instanceof Error ? err.message : 'Failed to find historical match');
    } finally {
      setLoading(false);
    }
  };

  return { match, message, loading, error, findMatch };
}
