import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, isAllowedCollegeEmail, AuthUser } from '../../context/AuthContext';
import { isUsingRealSupabase, supabase } from '../../lib/supabase';
import { AppRole } from '../../types/database';
import {
  ShieldAlert,
  AlertCircle,
  GraduationCap,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Home,
} from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { syncSession, loginWithGoogle, allowedEmailDomain, setAuthUser } = useAuth();

  const [status, setStatus] = useState<'processing' | 'ineligible' | 'error' | 'success'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [ineligibleEmail, setIneligibleEmail] = useState<string>('');
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    const handleOAuthCallback = async () => {
      // 1. Check for URL search params or hash errors
      const searchParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(
        location.hash.startsWith('#') ? location.hash.substring(1) : location.hash
      );

      const error = searchParams.get('error') || hashParams.get('error');
      const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

      if (error) {
        setStatus('error');
        setErrorMessage(
          errorDescription ||
          (error === 'access_denied'
            ? 'Sign-in request was cancelled. You may try again at any time.'
            : `Authentication error: ${error}`)
        );
        return;
      }

      if (!isUsingRealSupabase || !supabase) {
        setStatus('error');
        setErrorMessage('Authentication configuration error: Supabase service is not reachable.');
        return;
      }

      try {
        // 2. Instant PKCE code exchange or hash session establishment
        const code = searchParams.get('code');
        if (code) {
          try {
            await supabase.auth.exchangeCodeForSession(code);
          } catch (codeErr) {
            console.warn('PKCE exchange warning:', codeErr);
          }
        } else {
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken && refreshToken) {
            try {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            } catch (hashErr) {
              console.warn('Hash session set warning:', hashErr);
            }
          }
        }

        // 3. Resolve session
        let session = (await supabase.auth.getSession()).data.session;
        if (!session) {
          for (let i = 0; i < 6; i++) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            session = (await supabase.auth.getSession()).data.session;
            if (session) break;
          }
        }

        if (!session?.user) {
          setStatus('error');
          setErrorMessage('Unable to establish an authenticated session from Google OAuth. Please try signing in again.');
          return;
        }

        const authUser = session.user;
        const userEmail = (authUser.email || '').toLowerCase().trim();

        // 4. Query role (fast check)
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authUser.id)
          .maybeSingle();

        const isAdmin = roleData?.role === 'administrator';

        const isGoogleOAuth = Boolean(
          authUser.app_metadata?.provider === 'google' ||
          authUser.app_metadata?.providers?.includes('google') ||
          authUser.identities?.some((id: any) => id.provider === 'google')
        );

        const isEmailVerified = Boolean(
          isGoogleOAuth ||
          authUser.user_metadata?.email_verified === true ||
          authUser.user_metadata?.email_verified === 'true' ||
          authUser.email_confirmed_at
        );

        // 5. Enforce college email eligibility & verified status
        const configuredDomain = (allowedEmailDomain || '@cet.ac.in').toLowerCase().trim();
        const isCollegeEmail = isAllowedCollegeEmail(userEmail, configuredDomain);
        const isEligible = isAdmin || (isEmailVerified && isCollegeEmail);

        if (!isEligible) {
          setIneligibleEmail(userEmail);
          setStatus('ineligible');
          await supabase.auth.signOut();
          setAuthUser(null);
          return;
        }

        // 6. Assign role (administrator if in DB, otherwise verified college student)
        const assignedRole: AppRole = isAdmin ? 'administrator' : 'student';

        // 7. Resolve profile metadata
        const rawMeta = authUser.user_metadata || {};
        const fullName = rawMeta.full_name || rawMeta.name || userEmail.split('@')[0];
        const avatarUrl = rawMeta.avatar_url || rawMeta.picture || '';
        const studentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;

        const authSession: AuthUser = {
          id: authUser.id,
          email: userEmail,
          full_name: fullName,
          student_id: studentId,
          phone: undefined,
          department: assignedRole === 'administrator' ? 'Central Grievance Redressal Cell' : 'General Studies',
          course_programme: assignedRole === 'administrator' ? 'Administration' : 'Undergraduate',
          avatar_url: avatarUrl,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: assignedRole,
        };

        // 8. Commit to state and localStorage INSTANTLY
        setAuthUser(authSession);
        setStatus('success');

        // 9. Non-blocking background persistence to DB
        if (!roleData?.role) {
          Promise.resolve(supabase.from('user_roles').upsert({ user_id: authUser.id, role: 'student' })).catch(console.warn);
        }
        Promise.resolve(supabase.from('profiles').upsert({
          id: authUser.id,
          email: userEmail,
          full_name: fullName,
          student_id: studentId,
          department: assignedRole === 'administrator' ? 'Central Grievance Redressal Cell' : 'General Studies',
          course_programme: assignedRole === 'administrator' ? 'Administration' : 'Undergraduate',
          avatar_url: avatarUrl,
          is_active: true,
        })).catch(console.warn);

        // 10. Immediately navigate to destination
        if (assignedRole === 'administrator') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch (err: any) {
        console.error('OAuth callback handler error:', err);
        setStatus('error');
        setErrorMessage(err?.message || 'Unexpected error occurred while completing authentication.');
      }
    };

    handleOAuthCallback();
  }, [location, navigate, syncSession, allowedEmailDomain, setAuthUser]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3.5 sm:p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-lg p-5 sm:p-8">
        {/* Processing State */}
        {status === 'processing' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-950/60 border border-brand-800/80 text-brand-300 flex items-center justify-center mx-auto animate-pulse">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink-primary">Verifying Institutional Identity</h2>
              <p className="text-xs text-ink-secondary mt-1">
                Completing Google OAuth authentication and establishing your student session...
              </p>
            </div>
            <div className="flex justify-center pt-2">
              <div className="w-7 h-7 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center space-y-4 animate-in fade-in-50 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink-primary">Authenticated Successfully</h2>
              <p className="text-xs text-ink-secondary mt-1">
                Redirecting you to your portal dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Ineligible Domain State */}
        {status === 'ineligible' && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/50 border border-amber-800/60 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h2 className="text-lg font-bold text-ink-primary">Ineligible Email Account</h2>
              <p className="text-xs text-ink-secondary mt-1">
                This grievance portal is exclusively accessible to verified college accounts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background border border-border text-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-muted text-[11px] font-semibold uppercase shrink-0">Selected Account</span>
                <span className="font-mono font-medium text-rose-400 truncate max-w-[140px] sm:max-w-[200px]" title={ineligibleEmail}>
                  {ineligibleEmail}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
                <span className="text-ink-muted text-[11px] font-semibold uppercase shrink-0">Required Domain</span>
                <span className="font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 shrink-0">
                  {allowedEmailDomain || '@cet.ac.in'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-ink-muted leading-relaxed text-center">
              Please click <strong>Choose Another Account</strong> below and select or add your official college Google account.
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Choose College Account</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/', { replace: true })}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border hover:bg-background text-ink-secondary hover:text-ink-primary font-medium text-xs transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Portal Home</span>
              </button>
            </div>
          </div>
        )}

        {/* Generic Error State */}
        {status === 'error' && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/50 border border-rose-800/60 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h2 className="text-lg font-bold text-ink-primary">Authentication Failed</h2>
              <p className="text-xs text-rose-400 mt-1">{errorMessage}</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Google Sign-In Again</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/', { replace: true })}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border hover:bg-background text-ink-secondary hover:text-ink-primary font-medium text-xs transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
