import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectFormData } from '@/types/estimator';

interface UseRealtimeFormSyncOptions {
  channelName: string;
  formData: ProjectFormData;
  onRemoteUpdate: (data: ProjectFormData) => void;
  isHost?: boolean; // Only host broadcasts, viewers receive
}

export function useRealtimeFormSync({
  channelName,
  formData,
  onRemoteUpdate,
  isHost = false,
}: UseRealtimeFormSyncOptions) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastBroadcastRef = useRef<string>('');

  // Broadcast form data changes (only host does this)
  const broadcastFormData = useCallback((data: ProjectFormData) => {
    if (!channelRef.current || !isHost) return;
    
    const dataString = JSON.stringify(data);
    // Prevent duplicate broadcasts
    if (dataString === lastBroadcastRef.current) return;
    lastBroadcastRef.current = dataString;

    channelRef.current.send({
      type: 'broadcast',
      event: 'form_sync',
      payload: { formData: data, timestamp: Date.now() },
    });
  }, [isHost]);

  useEffect(() => {
    const channel = supabase.channel(`form-sync:${channelName}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'form_sync' }, ({ payload }) => {
        if (!isHost && payload?.formData) {
          console.log('Received remote form update:', payload.formData);
          onRemoteUpdate(payload.formData);
        }
      })
      .on('broadcast', { event: 'request_sync' }, () => {
        // When a new viewer joins and requests sync, host sends current state
        if (isHost) {
          broadcastFormData(formData);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Form sync channel connected');
          // New viewers request current state
          if (!isHost) {
            channel.send({
              type: 'broadcast',
              event: 'request_sync',
              payload: {},
            });
          }
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [channelName, isHost, onRemoteUpdate, broadcastFormData, formData]);

  // Broadcast when form data changes (host only)
  useEffect(() => {
    if (isHost) {
      broadcastFormData(formData);
    }
  }, [formData, isHost, broadcastFormData]);

  return { broadcastFormData };
}
