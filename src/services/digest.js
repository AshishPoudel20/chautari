import * as Notifications from 'expo-notifications';

const DIGEST_NOTIF_ID = 'chautari-daily-digest';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermissions() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export function composeDigestSummary(state, circleById) {
  const joined = state.joinedCircles || [];
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const byCircle = {};
  for (const q of state.questions || []) {
    if (!joined.includes(q.circleId)) continue;
    if (q.createdAt < since) continue;
    byCircle[q.circleId] = (byCircle[q.circleId] || 0) + 1;
  }
  const parts = Object.entries(byCircle)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, n]) => `${n} new in ${circleById(id)?.name || 'a circle'}`);

  let expertAnswers = 0;
  for (const q of state.questions || []) {
    if (!joined.includes(q.circleId)) continue;
    expertAnswers += (q.answers || []).filter((a) => {
      const author = state.users.find((u) => u.id === a.authorId);
      return author?.verified && a.createdAt >= since;
    }).length;
  }
  if (expertAnswers > 0) parts.push(`${expertAnswers} expert answer${expertAnswers === 1 ? '' : 's'} in your circles`);

  if (parts.length === 0) return 'Your circles are quiet today — perfect time to post something new.';
  return `Your circles today: ${parts.join(', ')}.`;
}

export async function cancelDigestSchedule() {
  try {
    await Notifications.cancelScheduledNotificationAsync(DIGEST_NOTIF_ID);
  } catch (_) { /* noop */ }
}

export async function scheduleDigest(mode, body) {
  await cancelDigestSchedule();
  if (mode === 'off') return;

  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  const content = {
    title: 'Chautari digest',
    body: body || 'Catch up on your circles.',
    data: { screen: 'Circles', type: 'digest' },
  };

  const baseTrigger = mode === 'weekly'
    ? { weekday: 2, hour: 18, minute: 0, repeats: true }
    : { hour: 18, minute: 0, repeats: true };

  await Notifications.scheduleNotificationAsync({
    identifier: DIGEST_NOTIF_ID,
    content,
    trigger: baseTrigger,
  });
}

export function addDigestInAppNotification(dispatch, summary) {
  dispatch({
    type: 'ADD_NOTIFICATION',
    notification: {
      type: 'digest',
      text: summary,
      createdAt: Date.now(),
      read: false,
    },
  });
}

export async function runDigestPreview(state, circleById, dispatch) {
  const summary = composeDigestSummary(state, circleById);
  addDigestInAppNotification(dispatch, summary);
  return summary;
}
