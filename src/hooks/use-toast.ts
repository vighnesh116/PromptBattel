import { useCallback, useRef } from 'react';
import { ToastContext } from '../components/ui/toast';
import { useContext } from 'react';
import type { Toast } from '../components/ui/toast';

export function useToast() {
  const ctx = useContext(ToastContext);

  // If called outside ToastProvider (e.g. in a module), provide a no-op
  const toast = useCallback(
    (opts: Omit<Toast, 'id'>) => {
      if (ctx) {
        ctx.toast(opts);
      } else {
        console.warn('[useToast] toast called outside ToastProvider', opts);
      }
    },
    [ctx]
  );

  const dismiss = useCallback(
    (id: string) => {
      ctx?.dismiss(id);
    },
    [ctx]
  );

  return { toast, dismiss, toasts: ctx?.toasts ?? [] };
}
