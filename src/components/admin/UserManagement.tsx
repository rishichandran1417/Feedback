import React, { useState, useEffect } from 'react';
import { MockStorage } from '../../lib/mockStorage';
import { Profile } from '../../types/database';
import { useSystem } from '../../context/SystemContext';
import { useAuth } from '../../context/AuthContext';
import { isUsingRealSupabase, supabase } from '../../lib/supabase';
import { Button } from '../common/Button';
import {
  Users,
  Search,
  Shield,
  FileText,
  AlertCircle,
  RefreshCw,
  UserCheck,
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { submissions } = useSystem();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      if (isUsingRealSupabase && supabase) {
        const [{ data: profs, error: profsError }, { data: roles, error: rolesError }] =
          await Promise.all([
            supabase.from('profiles').select('*').order('created_at', { ascending: false }),
            supabase.from('user_roles').select('user_id, role'),
          ]);

        if (roles && !rolesError) {
          const rMap: Record<string, string> = {};
          roles.forEach((r) => {
            rMap[r.user_id] = r.role;
          });
          setUserRoles(rMap);
        }

        if (profs && !profsError) {
          setProfiles(profs);
          return;
        }
      }
      setProfiles(MockStorage.getProfiles());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const filtered = profiles.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      p.full_name?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      (p.student_id && p.student_id.toLowerCase().includes(term)) ||
      (p.department && p.department.toLowerCase().includes(term))
    );
  });

  const getSubmissionsCount = (userId: string) => {
    return submissions.filter((s) => s.student_id === userId).length;
  };

  const getUserRole = (userId: string, email: string) => {
    if (userRoles[userId]) return userRoles[userId];
    if (email.includes('dean') || email.includes('admin')) return 'administrator';
    return 'student';
  };

  const handleToggleRole = async (p: Profile) => {
    const currentRole = getUserRole(p.id, p.email);
    const newRole = currentRole === 'administrator' ? 'student' : 'administrator';

    if (p.id === currentAdmin?.id && newRole === 'student') {
      setFeedback({ type: 'error', text: 'You cannot revoke your own active administrator role.' });
      return;
    }

    setIsLoading(true);
    try {
      if (isUsingRealSupabase && supabase) {
        const { error } = await supabase
          .from('user_roles')
          .upsert({ user_id: p.id, role: newRole }, { onConflict: 'user_id' });

        if (error) {
          setFeedback({ type: 'error', text: `Failed to update role in database: ${error.message}` });
          return;
        }

        await supabase
          .from('profiles')
          .update({
            department: newRole === 'administrator' ? 'Central Grievance Redressal Cell' : 'General Studies',
            course_programme: newRole === 'administrator' ? 'Administration' : 'Undergraduate',
          })
          .eq('id', p.id);
      }

      setUserRoles((prev) => ({ ...prev, [p.id]: newRole }));
      setFeedback({
        type: 'success',
        text: `Role for ${p.email} successfully updated to ${newRole === 'administrator' ? 'Administrator' : 'Student'}.`,
      });
      await loadProfiles();
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (p: Profile) => {
    if (p.id === currentAdmin?.id) {
      setFeedback({ type: 'error', text: 'You cannot deactivate your own active administrator account.' });
      return;
    }

    const updated = { ...p, is_active: !p.is_active };
    if (isUsingRealSupabase && supabase) {
      try {
        await supabase.from('profiles').update({ is_active: updated.is_active }).eq('id', p.id);
      } catch (e) {
        console.error('Supabase profile status update error:', e);
      }
    }

    MockStorage.saveProfile(updated);
    await loadProfiles();
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
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Header and Search */}
      <div className="bg-white border border-border rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-ink-primary">College User Registry & Roles</h3>
            <p className="text-xs text-ink-secondary mt-0.5">
              Verified college accounts, authoritative database roles from <code className="font-mono text-brand-700">user_roles</code>, and activity status.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
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

            <Button
              size="sm"
              variant="secondary"
              onClick={loadProfiles}
              isLoading={isLoading}
              title="Refresh User Registry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table or Clean Empty State */}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-ink-primary">No User Accounts Found</p>
            <p className="text-xs text-ink-secondary max-w-md mx-auto leading-relaxed">
              {searchTerm
                ? 'No registered users match your search query.'
                : 'When students and administrators sign in via Google Workspace (@cet.ac.in), their official records will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[720px]">
              <thead className="bg-surface border-b border-border text-ink-secondary uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Official College Email</th>
                  <th className="py-3 px-4">Database Role</th>
                  <th className="py-3 px-4">Submissions</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => {
                  const role = getUserRole(p.id, p.email);
                  const isAdmin = role === 'administrator';
                  const subCount = getSubmissionsCount(p.id);

                  return (
                    <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center shrink-0 border border-brand-200">
                            {p.full_name?.charAt(0) || p.email?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-ink-primary">{p.full_name || 'College User'}</p>
                            <p className="text-[11px] text-ink-muted font-mono">
                              {p.student_id || p.department || 'Official Account'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-ink-secondary">{p.email}</td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                            <Shield className="w-3 h-3 text-brand-700" />
                            Administrator
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

                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleToggleRole(p)}
                          disabled={isLoading || p.id === currentAdmin?.id}
                          className="text-[11px] py-1 px-2.5"
                          title={isAdmin ? 'Demote to Student role' : 'Promote to Administrator role'}
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          {isAdmin ? 'Demote to Student' : 'Grant Admin Role'}
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleToggleActive(p)}
                          disabled={isLoading || p.id === currentAdmin?.id}
                          className="text-[11px] py-1 px-2.5"
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
        )}
      </div>
    </div>
  );
};
