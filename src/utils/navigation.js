import { useRef, useCallback } from 'react';
import { InteractionManager } from 'react-native';

const GUARD_MS = 400;

// Prevents double-tap from pushing duplicate screens onto the stack.
export function useNavigationGuard(navigation) {
  const locked = useRef(false);

  const guard = useCallback((action) => {
    if (locked.current) return;
    locked.current = true;
    action();
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        locked.current = false;
      }, GUARD_MS);
    });
  }, []);

  const navigate = useCallback(
    (...args) => guard(() => navigation.navigate(...args)),
    [navigation, guard],
  );

  const goBack = useCallback(
    () => guard(() => navigation.goBack()),
    [navigation, guard],
  );

  const replace = useCallback(
    (...args) => guard(() => navigation.replace(...args)),
    [navigation, guard],
  );

  return { navigate, goBack, replace, guard };
}

/** Defer until Alert / action sheet has fully dismissed — prevents ghost overlays blocking taps. */
export function runAfterAlert(action) {
  InteractionManager.runAfterInteractions(() => {
    requestAnimationFrame(action);
  });
}

export function openAuthorProfile(navigate, userById, authorId, { anonymous = false } = {}) {
  if (anonymous || !authorId) return;
  if (authorId === 'me') {
    navigate('Main', { screen: 'Profile' });
    return;
  }
  const u = userById(authorId);
  if (!u) return;
  const screen = u.verified ? 'ExpertProfile' : 'UserProfile';
  navigate(screen, { userId: authorId, title: u.name });
}
