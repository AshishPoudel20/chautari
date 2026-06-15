import { useCallback, useMemo, useState, useEffect } from 'react';
import { PAGE_SIZE } from '../feed/rankingConfig';
import { composeForYouFeed } from '../feed/feedComposition';
import { hasMoreInSnapshot, sliceSnapshot } from '../feed/feedRanking';

/**
 * For You feed: 80/20 joined/discovery composition, then Hot or New ordering.
 * Hot referenceTime is captured once per snapshot; refresh or switching to Hot starts a new snapshot.
 */
export function useForYouFeed({
  questions,
  hasExpertAnswer,
  joinedCircleIds,
  circleById,
  currentUserId = 'me',
}) {
  const [sortMode, setSortMode] = useState('hot');
  const [referenceTime, setReferenceTime] = useState(() => Date.now());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [snapshotGen, setSnapshotGen] = useState(0);

  const questionsFingerprint = useMemo(
    () => questions.map((q) => `${q.id}:${q.createdAt}:${(q.answers || []).length}`).join('|'),
    [questions],
  );

  // After a server refresh, reset pagination and recompute the Hot snapshot.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setReferenceTime(Date.now());
    setSnapshotGen((g) => g + 1);
  }, [questionsFingerprint]);

  const snapshot = useMemo(() => composeForYouFeed(questions, {
    joinedCircleIds,
    circleById,
    currentUserId,
    referenceTime,
    hasExpertAnswer,
    sortMode,
  }), [
    questions,
    joinedCircleIds,
    circleById,
    currentUserId,
    referenceTime,
    hasExpertAnswer,
    sortMode,
    snapshotGen,
  ]);

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
    setReferenceTime(Date.now());
    setSnapshotGen((g) => g + 1);
    setVisibleCount(PAGE_SIZE);
  }, []);

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
