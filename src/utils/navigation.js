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
