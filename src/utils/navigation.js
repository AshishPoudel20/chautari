import { useRef, useCallback } from 'react';
import { InteractionManager, Platform } from 'react-native';

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

  // Back is never guarded — the 400ms lock after navigate made custom back buttons feel dead.
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const replace = useCallback(
    (...args) => guard(() => navigation.replace(...args)),
    [navigation, guard],
  );

  return { navigate, goBack, replace, guard };
}

/** Defer until Alert / action sheet has fully dismissed — prevents ghost overlays blocking taps. */
export function runAfterAlert(action) {
  InteractionManager.runAfterInteractions(() => {
    const run = () => action();
    if (Platform.OS === 'ios') {
      // iOS keeps a transparent modal layer briefly after Alert dismiss.
      requestAnimationFrame(() => setTimeout(run, 350));
    } else {
      requestAnimationFrame(run);
    }
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
