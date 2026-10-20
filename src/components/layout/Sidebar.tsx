import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Bell,
  User,
  Inbox,
  AlertCircle,
  Clock,
  Tags,
  Building2,
  Users,
  BarChart3,
  Mail,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavLinkItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  count?: number;
  isAlert?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const { metrics, unreadCount } = useSystem();

  const studentLinks: NavLinkItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'submit', label: 'Submit Feedback', icon: PlusCircle },
    { id: 'submissions', label: 'My Submissions', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount || undefined },
    { id: 'profile', label: 'Profile & Help', icon: User },
  ];

  const adminLinks: NavLinkItem[] = [
    { id: 'admin_overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'admin_submissions', label: 'All Submissions', icon: Inbox, count: metrics.total },
    { id: 'admin_pending', label: 'Pending Review', icon: Clock, count: metrics.pending },
    { id: 'admin_overdue', label: 'Overdue Issues', icon: AlertCircle, count: metrics.overdue, isAlert: metrics.overdue > 0 },
    { id: 'admin_categories', label: 'Categories & SLAs', icon: Tags },
    { id: 'admin_departments', label: 'Departments', icon: Building2 },
    { id: 'admin_users', label: 'User Accounts', icon: Users },
    { id: 'admin_reports', label: 'Reports & Exports', icon: BarChart3 },
    { id: 'admin_email_settings', label: 'Email Notification Hub', icon: Mail },
    { id: 'admin_settings', label: 'System Settings', icon: Settings },
  ];

  const links = user?.role === 'administrator' ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border transition-transform transform lg:translate-x-0 lg:static lg:block ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col justify-between py-6 px-4">
          <div className="space-y-6">
            <div className="px-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                {user?.role === 'administrator' ? 'Administration Portal' : 'Student Workspace'}
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      onSelectTab(link.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-ink-secondary hover:text-ink-primary hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-brand-700' : 'text-ink-secondary'}`} />
                      <span>{link.label}</span>
                    </div>

                    {link.badge ? (
                      <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-brand-700 text-white">
                        {link.badge}
                      </span>
                    ) : link.count !== undefined && link.count > 0 ? (
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          link.isAlert ? 'bg-rose-50 text-rose-700 font-semibold' : 'bg-surface text-ink-secondary border border-border'
                        }`}
                      >
                        {link.count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Help / Info Card */}
          <div className="p-3.5 rounded-xl bg-surface border border-border/80 text-xs">
            <p className="font-semibold text-ink-primary mb-1">Confidential & Protected</p>
            <p className="text-ink-secondary text-[11px] leading-relaxed">
              All submissions comply with the College Ethics & Grievance Redressal Policy.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
