import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import {
  ShieldCheck,
  Mail,
  Lock,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { user, loginAsAdmin, checkAdminAccess } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('adminSecureKey2026');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already authenticated as administrator, go directly to /admin/dashboard
  // If authenticated as student, deny access and redirect to student page
  useEffect(() => {
    if (user) {
      if (user.role === 'administrator') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
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

  const handleQuickDemoAdmin = async () => {
    setEmail('dean.academics@college.edu');
    setPassword('adminSecureKey2026');
    setIsLoading(true);
    try {
      const res = await loginAsAdmin('dean.academics@college.edu', 'adminSecureKey2026');
      if (res.success) navigate('/admin/dashboard', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

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
          Office of the Dean & Institutional Grievance Redressal Committee
        </p>

        {/* Quick Demo Evaluation Helper */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3.5 shadow-sm text-xs space-y-2 text-left">
          <div className="flex items-center gap-1.5 text-brand-400 font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Evaluation Fast-Fill (Administrator)
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleQuickDemoAdmin}
            className="w-full text-xs bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
          >
            Authenticate as Dean Dr. Vance (dean.academics@college.edu)
          </Button>
        </div>
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
                  placeholder="dean.academics@college.edu"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Administrative Secret Key *
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

            {user?.role === 'student' && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-xs text-brand-700 font-medium hover:underline inline-flex items-center gap-1"
                >
                  Return to Student Portal &rarr;
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
