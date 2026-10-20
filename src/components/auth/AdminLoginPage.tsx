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
  const { user, loginAsAdmin, logout, syncSession } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const [isRefreshingRole, setIsRefreshingRole] = useState(false);
  const [roleCheckMessage, setRoleCheckMessage] = useState<string | null>(null);

  const handleRecheckRole = async () => {
    setIsRefreshingRole(true);
    setRoleCheckMessage(null);
    try {
      await syncSession();
      setRoleCheckMessage("Checked database: role is currently 'student'. If you were just granted administrator privileges in Supabase, wait a few seconds and try again.");
    } catch {
      setRoleCheckMessage("Unable to connect to database to verify role.");
    } finally {
      setIsRefreshingRole(false);
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

            {roleCheckMessage && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 text-left">
                {roleCheckMessage}
              </div>
            )}

            <div className="pt-2 space-y-2.5">
              <Button
                variant="secondary"
                onClick={handleRecheckRole}
                isLoading={isRefreshingRole}
                className="w-full text-xs border-brand-300 text-brand-800 hover:bg-brand-50"
              >
                Re-check Administrator Role
              </Button>
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

            <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400 leading-normal">
              Project owners: run <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono text-[10px]">SELECT public.grant_admin_role('{user.email}');</code> in Supabase SQL Editor, then click Re-check.
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
