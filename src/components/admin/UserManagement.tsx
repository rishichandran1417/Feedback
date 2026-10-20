import React, { useState } from 'react';
import { MockStorage } from '../../lib/mockStorage';
import { Profile, AppRole } from '../../types/database';
import { useSystem } from '../../context/SystemContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  FileText,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { submissions } = useSystem();
  const [profiles, setProfiles] = useState<Profile[]>(MockStorage.getProfiles());
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const reloadProfiles = () => {
    setProfiles(MockStorage.getProfiles());
  };

  const filtered = profiles.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      p.full_name.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      (p.student_id && p.student_id.toLowerCase().includes(term)) ||
      (p.department && p.department.toLowerCase().includes(term))
    );
  });

  const getSubmissionsCount = (userId: string) => {
    return submissions.filter((s) => s.student_id === userId).length;
  };

  const isUserAdmin = (email: string) => {
    return email.includes('dean') || email.includes('admin');
  };

  const handleToggleActive = (p: Profile) => {
    // Prevent deactivating own account
    if (p.id === currentAdmin?.id) {
      setFeedback({ type: 'error', text: 'You cannot deactivate your own active administrator account.' });
      return;
    }

    const updated = { ...p, is_active: !p.is_active };
    MockStorage.saveProfile(updated);
    reloadProfiles();
    setFeedback({
      type: 'success',
      text: `Account ${p.email} has been ${updated.is_active ? 'reactivated' : 'temporarily suspended'}.`,
    });
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Header and Search */}
      <div className="bg-white border border-border rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-ink-primary">College User Registry</h3>
            <p className="text-xs text-ink-secondary mt-0.5">
              Verified college accounts, role assignments, and student participation.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, student ID, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-surface border-b border-border text-ink-secondary uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Official Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Submissions</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => {
                const adminRole = isUserAdmin(p.email);
                const subCount = getSubmissionsCount(p.id);

                return (
                  <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center shrink-0 border border-brand-200">
                          {p.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-ink-primary">{p.full_name}</p>
                          <p className="text-[11px] text-ink-muted font-mono">
                            {p.student_id || p.department || 'Staff Profile'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-ink-secondary">{p.email}</td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {adminRole ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                          <Shield className="w-3 h-3 text-brand-700" />
                          Faculty Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface text-ink-secondary border border-border">
                          Student
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-ink-primary whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        {subCount} record{subCount === 1 ? '' : 's'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          p.is_active ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {p.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleToggleActive(p)}
                        disabled={p.id === currentAdmin?.id}
                      >
                        {p.is_active ? 'Suspend' : 'Reactivate'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
