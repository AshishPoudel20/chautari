import { useCallback, useMemo, useState } from 'react';
import { PAGE_SIZE } from '../feed/rankingConfig';
import {
  buildHotSnapshot,
  buildNewSnapshot,
  hasMoreInSnapshot,
  sliceSnapshot,
} from '../feed/feedRanking';

/**
 * For You feed: Hot (snapshotted decay score) or New (recency).
 * Hot referenceTime is captured once per snapshot; refresh or switching to Hot starts a new snapshot.
 */
export function useForYouFeed(questions, hasExpertAnswer) {
  const [sortMode, setSortMode] = useState('hot');
  const [referenceTime, setReferenceTime] = useState(() => Date.now());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [snapshotGen, setSnapshotGen] = useState(0);

  const snapshot = useMemo(() => {
    if (sortMode === 'new') return buildNewSnapshot(questions);
    return buildHotSnapshot(questions, referenceTime, hasExpertAnswer);
  }, [questions, sortMode, referenceTime, hasExpertAnswer, snapshotGen]);

  const data = useMemo(
    () => sliceSnapshot(snapshot, visibleCount),
    [snapshot, visibleCount],
  );

  const hasMore = hasMoreInSnapshot(snapshot, visibleCount);

  const bumpHotSnapshot = useCallback(() => {
    setReferenceTime(Date.now());
    setSnapshotGen((g) => g + 1);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const changeSortMode = useCallback((mode) => {
    setSortMode((prev) => {
      if (prev === mode) return prev;
      if (mode === 'hot') {
        setReferenceTime(Date.now());
        setSnapshotGen((g) => g + 1);
      }
      setVisibleCount(PAGE_SIZE);
      return mode;
    });
  }, []);

  const refresh = useCallback(() => {
    if (sortMode === 'hot') bumpHotSnapshot();
    else setVisibleCount(PAGE_SIZE);
  }, [sortMode, bumpHotSnapshot]);

  const loadMore = useCallback(() => {
    setVisibleCount((n) => Math.min(n + PAGE_SIZE, snapshot.length));
  }, [snapshot.length]);

  return {
    sortMode,
    setSortMode: changeSortMode,
    data,
    hasMore,
    loadMore,
    refresh,
    referenceTime,
    totalCount: snapshot.length,
  };
}
