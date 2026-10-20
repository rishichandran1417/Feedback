import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import {
  ShieldCheck,
  ShieldAlert,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  LogOut,
  GraduationCap,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { user, loginAsAdmin, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already authenticated as administrator, go directly to /admin/dashboard
  useEffect(() => {
    if (user && user.role === 'administrator') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await loginAsAdmin(email, password);
      if (res.success) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setErrorMsg(res.error || 'Unauthorized administrator access.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success && res.error) {
        setErrorMsg(res.error);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // If currently authenticated as a student, display clear Access Denied notice
  if (user && user.role === 'student') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 sm:px-8 rounded-xl shadow-xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink-primary">Administrator Access Denied</h3>
              <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                You are currently signed in as <strong>{user.full_name}</strong> (<span className="font-mono text-brand-700">{user.email}</span>) with the <strong>Student</strong> role.
              </p>
              <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                The institutional grievance administration panel is strictly restricted to authorized college officers, committee chairs, and faculty administrators. Student accounts cannot access this portal.
              </p>
            </div>
            <div className="pt-2 space-y-2.5">
              <Button
                variant="primary"
                onClick={() => navigate('/')}
                className="w-full text-xs bg-brand-700 hover:bg-brand-800"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Return to Student Dashboard
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  await logout();
                  navigate('/login', { replace: true });
                }}
                className="w-full text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-lg">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Administrator Redressal Portal
        </h2>
        <p className="text-xs text-slate-400">
          College of Engineering Trivandrum • Institutional Grievance Redressal Committee
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-xl shadow-xl space-y-6">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-semibold text-ink-primary">Faculty Administrator Authentication</h3>
            <p className="text-xs text-ink-secondary mt-0.5">
              Restricted to authorized campus officers and committee chairs.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google OAuth for Institutional Administrator Accounts */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-ink-primary font-semibold text-xs shadow-xs transition-all hover:border-slate-400 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>{isGoogleLoading ? 'Connecting to Google OAuth...' : 'Sign in with Institutional Google Account'}</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 absolute">
              or faculty credentials
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Faculty Administrator Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dean.academics@cet.ac.in"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Administrative Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-brand-900 hover:bg-black"
              isLoading={isLoading}
            >
              Verify Administrative Access
            </Button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-xs text-brand-700 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Return to Student Portal &rarr;
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
