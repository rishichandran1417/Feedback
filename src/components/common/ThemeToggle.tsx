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
      {/* Animated rotating and crossfading Sun / Moon icon container */}
      <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
        {/* Sun Icon (visible in light mode, rotates & crossfades out in dark mode) */}
        <Sun
          className={`w-4 h-4 text-amber-500 absolute inset-0 m-auto transition-all duration-300 ease-out ${
            isDark
              ? 'opacity-0 -rotate-90 scale-50 pointer-events-none'
              : 'opacity-100 rotate-0 scale-100'
          }`}
          strokeWidth={2}
          aria-hidden="true"
        />

        {/* Moon Icon (visible in dark mode, rotates & crossfades out in light mode) */}
        <Moon
          className={`w-4 h-4 text-brand-300 absolute inset-0 m-auto transition-all duration-300 ease-out ${
            isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-50 pointer-events-none'
          }`}
          strokeWidth={2}
          aria-hidden="true"
        />
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
