import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Mail, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CollegeLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CollegeLoginModal: React.FC<CollegeLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginAsStudent, loginAsAdmin } = useAuth();
  const { settings } = useSystem();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const allowedDomain = settings.auth_config.allowed_email_domain || '@college.edu';

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await loginWithGoogle(email || undefined);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to authenticate via Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your college email address.');
      return;
    }

    if (!cleanEmail.endsWith(allowedDomain) && !cleanEmail.endsWith('@gmail.com') && !cleanEmail.includes('college')) {
      setErrorMsg(`Please sign in with your official college mail domain (${allowedDomain}).`);
      return;
    }

    setIsLoading(true);
    try {
      const isAdmin = cleanEmail.includes('dean') || cleanEmail.includes('admin');
      const res = isAdmin
        ? await loginAsAdmin(cleanEmail, password || 'adminSecureKey2026')
        : await loginAsStudent(cleanEmail, password || 'collegePassword123');

      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Login with College Mail"
      description={`Sign in with your official college account (${allowedDomain} or Google workspace).`}
    >
      <div className="space-y-5 py-2">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1-Click Google OAuth Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-ink-primary font-medium text-xs shadow-xs transition-all hover:border-slate-400 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>Continue with Google Workspace (Gmail)</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-white px-3 text-[11px] text-ink-muted uppercase tracking-wider font-semibold">
            Or sign in with email
          </span>
        </div>

        <form onSubmit={handleDirectSignIn} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              Official College Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`yourname${allowedDomain}`}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              Password / Access Key <span className="font-normal text-ink-muted">(Optional for first-time login)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Sign In to Portal
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
