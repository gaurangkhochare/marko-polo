'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface DatabaseStatusBannerProps {
  error: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function DatabaseStatusBanner({
  error,
  onRetry,
  isRetrying = false,
}: DatabaseStatusBannerProps) {
  if (!error) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/80 p-3 text-amber-900 dark:text-amber-200 transition-all">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">MongoDB Connection Alert: </span>
            <span>{error}</span>
            <div className="text-amber-700 dark:text-amber-300 mt-1">
              Ensure local MongoDB is running (`mongod`) or configure{' '}
              <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">
                MONGODB_URI
              </code>{' '}
              with a free MongoDB Atlas connection string in{' '}
              <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">
                .env.local
              </code>
              .
            </div>
          </div>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors shrink-0 shadow-xs disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Checking...' : 'Retry Connection'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

