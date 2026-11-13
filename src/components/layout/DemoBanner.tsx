import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function DemoBanner() {
  const { isDemo } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemo || dismissed) return null;

  return (
    <div
      className="w-full bg-yellow-400 text-yellow-900 px-4 py-2.5 flex items-center justify-between gap-4 text-sm font-medium z-[60]"
      role="banner"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span aria-hidden="true">⚠️</span>
        <span className="font-semibold">DEMO MODE</span>
        <span className="hidden sm:inline">—</span>
        <span className="hidden sm:inline">
          Supabase not configured. Showing sample data only.{' '}
          <a
            href="https://github.com/resq-ai/resq-ai#setup"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-yellow-950 transition-colors"
          >
            See setup instructions
          </a>
        </span>
        <span className="sm:hidden text-xs">Showing sample data only.</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 p-1 rounded hover:bg-yellow-500 transition-colors"
        aria-label="Dismiss demo banner"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
