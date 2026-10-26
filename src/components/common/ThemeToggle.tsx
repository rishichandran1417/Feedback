import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'normal' | 'compact' | 'pill-with-label';
  className?: string;
  showTooltip?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'normal',
  className = '',
  showTooltip = true,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [particles, setParticles] = useState<Particle[]>([]);

  const handleToggle = (e: React.MouseEvent) => {
    // Spawn micro-particle burst radiating from toggle center
    const newParticles: Particle[] = Array.from({ length: 8 }).map((_, i) => {
      const angle = (i * Math.PI * 2) / 8;
      const distance = 24 + Math.random() * 12;
      return {
        id: Date.now() + i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        color: isDark ? '#fbbf24' : '#a78bfa',
      };
    });

    setParticles(newParticles);
    setTimeout(() => setParticles([]), 550);

    toggleTheme(e);
  };

  const isCompact = variant === 'compact';
  const isPill = variant === 'pill-with-label';

  return (
    <div className={`relative inline-flex items-center gap-2 select-none ${className}`}>
      {/* Click Particle Burst Animation */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full z-50 animate-ping"
          style={{
            backgroundColor: p.color,
            transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))`,
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: 0,
          }}
        />
      ))}

      {/* Main Interactive Animated Switch */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={showTooltip ? `Switch to ${isDark ? 'Light' : 'Dark'} mode` : undefined}
        className={`group relative flex items-center p-1 rounded-full border cursor-pointer transition-all duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 hover:scale-[1.04] active:scale-[0.95] overflow-hidden ${
          isCompact ? 'w-14 h-7.5' : 'w-16 h-8.5'
        } ${
          isDark
            ? 'bg-gradient-to-r from-[#0c0822] via-[#1a1144] to-[#281566] border-[#38267a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_0_12px_rgba(112,83,222,0.25)]'
            : 'bg-gradient-to-r from-[#38bdf8] via-[#60a5fa] to-[#818cf8] border-[#93c5fd] shadow-[inset_0_2px_4px_rgba(0,0,0,0.15),0_0_12px_rgba(96,165,250,0.35)]'
        }`}
      >
        {/* Track Celestial Background: Day / Clouds or Night / Stars */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
          {/* Night Sky: Twinkling Stars */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              isDark ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Star 1 */}
            <span className="absolute top-[22%] left-[18%] w-1 h-1 rounded-full bg-white animate-pulse" />
            {/* Star 2 */}
            <span
              className="absolute top-[68%] left-[26%] w-1.5 h-1.5 rounded-full bg-purple-200 animate-pulse"
              style={{ animationDelay: '0.4s' }}
            />
            {/* Star 3 */}
            <span
              className="absolute top-[28%] left-[44%] w-0.5 h-0.5 rounded-full bg-white animate-pulse"
              style={{ animationDelay: '0.8s' }}
            />
            {/* Star 4 */}
            <span
              className="absolute top-[65%] left-[54%] w-1 h-1 rounded-full bg-indigo-200 animate-pulse"
              style={{ animationDelay: '1.2s' }}
            />
          </div>

          {/* Day Sky: Drifting Morning Clouds */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              !isDark ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Cloud Puff 1 */}
            <div className="absolute -bottom-1 right-2 flex items-center opacity-85 transition-transform duration-700 group-hover:translate-x-0.5">
              <span className="w-4 h-4 rounded-full bg-white/90 shadow-xs inline-block -mr-1.5" />
              <span className="w-5 h-5 rounded-full bg-white/90 shadow-xs inline-block" />
              <span className="w-3.5 h-3.5 rounded-full bg-white/90 shadow-xs inline-block -ml-1" />
            </div>
            {/* Cloud Puff 2 */}
            <div className="absolute top-0.5 right-7 opacity-75 transition-transform duration-700 group-hover:-translate-x-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/80 inline-block -mr-1" />
              <span className="w-3 h-3 rounded-full bg-white/80 inline-block" />
            </div>
          </div>
        </div>

        {/* Sliding & Morphing Celestial Orb (Sun / Moon Thumb) */}
        <div
          className={`relative z-10 flex items-center justify-center rounded-full transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
            isCompact ? 'w-5.5 h-5.5' : 'w-6.5 h-6.5'
          } ${
            isDark
              ? 'translate-x-[28px] sm:translate-x-[30px] rotate-[-15deg]'
              : 'translate-x-0 rotate-0'
          }`}
        >
          {isDark ? (
            /* Crescent Moon with Ethereal Violet Aura */
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#f5f3ff] via-[#ddd6fe] to-[#a78bfa] shadow-[0_0_12px_rgba(167,139,250,0.9),0_0_20px_rgba(112,83,222,0.5)] transition-transform duration-500 group-hover:rotate-[15deg]">
              {/* Moon Shadow / Crater Details */}
              <span className="absolute top-[20%] left-[20%] w-1.5 h-1.5 rounded-full bg-[#8b5cf6]/30" />
              <span className="absolute bottom-[25%] left-[40%] w-1 h-1 rounded-full bg-[#8b5cf6]/25" />
              <span className="absolute top-[45%] right-[25%] w-1 h-1 rounded-full bg-[#8b5cf6]/20" />
              {/* Subtle crescent inner shadow */}
              <div className="absolute inset-0 rounded-full shadow-[inset_-2px_-2px_4px_rgba(109,40,217,0.4)]" />
            </div>
          ) : (
            /* Radiant Golden Sun with Rotating Solar Corona */
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#fef08a] via-[#fde047] to-[#f59e0b] shadow-[0_0_14px_rgba(245,158,11,0.9),0_0_24px_rgba(251,191,36,0.5)] transition-transform duration-500 group-hover:scale-105">
              {/* Rotating Solar Flares */}
              <div className="absolute -inset-1 animate-[spin_10s_linear_infinite] flex items-center justify-center pointer-events-none opacity-80">
                <span className="absolute w-full h-0.5 bg-gradient-to-r from-amber-400/80 via-transparent to-amber-400/80 rounded-full" />
                <span className="absolute h-full w-0.5 bg-gradient-to-b from-amber-400/80 via-transparent to-amber-400/80 rounded-full" />
                <span className="absolute w-full h-0.5 rotate-45 bg-gradient-to-r from-amber-400/70 via-transparent to-amber-400/70 rounded-full" />
                <span className="absolute w-full h-0.5 -rotate-45 bg-gradient-to-r from-amber-400/70 via-transparent to-amber-400/70 rounded-full" />
              </div>
              {/* Sun Core Glow */}
              <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-white/60 to-transparent pointer-events-none" />
            </div>
          )}
        </div>
      </button>

      {/* Pill with Label Text (Optional variant for menus / drawers / standalone views) */}
      {isPill && (
        <span
          onClick={handleToggle}
          className="text-xs font-medium text-ink-secondary hover:text-ink-primary cursor-pointer transition-colors"
        >
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </div>
  );
};
