import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'normal' | 'compact' | 'pill-with-label';
  className?: string;
  showTooltip?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'normal',
  className = '',
  showTooltip = true,
}) => {
  const { isDark, toggleTheme } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    toggleTheme(e);
  };

  const isCompact = variant === 'compact';
  const isPill = variant === 'pill-with-label';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={showTooltip ? `Switch to ${isDark ? 'light' : 'dark'} theme` : undefined}
      className={`group relative select-none inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer border active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        isCompact
          ? 'h-9 w-9 rounded-xl border-border bg-surface hover:bg-surface/80 hover:border-brand-500/40 text-ink-primary shadow-xs'
          : isPill
          ? 'h-9 px-3.5 rounded-full border-border bg-surface/90 hover:bg-surface hover:border-brand-500/40 backdrop-blur-md text-ink-primary shadow-xs gap-2.5'
          : 'h-9 px-2.5 sm:px-3 rounded-xl border-border bg-surface hover:bg-surface/80 hover:border-brand-500/40 text-ink-primary shadow-xs gap-2'
      } ${className}`}
    >
      {/* Animated rotating and crossfading Sun / Moon icon container with morning birds and night stars */}
      <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
        {/* Sun & Morning Birds (visible in light mode, rotates & crossfades out in dark mode) */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
            isDark
              ? 'opacity-0 -rotate-90 scale-50 pointer-events-none'
              : 'opacity-100 rotate-0 scale-100'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-500" strokeWidth={2} aria-hidden="true" />
          {/* Micro Morning Bird silhouette in flight */}
          <svg
            viewBox="0 0 16 10"
            className="absolute -top-1 -right-1.5 w-3 h-2 fill-amber-700/85 dark:fill-amber-500/85 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 pointer-events-none select-none"
            aria-hidden="true"
          >
            <path d="M 0 3 C 2 0, 5 0, 7 3 C 9 0, 12 0, 14 3 C 10 4, 8 6, 7 8 C 6 6, 4 4, 0 3 Z" />
          </svg>
        </div>

        {/* Moon & Twinkling Stars (visible in dark mode, rotates & crossfades out in light mode) */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
            isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-50 pointer-events-none'
          }`}
        >
          <Moon className="w-4 h-4 text-brand-300" strokeWidth={2} aria-hidden="true" />
          {/* Micro Twinkling Stars */}
          <span
            className="absolute -top-1.5 -left-1 text-[8px] text-purple-300 leading-none select-none animate-pulse pointer-events-none"
            aria-hidden="true"
          >
            ✦
          </span>
          <span
            className="absolute -bottom-1 -right-1 text-[6px] text-brand-300/80 leading-none select-none pointer-events-none"
            aria-hidden="true"
          >
            ✦
          </span>
        </div>
      </div>

      {/* Label for 'normal' variant on desktop, hidden on compact mobile view */}
      {!isCompact && !isPill && (
        <span className="text-xs font-medium text-ink-secondary group-hover:text-ink-primary transition-colors hidden sm:inline select-none">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}

      {/* Label for 'pill-with-label' variant */}
      {isPill && (
        <span className="text-xs font-medium text-ink-secondary group-hover:text-ink-primary transition-colors select-none">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
};
