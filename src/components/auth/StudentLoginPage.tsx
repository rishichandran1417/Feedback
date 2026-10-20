import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { Button } from '../common/Button';
import {
  GraduationCap,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const StudentLoginPage: React.FC = () => {
  const { user, loginAsStudent, allowedEmailDomain } = useAuth();
  const { settings } = useSystem();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'administrator') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('collegePassword123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const allowedDomain = allowedEmailDomain || settings.auth_config.allowed_email_domain || '@college.edu';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await loginAsStudent(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setErrorMsg(res.error || 'Authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim().endsWith(allowedDomain)) {
      setErrorMsg(`Password recovery instructions can only be sent to valid college addresses (${allowedDomain})`);
      return;
    }
    setErrorMsg(null);
    setResetSent(true);
  };

  const handleQuickDemoStudent = async () => {
    setEmail('arjun.patel@college.edu');
    setPassword('collegePassword123');
    setIsLoading(true);
    try {
      const res = await loginAsStudent('arjun.patel@college.edu', 'collegePassword123');
      if (res.success) navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-brand-700 text-white flex items-center justify-center mx-auto shadow-md">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-ink-primary">
          Apex Institute of Technology
        </h2>
        <p className="text-xs text-ink-secondary">
          Student Feedback & Grievance Redressal Portal
        </p>

        {/* Quick Demo Evaluation Helper */}
        <div className="bg-white border border-brand-200/80 rounded-xl p-3.5 shadow-xs text-xs space-y-2 text-left">
          <div className="flex items-center gap-1.5 text-brand-800 font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Evaluation Fast-Fill (Student)
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleQuickDemoStudent}
            className="w-full text-xs"
          >
            Sign in as Student Arjun (arjun.patel@college.edu)
          </Button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 border border-border rounded-xl shadow-xs space-y-6">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-semibold text-ink-primary">Student Sign In</h3>
            <p className="text-xs text-ink-secondary mt-0.5">
              Access your college submissions using your institutional credentials.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {resetSent && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Password recovery instructions dispatched to {email}. Check your inbox.</span>
            </div>
          )}

          {!showForgot ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  College Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`e.g. arjun.patel${allowedDomain}`}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <p className="text-[11px] text-ink-muted mt-1">
                  Enforced domain: <strong>{allowedDomain}</strong>
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-ink-primary">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-[11px] text-brand-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
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
                className="w-full"
                isLoading={isLoading}
              >
                Sign In to Student Portal
              </Button>

              <div className="text-center pt-2 text-ink-secondary">
                New student?{' '}
                <Link to="/register" className="text-brand-700 font-semibold hover:underline">
                  Create student account
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
              <p className="text-ink-secondary">
                Enter your official college address to receive a single-use password reset link.
              </p>

              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  College Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`student${allowedDomain}`}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="text-brand-700 font-semibold hover:underline"
                >
                  &larr; Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
