import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { queryKeys } from '../api/queries.js';
import { useUIStore } from '../store/uiStore.js';

/**
 * Custom React Hook for Real-Time Cross-Device Synchronization
 * Connects to Supabase WebSocket channel and keeps all connected devices
 * (mobile phones, inspector desktops, vendor terminals) in 100% real-time sync.
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      return;
    }

    // Subscribe to changes on complaints table
    const complaintsChannel = supabase
      .channel('realtime:railfood:complaints')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        (payload) => {
          // Immediately re-fetch and refresh complaints in TanStack Query
          queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all });

          if (payload.eventType === 'INSERT') {
            useUIStore.getState().showToast({
              type: 'info',
              title: '⚡ Live Grievance Received',
              message: `Ref #${payload.new.referenceNo} registered via QR scan.`
            });
          } else if (payload.eventType === 'UPDATE') {
            useUIStore.getState().showToast({
              type: 'success',
              title: '🔄 Grievance Lifecycle Updated',
              message: `Ref #${payload.new.referenceNo} status: ${payload.new.status}`
            });
          }
        }
      )
      .subscribe();

    // Subscribe to changes on batches table
    const batchesChannel = supabase
      .channel('realtime:railfood:batches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'batches' },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.metadata.batches });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(complaintsChannel);
      supabase.removeChannel(batchesChannel);
    };
  }, [queryClient]);
}
