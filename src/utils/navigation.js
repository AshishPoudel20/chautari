import { useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { useGoBack as useSafeGoBack } from '../hooks/useGoBack';

const GUARD_MS = 400;

/** Map auth UUID (and 'me') to the local profile id used in app state. */
export function resolveUserId(userId, authUserId) {
  if (!userId) return userId;
  if (userId === 'me') return 'me';
  if (authUserId && userId === authUserId) return 'me';
  return userId;
}

export function isSelfUserId(userId, authUserId) {
  return resolveUserId(userId, authUserId) === 'me';
}

/**
 * Navigate to a MainTabs screen (Home, Circles, Experts, Profile).
 * Walks up the tree so it works from tab children, nested stacks, and root-stack screens.
 */
export function navigateToMainTab(navigation, tabName) {
  if (!navigation) return;

  let nav = navigation;
  for (let depth = 0; depth < 6 && nav; depth += 1) {
    const routeNames = nav.getState?.()?.routeNames ?? [];
    if (routeNames.includes(tabName)) {
      nav.navigate(tabName);
      return;
    }
    if (routeNames.includes('Main')) {
      nav.navigate('Main', { screen: tabName });
      return;
    }
    nav = nav.getParent?.();
  }
}

/** Switch to the Profile tab (MyProfileScreen inside MainTabs). */
export function openSelfProfile(navigation) {
  navigateToMainTab(navigation, 'Profile');
}

export function openExpertProfile(navigation, { userId, title, authUserId, navigate }) {
  if (isSelfUserId(userId, authUserId)) {
    openSelfProfile(navigation);
    return;
  }
  (navigate || navigation.navigate.bind(navigation))('ExpertProfile', { userId, title });
}

// Prevents double-tap from pushing duplicate screens onto the stack.
export function useNavigationGuard(navigation) {
  const locked = useRef(false);
  const safeGoBack = useSafeGoBack(navigation);

  const guard = useCallback((action) => {
    if (locked.current) return;
    locked.current = true;
    action();
    requestIdleCallback(() => {
      setTimeout(() => {
        locked.current = false;
      }, GUARD_MS);
    });
  }, []);

  const navigate = useCallback(
    (...args) => guard(() => navigation.navigate(...args)),
    [navigation, guard],
  );

  // Safe back is never guarded — the 400ms lock after navigate made custom back buttons feel dead.
  const goBack = safeGoBack;

  const replace = useCallback(
    (...args) => guard(() => navigation.replace(...args)),
    [navigation, guard],
  );

  return { navigate, goBack, replace, guard };
}

/** Defer until Alert / action sheet has fully dismissed — prevents ghost overlays blocking taps. */
export function runAfterAlert(action) {
  requestIdleCallback(() => {
    const run = () => action();
    if (Platform.OS === 'ios') {
      // iOS keeps a transparent modal layer briefly after Alert dismiss.
      requestAnimationFrame(() => setTimeout(run, 350));
    } else {
      requestAnimationFrame(run);
    }
  });
}

export function openAuthorProfile(navigate, userById, authorId, { anonymous = false, authUserId = null, navigation = null } = {}) {
  if (anonymous || !authorId) return;
  if (isSelfUserId(authorId, authUserId)) {
    if (navigation) {
      openSelfProfile(navigation);
    } else {
      navigate('Main', { screen: 'Profile' });
    }
    return;
  }
  const resolvedId = resolveUserId(authorId, authUserId);
  const u = userById(resolvedId) || userById(authorId);
  if (!u) return;
  const screen = u.verified ? 'ExpertProfile' : 'UserProfile';
  navigate(screen, { userId: resolvedId, title: u.name });
}
