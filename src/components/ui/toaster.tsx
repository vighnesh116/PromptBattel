import React from 'react';
import { ToastProvider, ToastItem, useToastContext } from './toast';

function ToastList() {
  const { toasts, dismiss } = useToastContext();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}

export function Toaster() {
  return (
    <ToastProvider>
      <ToastList />
    </ToastProvider>
  );
}
