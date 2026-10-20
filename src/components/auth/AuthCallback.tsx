import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isUsingRealSupabase, supabase } from '../../lib/supabase';
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
  const { syncSession, loginWithGoogle, allowedEmailDomain } = useAuth();

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
        // Fallback local mode
        await syncSession();
        setStatus('success');
        setTimeout(() => navigate('/', { replace: true }), 400);
        return;
      }

      try {
        // 2. Wait for Supabase to resolve the session
        let session = (await supabase.auth.getSession()).data.session;

        if (!session) {
          // Poll briefly for session token exchange
          for (let i = 0; i < 10; i++) {
            await new Promise((resolve) => setTimeout(resolve, 300));
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

        // 3. Query trusted database role first (Administrators may have distinct domain)
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authUser.id)
          .maybeSingle();

        const isAdmin = roleData?.role === 'administrator';

        // 4. Enforce college email eligibility
        const configuredDomain = (allowedEmailDomain || '@college.edu').toLowerCase().trim();
        const isEligible = isAdmin || userEmail.endsWith(configuredDomain);

        if (!isEligible) {
          // Ineligible email account: sign out immediately and do NOT create student profile
          await supabase.auth.signOut();
          localStorage.removeItem('ait_auth_session_v2');
          setIneligibleEmail(userEmail);
          setStatus('ineligible');
          return;
        }

        // 5. Eligible user: ensure profile exists
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (!profileData) {
          const rawMeta = authUser.user_metadata || {};
          const fullName = rawMeta.full_name || rawMeta.name || userEmail.split('@')[0];
          const avatarUrl = rawMeta.avatar_url || rawMeta.picture || '';
          const studentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;

          // Create initial profile
          await supabase.from('profiles').upsert({
            id: authUser.id,
            email: userEmail,
            full_name: fullName,
            student_id: studentId,
            department: 'General Studies',
            course_programme: 'Undergraduate',
            avatar_url: avatarUrl,
            is_active: true,
          });

          // Create student role if no role entry
          if (!roleData) {
            await supabase.from('user_roles').upsert(
              {
                user_id: authUser.id,
                role: 'student',
              },
              { onConflict: 'user_id' }
            );
          }
        }

        // 6. Refresh AuthContext state
        await syncSession();
        setStatus('success');

        // 7. Redirect authorized administrator to /admin/dashboard, student to dashboard
        setTimeout(() => {
          if (isAdmin) {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 500);
      } catch (err: any) {
        console.error('OAuth callback handler error:', err);
        setStatus('error');
        setErrorMessage(err?.message || 'Unexpected error occurred while completing authentication.');
      }
    };

    handleOAuthCallback();
  }, [location, navigate, syncSession, allowedEmailDomain]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl shadow-lg p-6 sm:p-8">
        {/* Processing State */}
        {status === 'processing' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center mx-auto animate-pulse">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink-primary">Verifying Institutional Identity</h2>
              <p className="text-xs text-ink-secondary mt-1">
                Completing Google OAuth authentication and establishing your student session...
              </p>
            </div>
            <div className="flex justify-center pt-2">
              <div className="w-7 h-7 border-3 border-brand-700 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center space-y-4 animate-in fade-in-50 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
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
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h2 className="text-lg font-bold text-ink-primary">Ineligible Email Account</h2>
              <p className="text-xs text-ink-secondary mt-1">
                This grievance portal is exclusively accessible to verified college accounts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted text-[11px] font-semibold uppercase">Selected Account</span>
                <span className="font-mono font-medium text-rose-600 truncate max-w-[200px]">
                  {ineligibleEmail}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-ink-muted text-[11px] font-semibold uppercase">Required Domain</span>
                <span className="font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {allowedEmailDomain || '@college.edu'}
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
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Choose College Account</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/', { replace: true })}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border hover:bg-surface text-ink-secondary hover:text-ink-primary font-medium text-xs transition-all cursor-pointer"
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
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h2 className="text-lg font-bold text-ink-primary">Authentication Failed</h2>
              <p className="text-xs text-rose-600 mt-1">{errorMessage}</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Google Sign-In Again</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/', { replace: true })}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border hover:bg-surface text-ink-secondary hover:text-ink-primary font-medium text-xs transition-all cursor-pointer"
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
