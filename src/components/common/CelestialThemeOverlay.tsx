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

// 1. Optical Diffraction Spike Star (Telescopic 4-Point Cross with Ray Glow)
const DiffractionStar: React.FC<{
  top: string;
  left: string;
  size: number;
  delay: number;
  duration?: number;
}> = ({ top, left, size, delay, duration = 1.6 }) => {
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
        className="w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(255,255,255,0.95)]"
      >
        {/* Soft violet outer halo */}
        <circle cx="12" cy="12" r="5" fill="#c4b5fd" opacity="0.45" />
        {/* Vertical primary ray */}
        <line x1="12" y1="1" x2="12" y2="23" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
        {/* Horizontal primary ray */}
        <line x1="1" y1="12" x2="23" y2="12" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
        {/* Diagonal subtle rays */}
        <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" stroke="#e0e7ff" strokeWidth="0.8" opacity="0.75" strokeLinecap="round" />
        <line x1="5.5" y1="18.5" x2="18.5" y2="5.5" stroke="#e0e7ff" strokeWidth="0.8" opacity="0.75" strokeLinecap="round" />
        {/* Intense white center point */}
        <circle cx="12" cy="12" r="2.3" fill="#ffffff" />
      </svg>
    </div>
  );
};

// 2. Classic 5-Point Twinkling Celestial Star
const ClassicFivePointStar: React.FC<{
  top: string;
  left: string;
  size: number;
  delay: number;
  duration?: number;
}> = ({ top, left, size, delay, duration = 1.8 }) => {
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
        className="w-full h-full text-white overflow-visible drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]"
      >
        <polygon
          points="12,1.5 15.2,8.5 22.8,9.2 17,14.2 18.7,21.8 12,17.8 5.3,21.8 7,14.2 1.2,9.2 8.8,8.5"
          fill="#ffffff"
        />
        <circle cx="12" cy="12" r="2.2" fill="#fef08a" />
      </svg>
    </div>
  );
};

// 3. Deep Cosmic Starfield Pinpoint Star
const PinpointStar: React.FC<{
  top: string;
  left: string;
  size: number;
  delay: number;
  duration?: number;
}> = ({ top, left, size, delay, duration = 1.4 }) => {
  return (
    <div
      className="absolute rounded-full pointer-events-none select-none bg-white"
      style={{
        top,
        left,
        width: `${size}px`,
        height: `${size}px`,
        boxShadow: `0 0 ${size * 2}px #ffffff, 0 0 ${size * 4}px rgba(196, 181, 253, 0.9)`,
        animation: `star-twinkle ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
};

// Shooting Star with glowing meteor tip & luminous trail
const ShootingStar: React.FC<{
  top: string;
  right: string;
  length?: number;
  delay: number;
  angle?: number;
}> = ({ top, right, length = 220, delay, angle = -32 }) => {
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
        className="relative h-[3px] rounded-full bg-gradient-to-l from-white via-purple-300 to-transparent shadow-[0_0_14px_rgba(255,255,255,1)]"
        style={{ width: `${length}px` }}
      >
        {/* Glowing Meteor Tip */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_16px_#ffffff,0_0_24px_#c084fc]" />
      </div>
    </div>
  );
};

// Optical Diffraction Cross Stars (Telescopic Stars)
const DIFFRACTION_STARS = [
  { top: '9%', left: '14%', size: 22, delay: 0.1 },
  { top: '16%', left: '32%', size: 20, delay: 0.35 },
  { top: '12%', left: '52%', size: 24, delay: 0.2 },
  { top: '24%', left: '68%', size: 18, delay: 0.45 },
  { top: '35%', left: '84%', size: 22, delay: 0.15 },
  { top: '28%', left: '18%', size: 18, delay: 0.6 },
  { top: '48%', left: '12%', size: 20, delay: 0.25 },
  { top: '42%', left: '62%', size: 22, delay: 0.5 },
  { top: '58%', left: '78%', size: 20, delay: 0.3 },
  { top: '65%', left: '25%', size: 18, delay: 0.4 },
  { top: '72%', left: '45%', size: 22, delay: 0.15 },
  { top: '80%', left: '60%', size: 20, delay: 0.55 },
  { top: '75%', left: '88%', size: 24, delay: 0.2 },
  { top: '86%', left: '30%', size: 18, delay: 0.65 },
  { top: '84%', left: '10%', size: 22, delay: 0.35 },
];

// Classic 5-Point Twinkling Stars
const CLASSIC_STARS = [
  { top: '15%', left: '22%', size: 14, delay: 0.2 },
  { top: '22%', left: '42%', size: 16, delay: 0.5 },
  { top: '30%', left: '76%', size: 15, delay: 0.3 },
  { top: '44%', left: '28%', size: 14, delay: 0.7 },
  { top: '54%', left: '48%', size: 16, delay: 0.25 },
  { top: '68%', left: '82%', size: 15, delay: 0.4 },
  { top: '76%', left: '20%', size: 14, delay: 0.6 },
  { top: '82%', left: '72%', size: 16, delay: 0.15 },
];

// Galaxy Pinpoint Stars (Deep space sparkle field)
const PINPOINT_STARS = [
  { top: '6%', left: '8%', size: 3, delay: 0.1 },
  { top: '8%', left: '28%', size: 2.5, delay: 0.4 },
  { top: '11%', left: '45%', size: 3.5, delay: 0.2 },
  { top: '15%', left: '62%', size: 2, delay: 0.6 },
  { top: '7%', left: '78%', size: 3, delay: 0.3 },
  { top: '18%', left: '88%', size: 2.5, delay: 0.5 },
  { top: '25%', left: '6%', size: 3, delay: 0.25 },
  { top: '27%', left: '25%', size: 2, delay: 0.7 },
  { top: '32%', left: '50%', size: 3.5, delay: 0.15 },
  { top: '36%', left: '66%', size: 2.5, delay: 0.45 },
  { top: '29%', left: '92%', size: 3, delay: 0.35 },
  { top: '40%', left: '16%', size: 2, delay: 0.55 },
  { top: '43%', left: '38%', size: 3, delay: 0.2 },
  { top: '47%', left: '56%', size: 2.5, delay: 0.65 },
  { top: '45%', left: '74%', size: 3.5, delay: 0.1 },
  { top: '52%', left: '8%', size: 2, delay: 0.4 },
  { top: '56%', left: '32%', size: 3, delay: 0.3 },
  { top: '59%', left: '70%', size: 2.5, delay: 0.5 },
  { top: '53%', left: '90%', size: 3, delay: 0.25 },
  { top: '63%', left: '15%', size: 2, delay: 0.7 },
  { top: '66%', left: '54%', size: 3.5, delay: 0.15 },
  { top: '69%', left: '35%', size: 2.5, delay: 0.45 },
  { top: '64%', left: '95%', size: 3, delay: 0.35 },
  { top: '74%', left: '8%', size: 2, delay: 0.6 },
  { top: '77%', left: '38%', size: 3, delay: 0.2 },
  { top: '79%', left: '58%', size: 2.5, delay: 0.5 },
  { top: '81%', left: '84%', size: 3.5, delay: 0.3 },
  { top: '88%', left: '18%', size: 2, delay: 0.4 },
  { top: '91%', left: '48%', size: 3, delay: 0.15 },
  { top: '89%', left: '76%', size: 2.5, delay: 0.65 },
  { top: '93%', left: '92%', size: 3, delay: 0.25 },
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
          <div className="absolute top-10 right-20 w-96 h-96 rounded-full bg-purple-900/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-indigo-950/20 blur-3xl pointer-events-none" />

          {/* Luminous High-Contrast SVG Crescent Moon */}
          <div className="absolute right-[12%] sm:right-[15%] top-[10%] sm:top-[12%] flex items-center justify-center animate-[moon-night_3.1s_ease-out_forwards]">
            {/* Moon Atmospheric Moonlight Aura */}
            <div className="absolute w-64 h-64 rounded-full bg-purple-500/35 blur-3xl" />
            <div className="absolute w-44 h-44 rounded-full bg-violet-400/30 blur-2xl" />

            {/* Vector Crescent Moon */}
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
              <path
                d="M 50 10 A 40 40 0 1 0 90 65 A 34 34 0 1 1 50 10 Z"
                fill="url(#moonGradient)"
              />
              <circle cx="42" cy="46" r="3.5" fill="#7c3aed" opacity="0.35" />
              <circle cx="36" cy="62" r="4.5" fill="#7c3aed" opacity="0.3" />
              <circle cx="54" cy="70" r="3" fill="#7c3aed" opacity="0.25" />
              <circle cx="48" cy="30" r="2.5" fill="#7c3aed" opacity="0.25" />
            </svg>
          </div>

          {/* 1. Telescopic Optical Diffraction Cross Stars */}
          {DIFFRACTION_STARS.map((star, i) => (
            <DiffractionStar
              key={`diff-${i}`}
              top={star.top}
              left={star.left}
              size={star.size}
              delay={star.delay}
              duration={1.6}
            />
          ))}

          {/* 2. Classic 5-Point Twinkling Celestial Stars */}
          {CLASSIC_STARS.map((star, i) => (
            <ClassicFivePointStar
              key={`classic-${i}`}
              top={star.top}
              left={star.left}
              size={star.size}
              delay={star.delay}
              duration={1.8}
            />
          ))}

          {/* 3. Deep Cosmic Starfield Pinpoint Stars */}
          {PINPOINT_STARS.map((star, i) => (
            <PinpointStar
              key={`pin-${i}`}
              top={star.top}
              left={star.left}
              size={star.size}
              delay={star.delay}
              duration={1.4}
            />
          ))}

          {/* 4. Shooting Stars (Meteors) */}
          <ShootingStar top="14%" right="26%" length={240} delay={0.35} />
          <ShootingStar top="34%" right="45%" length={190} delay={1.2} />
          <ShootingStar top="55%" right="20%" length={220} delay={2.0} />
        </div>
      )}
    </div>
  );
};
