import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { CelestialThemeOverlay } from '../components/common/CelestialThemeOverlay';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  celestialAnimation: 'to-light' | 'to-dark' | null;
  toggleTheme: (event?: React.MouseEvent | React.KeyboardEvent | HTMLElement) => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'voice_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // Fallback if localStorage access is restricted
    }
    // If no saved theme, respect system operating system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const [celestialAnimation, setCelestialAnimation] = useState<'to-light' | 'to-dark' | null>(null);
  const celestialTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDark = theme === 'dark';
  const isTransitioningRef = useRef(false);

  // Synchronize <html> root classes and persist to localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  // Clean up celestial timer on unmount
  useEffect(() => {
    return () => {
      if (celestialTimerRef.current) clearTimeout(celestialTimerRef.current);
    };
  }, []);

  // Listen to system preference changes if user hasn't explicitly set preference in localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          setThemeState(e.matches ? 'dark' : 'light');
        }
      } catch {
        // Ignore storage errors
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback((event?: React.MouseEvent | React.KeyboardEvent | HTMLElement) => {
    // Prevent overlapping transitions from rapid repeated clicks
    if (isTransitioningRef.current) return;

    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

    // Trigger celestial flight animation (morning birds & sun for light, moon & stars for dark)
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      if (celestialTimerRef.current) clearTimeout(celestialTimerRef.current);
      setCelestialAnimation(nextTheme === 'light' ? 'to-light' : 'to-dark');
      celestialTimerRef.current = setTimeout(() => {
        setCelestialAnimation(null);
      }, 3100);
    }

    // Check if View Transition API is supported and reduced motion is NOT requested
    const doc = document as any;

    if (doc.startViewTransition && !prefersReducedMotion) {
      isTransitioningRef.current = true;

      // Calculate reveal origin from button position or event coordinates
      let x = window.innerWidth / 2;
      let y = 0;

      if (event) {
        if ('currentTarget' in event && event.currentTarget) {
          const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        } else if (event instanceof HTMLElement) {
          const rect = event.getBoundingClientRect();
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        } else if ('clientX' in event && typeof event.clientX === 'number' && event.clientX > 0) {
          x = event.clientX;
          y = event.clientY;
        }
      }

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      try {
        doc.documentElement.classList.add('theme-transitioning');

        const transition = doc.startViewTransition(() => {
          if (nextTheme === 'dark') {
            doc.documentElement.classList.add('dark');
            doc.documentElement.classList.remove('light');
            doc.documentElement.style.colorScheme = 'dark';
          } else {
            doc.documentElement.classList.remove('dark');
            doc.documentElement.classList.add('light');
            doc.documentElement.style.colorScheme = 'light';
          }
          setThemeState(nextTheme);
        });

        transition.ready
          .then(() => {
            const clipPath = [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ];

            const animation = doc.documentElement.animate(
              {
                clipPath,
              },
              {
                duration: 400,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                pseudoElement: '::view-transition-new(root)',
              }
            );

            animation.finished.finally(() => {
              doc.documentElement.classList.remove('theme-transitioning');
              isTransitioningRef.current = false;
            });
          })
          .catch(() => {
            doc.documentElement.classList.remove('theme-transitioning');
            isTransitioningRef.current = false;
            setThemeState(nextTheme);
          });
      } catch {
        doc.documentElement.classList.remove('theme-transitioning');
        isTransitioningRef.current = false;
        setThemeState(nextTheme);
      }
    } else {
      // Graceful fallback to standard CSS transitions
      setThemeState(nextTheme);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark, celestialAnimation, toggleTheme, setTheme }}>
      {children}
      <CelestialThemeOverlay animation={celestialAnimation} />
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
