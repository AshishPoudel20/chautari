import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useData, useSelectors } from '../../data/store';
import { composeDigestSummary, scheduleDigest } from '../../services/digest';
import { navigateToMainTab } from '../../utils/navigation';

// Reschedules local digest notifications when preference or circle data changes.
export default function DigestManager({ navigationRef }) {
  const { state } = useData();
  const { circleById } = useSelectors();
  const askedPermission = useRef(false);

  useEffect(() => {
    if (!state.booted || !state.currentUserId) return;
    const summary = composeDigestSummary(state, circleById);
    scheduleDigest(state.digestMode || 'daily', summary).catch((e) => {
      console.warn('[digest] schedule failed:', e?.message || e);
    });
  }, [state.booted, state.currentUserId, state.digestMode, state.questions, state.joinedCircles]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.screen === 'Circles' && navigationRef?.current) {
        navigateToMainTab(navigationRef.current, 'Circles');
      }
    });
    return () => sub.remove();
  }, [navigationRef]);

  useEffect(() => {
    if (!state.booted || !state.currentUserId || askedPermission.current) return;
    if (state.digestMode && state.digestMode !== 'off') {
      askedPermission.current = true;
      import('../../services/digest').then((m) => m.ensureNotificationPermissions());
    }
  }, [state.booted, state.currentUserId, state.digestMode]);

  return null;
}
