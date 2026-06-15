import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useData } from '../data/store';

const DEFAULT_STALE_MS = 45_000;

/**
 * Re-fetch questions + profiles from Supabase and merge into local state.
 * Manual refresh (pull-to-refresh) always hits the server; focus refetch is debounced.
 */
export function useLiveDataRefresh({ onFocus = false, staleMs = DEFAULT_STALE_MS } = {}) {
  const { refreshFromServer } = useData();
  const lastFetchAt = useRef(0);

  const refreshLiveData = useCallback(async ({ force = false } = {}) => {
    if (!refreshFromServer) return null;
    const now = Date.now();
    if (!force && onFocus && now - lastFetchAt.current < staleMs) return null;
    try {
      const bundle = await refreshFromServer();
      lastFetchAt.current = Date.now();
      return bundle;
    } catch (e) {
      console.warn('Failed to refresh live data:', e?.message || e);
      return null;
    }
  }, [refreshFromServer, onFocus, staleMs]);

  useFocusEffect(useCallback(() => {
    if (onFocus) refreshLiveData({ force: false });
  }, [onFocus, refreshLiveData]));

  return useCallback(() => refreshLiveData({ force: true }), [refreshLiveData]);
}
