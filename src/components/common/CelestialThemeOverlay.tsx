import React, { useEffect, useState } from 'react';

interface CelestialThemeOverlayProps {
  animation: 'to-light' | 'to-dark' | null;
}

// Stylized Morning Bird with natural flapping wings
const MorningBird: React.FC<{
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ scale = 1, className = '', style = {} }) => {
  return (
    <div
      className={`absolute pointer-events-none select-none ${className}`}
      style={{
        ...style,
        transform: `${style.transform || ''} scale(${scale})`,
      }}
    >
      <svg
        viewBox="0 0 36 22"
        className="w-10 h-6 overflow-visible fill-amber-900/85 dark:fill-amber-800/85 drop-shadow-md"
      >
        {/* Left Wing (flapping up & down from shoulder joint) */}
        <path
          d="M 14 10 C 10 2, 3 0, 0 2 C 4 6, 10 9, 14 11 Z"
          className="animate-[bird-wing-left_0.32s_ease-in-out_infinite] origin-[14px_10px]"
        />
        {/* Right Wing (flapping up & down from shoulder joint) */}
        <path
          d="M 18 11 C 22 9, 28 6, 32 2 C 29 0, 22 2, 18 10 Z"
          className="animate-[bird-wing-right_0.32s_ease-in-out_infinite] origin-[18px_10px]"
        />
        {/* Aerodynamic Bird Body */}
        <ellipse cx="16" cy="10.5" rx="3.5" ry="1.6" />
        {/* Tail Feathers */}
        <polygon points="14,11 18,11 16,16" />
        {/* Beak */}
        <polygon points="16,9.5 16,11.5 19,10.5" />
      </svg>
    </div>
  );
};

// Preset star coordinates for natural constellation dispersion
const STAR_COORDINATES = [
  { top: '12%', left: '15%', size: 14, delay: 0.1 },
  { top: '22%', left: '28%', size: 10, delay: 0.35 },
  { top: '16%', left: '42%', size: 16, delay: 0.2 },
  { top: '35%', left: '18%', size: 8, delay: 0.5 },
  { top: '28%', left: '55%', size: 12, delay: 0.15 },
  { top: '14%', left: '68%', size: 10, delay: 0.4 },
  { top: '42%', left: '72%', size: 14, delay: 0.25 },
  { top: '25%', left: '84%', size: 18, delay: 0.1 },
  { top: '48%', left: '88%', size: 8, delay: 0.6 },
  { top: '55%', left: '24%', size: 12, delay: 0.3 },
  { top: '65%', left: '40%', size: 10, delay: 0.45 },
  { top: '60%', left: '62%', size: 16, delay: 0.2 },
  { top: '72%', left: '78%', size: 12, delay: 0.55 },
  { top: '80%', left: '16%', size: 14, delay: 0.15 },
  { top: '82%', left: '52%', size: 8, delay: 0.7 },
  { top: '78%', left: '85%', size: 12, delay: 0.35 },
];

export const CelestialThemeOverlay: React.FC<CelestialThemeOverlayProps> = ({ animation }) => {
  const [activeAnimation, setActiveAnimation] = useState<'to-light' | 'to-dark' | null>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActiveAnimation(null);
      return;
    }

    if (animation) {
      setActiveAnimation(animation);
      const timer = setTimeout(() => {
        setActiveAnimation(null);
      }, 1850);
      return () => clearTimeout(timer);
    } else {
      setActiveAnimation(null);
    }
  }, [animation]);

  if (!activeAnimation) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden select-none"
    >
      {/* ============================================================== */}
      {/* 1. MORNING SUNRISE ANIMATION (Switching to Light Mode)         */}
      {/* ============================================================== */}
      {activeAnimation === 'to-light' && (
        <div className="relative w-full h-full animate-[fade-out-celestial_1.85s_ease-in-out_forwards]">
          {/* Warm sunrise dawn ambient gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-400/25 via-amber-200/10 to-transparent" />
          <div className="absolute -bottom-20 left-0 right-0 h-96 bg-radial-gradient from-amber-300/30 via-orange-200/15 to-transparent blur-2xl" />

          {/* Golden Rising Sun */}
          <div className="absolute left-[20%] bottom-[24%] -translate-x-1/2 flex items-center justify-center animate-[sun-sunrise_1.85s_ease-out_forwards]">
            {/* Outer Solar Aura Bloom */}
            <div className="absolute w-56 h-56 rounded-full bg-amber-400/30 blur-3xl animate-pulse" />
            <div className="absolute w-40 h-40 rounded-full bg-yellow-300/40 blur-xl" />

            {/* Rotating Solar Flare Corona Rays */}
            <div className="absolute w-36 h-36 rounded-full border-2 border-dashed border-amber-400/50 animate-[spin_18s_linear_infinite]" />
            <div className="absolute w-44 h-44 rounded-full border border-amber-300/30 rotate-45 animate-[spin_24s_linear_infinite_reverse]" />

            {/* Sun Core */}
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 shadow-[0_0_60px_rgba(251,191,36,0.9),0_0_120px_rgba(245,158,11,0.5)] flex items-center justify-center">
              {/* Sun Inner Highlight */}
              <div className="absolute top-2.5 left-3.5 w-8 h-5 rounded-full bg-white/70 rotate-[-25deg] blur-xs" />
            </div>
          </div>

          {/* Morning Birds Flying Across the Sky */}
          {/* Lead Bird 1 (Center V-formation point) */}
          <MorningBird
            scale={1.15}
            className="animate-[bird-flight-lead_1.85s_cubic-bezier(0.25,1,0.5,1)_forwards]"
          />

          {/* Wingman Bird 2 (Upper left of lead) */}
          <MorningBird
            scale={0.9}
            className="animate-[bird-flight-wingman1_1.85s_cubic-bezier(0.25,1,0.5,1)_forwards]"
            style={{ animationDelay: '0.12s' }}
          />

          {/* Wingman Bird 3 (Lower right of lead) */}
          <MorningBird
            scale={0.85}
            className="animate-[bird-flight-wingman2_1.85s_cubic-bezier(0.25,1,0.5,1)_forwards]"
            style={{ animationDelay: '0.2s' }}
          />

          {/* Young Follower Bird 4 (Trailing behind) */}
          <MorningBird
            scale={0.7}
            className="animate-[bird-flight-follower_1.85s_cubic-bezier(0.25,1,0.5,1)_forwards]"
            style={{ animationDelay: '0.32s' }}
          />

          {/* Distant High Flying Bird 5 */}
          <MorningBird
            scale={0.55}
            className="animate-[bird-flight-wingman2_1.85s_cubic-bezier(0.25,1,0.5,1)_forwards]"
            style={{ animationDelay: '0.42s' }}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. NIGHT SKY & MOON ANIMATION (Switching to Dark Mode)         */}
      {/* ============================================================== */}
      {activeAnimation === 'to-dark' && (
        <div className="relative w-full h-full animate-[fade-out-celestial_1.85s_ease-in-out_forwards]">
          {/* Deep midnight twilight ambient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#090714]/75 via-[#120e24]/40 to-transparent" />

          {/* Luminous Crescent Moon in Night Sky */}
          <div className="absolute right-[16%] top-[14%] flex items-center justify-center animate-[moon-night_1.85s_ease-out_forwards]">
            {/* Moon Atmospheric Violet Aura */}
            <div className="absolute w-52 h-52 rounded-full bg-purple-600/25 blur-3xl" />
            <div className="absolute w-36 h-36 rounded-full bg-brand-400/20 blur-xl" />

            {/* Crescent Moon Body */}
            <div className="relative w-26 h-26 rounded-full overflow-hidden shadow-[0_0_50px_rgba(167,139,250,0.85),0_0_100px_rgba(112,83,222,0.45)]">
              {/* Moon Luminous Surface */}
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#f5f3ff] via-[#ddd6fe] to-[#c4b5fd]" />
              {/* Dark Cutout creating sharp crescent curve */}
              <div className="absolute -top-2 -left-3 w-24 h-24 rounded-full bg-[#090714]" />
              {/* Moon Lunar Crater Details */}
              <div className="absolute top-5 right-6 w-2.5 h-2.5 rounded-full bg-purple-400/25 blur-[0.5px]" />
              <div className="absolute top-10 right-4 w-3.5 h-3.5 rounded-full bg-purple-400/20 blur-[0.5px]" />
              <div className="absolute bottom-6 right-7 w-2 h-2 rounded-full bg-purple-400/20 blur-[0.5px]" />
            </div>
          </div>

          {/* Twinkling Starry Constellations */}
          {STAR_COORDINATES.map((star, i) => (
            <div
              key={i}
              className="absolute text-purple-200/90 animate-[star-twinkle_1.2s_ease-in-out_infinite]"
              style={{
                top: star.top,
                left: star.left,
                fontSize: `${star.size}px`,
                animationDelay: `${star.delay}s`,
                filter: 'drop-shadow(0 0 6px rgba(196,181,253,0.8))',
              }}
            >
              ✦
            </div>
          ))}

          {/* Shooting Stars Streaking Diagonally Across Night Sky */}
          {/* Shooting Star 1 */}
          <div
            className="absolute top-[16%] right-[24%] w-48 h-[2px] bg-gradient-to-l from-white via-purple-300 to-transparent rotate-[-35deg] animate-[shooting-star_1s_ease-out_forwards]"
            style={{ animationDelay: '0.2s', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9))' }}
          />

          {/* Shooting Star 2 */}
          <div
            className="absolute top-[34%] right-[38%] w-36 h-[2px] bg-gradient-to-l from-white via-indigo-300 to-transparent rotate-[-35deg] animate-[shooting-star_1s_ease-out_forwards]"
            style={{ animationDelay: '0.6s', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9))' }}
          />

          {/* Shooting Star 3 */}
          <div
            className="absolute top-[52%] right-[18%] w-44 h-[2px] bg-gradient-to-l from-white via-purple-200 to-transparent rotate-[-35deg] animate-[shooting-star_1s_ease-out_forwards]"
            style={{ animationDelay: '0.95s', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9))' }}
          />
        </div>
      )}
    </div>
  );
};
