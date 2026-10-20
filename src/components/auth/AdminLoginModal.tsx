import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ShieldCheck, Mail, Lock, AlertCircle, Key } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginAsAdmin } = useAuth();
  const { settings } = useSystem();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your administrator email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginAsAdmin(cleanEmail, password || 'adminSecureKey2026');
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Administrator authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (adminEmail: string) => {
    setEmail(adminEmail);
    setPassword('adminSecureKey2026');
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await loginAsAdmin(adminEmail, 'adminSecureKey2026');
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Administrator login failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Administrator Portal Authentication"
      description={`${settings.college_info.name || 'College'} Grievance Redressal Committee & Faculty Console`}
    >
      <div className="space-y-5 py-2">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              Official Administrator Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dean.academics@college.edu or admin@college.edu"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5"
            isLoading={isLoading}
            leftIcon={<Key className="w-4 h-4" />}
          >
            Authenticate as Administrator
          </Button>
        </form>

        {/* Quick Demo Access for Committee Reviewers */}
        <div className="pt-3 border-t border-border space-y-2">
          <p className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider">
            Quick Faculty / Administrator Access:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('dean.academics@college.edu')}
              className="p-2.5 rounded-lg border border-border hover:border-brand-300 hover:bg-surface text-left transition-all disabled:opacity-50"
            >
              <p className="font-semibold text-ink-primary text-xs">Dean of Academics</p>
              <p className="text-[11px] text-ink-muted font-mono truncate">dean.academics@college.edu</p>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('admin@college.edu')}
              className="p-2.5 rounded-lg border border-border hover:border-brand-300 hover:bg-surface text-left transition-all disabled:opacity-50"
            >
              <p className="font-semibold text-ink-primary text-xs">Central Grievance Officer</p>
              <p className="text-[11px] text-ink-muted font-mono truncate">admin@college.edu</p>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
