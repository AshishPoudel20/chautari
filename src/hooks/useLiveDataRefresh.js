import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useData } from '../data/store';
import { fetchLiveBundle } from '../services/liveData';
import { isSupabaseConfigured } from '../lib/supabase';

/** Refetch questions + author profiles from Supabase and merge into local state. */
export function useLiveDataRefresh({ onFocus = false } = {}) {
  const { state, dispatch } = useData();
  const authUserId = state.authUserId;

  const refreshLiveData = useCallback(async () => {
    if (!authUserId || !isSupabaseConfigured()) return;
    try {
      const bundle = await fetchLiveBundle(authUserId);
      dispatch({ type: 'MERGE_LIVE_DATA', payload: bundle });
    } catch (e) {
      console.warn('Failed to refresh live data:', e?.message || e);
    }
  }, [authUserId, dispatch]);

  useFocusEffect(useCallback(() => {
    if (onFocus) refreshLiveData();
  }, [onFocus, refreshLiveData]));

  return refreshLiveData;
}
