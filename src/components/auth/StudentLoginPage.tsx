import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import {
  GraduationCap,
  ShieldAlert,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

export const StudentLoginPage: React.FC = () => {
  const { user, loading, loginWithGoogle, allowedEmailDomain } = useAuth();
  const { settings } = useSystem();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  // Check URL error query param (Requirement 6: /login?error=domain)
  const searchParams = new URLSearchParams(location.search);
  const isDomainError = searchParams.get('error') === 'domain';
  const rawError = searchParams.get('error');

  const allowedDomain = allowedEmailDomain || '@cet.ac.in';
  const collegeName = settings.college_info.name || 'College of Engineering Trivandrum';

  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'administrator') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    }
  }, [user, loading, navigate, location]);

  // Handle Google OAuth Sign-in with account picker
  const handleGoogleSignIn = async () => {
    setInternalError(null);
    setIsLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        if (res.error === 'domain') {
          navigate('/login?error=domain', { replace: true });
        } else {
          setInternalError(res.error || 'Failed to authenticate with Google.');
        }
      }
    } catch (err: any) {
      setInternalError(err?.message || 'Authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-8 sm:py-12 px-3.5 sm:px-6 lg:px-8 relative">
      {/* Top Floating Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-20">
        <ThemeToggle variant="pill-with-label" />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <img
          src="/voice-logo.png"
          alt="voice"
          className="h-14 sm:h-16 w-auto object-contain mx-auto rounded-xl shadow-md"
        />
        <p className="text-xs text-ink-secondary mt-1">
          College of Engineering Trivandrum • Student Grievance & Feedback Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md space-y-4">
        {/* Requirement 6: Clear banner for rejected non-college domain */}
        {isDomainError && (
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-5 shadow-xs space-y-3 animate-in fade-in-50 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Please sign in with your college email ({allowedDomain}).
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                  Only official institutional accounts ending in {allowedDomain} are authorized. Personal email accounts (such as personal Gmail or Yahoo) are strictly restricted.
                </p>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-900/80 dark:hover:bg-amber-900 text-white dark:text-amber-100 text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try again with college email ({allowedDomain})</span>
              </button>
            </div>
          </div>
        )}

        {/* Other URL or Internal Error */}
        {!isDomainError && (rawError || internalError) && (
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 shadow-xs flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-900 dark:text-rose-200">Authentication Notice</p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300/90">
                {internalError || (
                  rawError === 'access_denied'
                    ? 'Sign-in cancelled by user.'
                    : rawError === 'no_role'
                    ? 'Your account has no registered role in the college database. Please contact the Registrar.'
                    : rawError === 'unauthorized'
                    ? 'You do not have authorization to view that resource.'
                    : `Authentication notice: ${rawError}`
                )}
              </p>
            </div>
          </div>
        )}

        {/* Main Sign-In Card: Requirement 1 & 4 (Google OAuth Only) */}
        <div className="bg-surface py-6 sm:py-8 px-4 sm:px-8 border border-border rounded-2xl shadow-sm space-y-6">
          <div className="text-center space-y-1.5 border-b border-border pb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Restricted Institutional Access
            </span>
            <h3 className="text-lg font-bold text-ink-primary pt-1">
              Sign In with College Account
            </h3>
            <p className="text-xs text-ink-secondary">
              Use your official Google Workspace college email to access your redressal dashboard.
            </p>
          </div>

          {/* Primary 1-Click Google OAuth Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-border bg-background hover:bg-surface text-ink-primary font-semibold text-sm shadow-xs transition-all hover:border-brand-500/40 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Connecting to Google Workspace...' : 'Sign in with Google (OAuth)'}</span>
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/"
                className="text-xs font-medium text-ink-secondary hover:text-brand-400 transition-colors inline-flex items-center gap-1.5"
              >
                &larr; Return to Portal Home (Browse without sign-in)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
