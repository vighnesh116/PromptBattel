import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (opts: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const duration = opts.duration ?? 5000;
    setToasts((prev) => [...prev, { ...opts, id }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

// Individual Toast display component
interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const variantClasses: Record<ToastVariant, string> = {
  default: 'bg-white border border-border text-foreground',
  destructive: 'bg-destructive text-destructive-foreground border border-destructive',
  success: 'bg-green-50 border border-green-200 text-green-900',
  warning: 'bg-yellow-50 border border-yellow-200 text-yellow-900',
};

export function ToastItem({ toast: t, onDismiss }: ToastItemProps) {
  const variant = t.variant ?? 'default';
  return (
    <div
      className={`toast-enter flex w-full max-w-sm items-start gap-3 rounded-lg p-4 shadow-lg ${variantClasses[variant]}`}
      role="alert"
    >
      <div className="flex-1 min-w-0">
        {t.title && <p className="text-sm font-semibold">{t.title}</p>}
        {t.description && <p className="text-sm opacity-90 mt-0.5">{t.description}</p>}
      </div>
      <button
        onClick={() => onDismiss(t.id)}
        className="shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
