'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer select-none ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600 transition-transform" />
      )}
    </button>
  );
}
