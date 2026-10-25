import { useEffect } from 'react';
import { useToast } from './Toast';
import { registerDispatchErrorHandler } from '../../data/store';

/** Registers global toast handler for failed user-action dispatches. */
export default function DispatchErrorBridge() {
  const showToast = useToast();

  useEffect(() => {
    registerDispatchErrorHandler((message) => {
      showToast(message, { tone: 'danger' });
    });
    return () => registerDispatchErrorHandler(null);
  }, [showToast]);

  return null;
}
