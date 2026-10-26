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
        className="w-11 h-7 overflow-visible fill-amber-950 dark:fill-amber-900 drop-shadow-md"
      >
        {/* Left Wing (flapping up & down from shoulder joint) */}
        <path
          d="M 14 10 C 10 2, 3 0, 0 2 C 4 6, 10 9, 14 11 Z"
          className="animate-[bird-wing-left_0.38s_ease-in-out_infinite] origin-[14px_10px]"
        />
        {/* Right Wing (flapping up & down from shoulder joint) */}
        <path
          d="M 18 11 C 22 9, 28 6, 32 2 C 29 0, 22 2, 18 10 Z"
          className="animate-[bird-wing-right_0.38s_ease-in-out_infinite] origin-[18px_10px]"
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

// 4-point Diamond Twinkling Star
const TwinklingStar: React.FC<{
  top: string;
  left: string;
  size: number;
  delay: number;
  duration?: number;
}> = ({ top, left, size, delay, duration = 1.4 }) => {
  return (
    <div
      className="absolute flex items-center justify-center pointer-events-none select-none"
      style={{
        top,
        left,
        width: `${size}px`,
        height: `${size}px`,
        animation: `star-twinkle ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-full h-full text-white overflow-visible drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
      >
        {/* Diamond Star Shape */}
        <path
          d="M 12 0 Q 12 12, 24 12 Q 12 12, 12 24 Q 12 12, 0 12 Q 12 12, 12 0 Z"
          fill="#ffffff"
        />
        {/* Glowing Lavender Core */}
        <circle cx="12" cy="12" r="3.5" fill="#f3e8ff" />
      </svg>
    </div>
  );
};

// Shooting Star with glowing meteor tip & luminous trail
const ShootingStar: React.FC<{
  top: string;
  right: string;
  length?: number;
  delay: number;
  angle?: number;
}> = ({ top, right, length = 200, delay, angle = -32 }) => {
  return (
    <div
      className="absolute pointer-events-none select-none overflow-visible"
      style={{
        top,
        right,
        animation: `shooting-star 1.4s cubic-bezier(0.2, 0.8, 0.4, 1) forwards`,
        animationDelay: `${delay}s`,
        transform: `rotate(${angle}deg)`,
      }}
    >
      <div
        className="relative h-[3px] rounded-full bg-gradient-to-l from-white via-purple-300 to-transparent shadow-[0_0_12px_rgba(255,255,255,1)]"
        style={{ width: `${length}px` }}
      >
        {/* Glowing Meteor Tip */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_16px_#ffffff,0_0_24px_#c084fc]" />
      </div>
    </div>
  );
};

// Preset star coordinates for natural constellation distribution
const STAR_COORDINATES = [
  { top: '10%', left: '12%', size: 18, delay: 0.1 },
  { top: '18%', left: '26%', size: 14, delay: 0.35 },
  { top: '14%', left: '44%', size: 20, delay: 0.2 },
  { top: '32%', left: '15%', size: 12, delay: 0.5 },
  { top: '26%', left: '56%', size: 16, delay: 0.15 },
  { top: '12%', left: '68%', size: 14, delay: 0.4 },
  { top: '38%', left: '72%', size: 18, delay: 0.25 },
  { top: '22%', left: '86%', size: 22, delay: 0.1 },
  { top: '45%', left: '88%', size: 14, delay: 0.6 },
  { top: '52%', left: '22%', size: 16, delay: 0.3 },
  { top: '62%', left: '38%', size: 14, delay: 0.45 },
  { top: '58%', left: '60%', size: 20, delay: 0.2 },
  { top: '70%', left: '76%', size: 16, delay: 0.55 },
  { top: '78%', left: '14%', size: 18, delay: 0.15 },
  { top: '80%', left: '50%', size: 12, delay: 0.7 },
  { top: '75%', left: '85%', size: 16, delay: 0.35 },
  { top: '86%', left: '68%', size: 14, delay: 0.5 },
  { top: '28%', left: '34%', size: 12, delay: 0.65 },
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
      }, 3100);
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
        <div className="relative w-full h-full animate-[fade-out-celestial_3.1s_ease-in-out_forwards]">
          {/* Warm sunrise dawn ambient gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-400/30 via-amber-200/15 to-transparent" />
          <div className="absolute -bottom-24 left-0 right-0 h-[450px] bg-radial-gradient from-amber-300/40 via-orange-200/20 to-transparent blur-3xl" />

          {/* Golden Rising Sun */}
          <div className="absolute left-[20%] bottom-[22%] -translate-x-1/2 flex items-center justify-center animate-[sun-sunrise_3.1s_ease-out_forwards]">
            {/* Outer Solar Aura Bloom */}
            <div className="absolute w-64 h-64 rounded-full bg-amber-400/35 blur-3xl animate-pulse" />
            <div className="absolute w-48 h-48 rounded-full bg-yellow-300/45 blur-2xl" />

            {/* Rotating Solar Flare Corona Rays */}
            <div className="absolute w-40 h-40 rounded-full border-2 border-dashed border-amber-400/50 animate-[spin_24s_linear_infinite]" />
            <div className="absolute w-52 h-52 rounded-full border border-amber-300/40 rotate-45 animate-[spin_32s_linear_infinite_reverse]" />

            {/* Sun Core */}
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 shadow-[0_0_80px_rgba(251,191,36,0.95),0_0_150px_rgba(245,158,11,0.55)] flex items-center justify-center">
              {/* Sun Inner Highlight Reflection */}
              <div className="absolute top-3 left-4 w-9 h-5 rounded-full bg-white/75 rotate-[-25deg] blur-xs" />
            </div>
          </div>

          {/* Morning Birds Soaring Gracefully Across Sky (Slower, relaxed tempo) */}
          {/* Lead Bird 1 (Center V-formation point) */}
          <MorningBird
            scale={1.2}
            className="animate-[bird-flight-lead_3.1s_cubic-bezier(0.2,0.8,0.4,1)_forwards]"
          />

          {/* Wingman Bird 2 (Upper left of lead) */}
          <MorningBird
            scale={0.95}
            className="animate-[bird-flight-wingman1_3.1s_cubic-bezier(0.2,0.8,0.4,1)_forwards]"
            style={{ animationDelay: '0.18s' }}
          />

          {/* Wingman Bird 3 (Lower right of lead) */}
          <MorningBird
            scale={0.9}
            className="animate-[bird-flight-wingman2_3.1s_cubic-bezier(0.2,0.8,0.4,1)_forwards]"
            style={{ animationDelay: '0.3s' }}
          />

          {/* Young Follower Bird 4 (Trailing behind) */}
          <MorningBird
            scale={0.75}
            className="animate-[bird-flight-follower_3.1s_cubic-bezier(0.2,0.8,0.4,1)_forwards]"
            style={{ animationDelay: '0.45s' }}
          />

          {/* Distant High Flying Bird 5 */}
          <MorningBird
            scale={0.6}
            className="animate-[bird-flight-wingman2_3.1s_cubic-bezier(0.2,0.8,0.4,1)_forwards]"
            style={{ animationDelay: '0.6s' }}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. NIGHT SKY & MOON ANIMATION (Switching to Dark Mode)         */}
      {/* ============================================================== */}
      {activeAnimation === 'to-dark' && (
        <div className="relative w-full h-full animate-[fade-out-celestial_3.1s_ease-in-out_forwards]">
          {/* Deep midnight twilight ambient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#090714]/85 via-[#120e24]/50 to-transparent" />

          {/* Luminous High-Contrast SVG Crescent Moon */}
          <div className="absolute right-[14%] top-[12%] flex items-center justify-center animate-[moon-night_3.1s_ease-out_forwards]">
            {/* Moon Atmospheric Moonlight Aura */}
            <div className="absolute w-64 h-64 rounded-full bg-purple-500/35 blur-3xl" />
            <div className="absolute w-44 h-44 rounded-full bg-violet-400/30 blur-2xl" />

            {/* Vector Crescent Moon — 100% visible, sharp & glowing */}
            <svg
              viewBox="0 0 100 100"
              className="relative w-28 h-28 sm:w-36 sm:h-36 drop-shadow-[0_0_35px_rgba(216,180,254,0.95)]"
            >
              <defs>
                <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="35%" stopColor="#f5f3ff" />
                  <stop offset="70%" stopColor="#ddd6fe" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              {/* Crescent Moon Path */}
              <path
                d="M 50 10 A 40 40 0 1 0 90 65 A 34 34 0 1 1 50 10 Z"
                fill="url(#moonGradient)"
              />
              {/* Lunar Crater Details */}
              <circle cx="42" cy="46" r="3.5" fill="#7c3aed" opacity="0.35" />
              <circle cx="36" cy="62" r="4.5" fill="#7c3aed" opacity="0.3" />
              <circle cx="54" cy="70" r="3" fill="#7c3aed" opacity="0.25" />
              <circle cx="48" cy="30" r="2.5" fill="#7c3aed" opacity="0.25" />
            </svg>
          </div>

          {/* Sparkling Diamond Twinkling Stars */}
          {STAR_COORDINATES.map((star, i) => (
            <TwinklingStar
              key={i}
              top={star.top}
              left={star.left}
              size={star.size}
              delay={star.delay}
              duration={1.5}
            />
          ))}

          {/* Shooting Stars Streaking Across Night Sky */}
          {/* Shooting Star 1 */}
          <ShootingStar top="16%" right="24%" length={220} delay={0.35} />

          {/* Shooting Star 2 */}
          <ShootingStar top="36%" right="40%" length={180} delay={1.1} />

          {/* Shooting Star 3 */}
          <ShootingStar top="54%" right="18%" length={210} delay={1.8} />
        </div>
      )}
    </div>
  );
};
