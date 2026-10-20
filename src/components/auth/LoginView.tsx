import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { Button } from '../common/Button';
import {
  GraduationCap,
  ShieldCheck,
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface LoginViewProps {
  onSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { loginAsStudent, loginAsAdmin, registerStudent, switchRole } = useAuth();
  const { settings } = useSystem();

  const [mode, setMode] = useState<'student_login' | 'student_register' | 'admin_login' | 'reset_password'>('student_login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const allowedDomain = settings.auth_config.allowed_email_domain || '@college.edu';

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    setIsLoading(true);
    try {
      const res = await loginAsStudent(email);
      if (res.success) {
        onSuccess();
      } else {
        setErrorMsg(res.error || 'Authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    setIsLoading(true);
    try {
      const res = await loginAsAdmin(email);
      if (res.success) {
        onSuccess();
      } else {
        setErrorMsg(res.error || 'Unauthorized administrator access.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim() || !studentId.trim()) {
      setErrorMsg('Full Name and Student Identification Number are required.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerStudent({
        email,
        fullName,
        studentId,
        department,
      });

      if (res.success) {
        setSuccessMsg('Account registered and verified. Redirecting to student dashboard...');
        setTimeout(() => onSuccess(), 1000);
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim().endsWith(allowedDomain)) {
      setErrorMsg(`Password reset instructions can only be sent to valid college addresses (${allowedDomain})`);
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(`Secure password reset instructions sent to ${email}. Check your college inbox.`);
  };

  const handleQuickDemo = (role: 'student' | 'admin') => {
    switchRole(role === 'student' ? 'student' : 'administrator');
    onSuccess();
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
          Central Grievance & Student Feedback Redressal System
        </p>

        {/* Demo Fast-Switch Banner */}
        <div className="bg-white border border-brand-200/80 rounded-xl p-3.5 shadow-xs text-xs space-y-2 text-left">
          <div className="flex items-center gap-1.5 text-brand-800 font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Quick Evaluation Access (One-Click)
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickDemo('student')}
              className="text-xs text-left"
            >
              Log in as Student Arjun
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickDemo('admin')}
              className="text-xs text-left"
            >
              Log in as Dean Vance
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 border border-border rounded-xl shadow-xs space-y-6">
          {/* Tab Selector: Student vs Admin Login */}
          <div className="flex border-b border-border">
            <button
              onClick={() => {
                setMode('student_login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                mode === 'student_login' || mode === 'student_register'
                  ? 'border-brand-700 text-brand-700'
                  : 'border-transparent text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Student Portal
            </button>
            <button
              onClick={() => {
                setMode('admin_login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                mode === 'admin_login'
                  ? 'border-brand-700 text-brand-700'
                  : 'border-transparent text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Administrator Login
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Student Login Form */}
          {mode === 'student_login' && (
            <form onSubmit={handleStudentLogin} className="space-y-4 text-xs">
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
                    onClick={() => setMode('reset_password')}
                    className="text-[11px] text-brand-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    defaultValue="collegePassword123"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                Don't have a verified account yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('student_register')}
                  className="text-brand-700 font-semibold hover:underline"
                >
                  Register here
                </button>
              </div>
            </form>
          )}

          {/* Student Registration Form */}
          {mode === 'student_register' && (
            <form onSubmit={handleStudentRegister} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rohan Varma"
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Official College Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`e.g. rohan.varma${allowedDomain}`}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
                <p className="text-[11px] text-ink-muted mt-1">
                  Must end with <strong>{allowedDomain}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink-primary mb-1">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="AIT-2026-089"
                    className="w-full px-3 py-2 rounded-lg border border-border font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink-primary mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-2 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option>Computer Science & Engineering</option>
                    <option>Electrical Engineering</option>
                    <option>Mechanical & Civil</option>
                    <option>Biotechnology</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                Register & Verify College Account
              </Button>

              <div className="text-center pt-2 text-ink-secondary">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('student_login')}
                  className="text-brand-700 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* Admin Login Form */}
          {mode === 'admin_login' && (
            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-brand-50/50 border border-brand-200 text-brand-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                <span>
                  Administrator portal access is restricted to authorized grievance officers and committee chairs.
                </span>
              </div>

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
                    placeholder={`dean.academics${allowedDomain}`}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Administrative Access Key
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    defaultValue="adminSecureKey2026"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                Authenticate as Administrator
              </Button>
            </form>
          )}

          {/* Password Reset */}
          {mode === 'reset_password' && (
            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <p className="text-ink-secondary">
                Enter your verified college email to receive secure single-use recovery instructions.
              </p>

              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Official College Email *
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
                  onClick={() => setMode('student_login')}
                  className="text-brand-700 font-semibold hover:underline"
                >
                  &larr; Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
