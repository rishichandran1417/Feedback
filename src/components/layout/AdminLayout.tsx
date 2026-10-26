import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import {
  ShieldCheck,
  Shield,
  GraduationCap,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Inbox,
  Clock,
  AlertCircle,
  Tags,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Wrench,
} from 'lucide-react';

import { AdminLoginModal } from '../auth/AdminLoginModal';
import { ThemeToggle } from '../common/ThemeToggle';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  headerAction?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  pageTitle,
  pageDescription,
  headerAction,
}) => {
  const { user, logout } = useAuth();
  const { metrics, settings, updateSettings } = useSystem();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/submissions', label: 'All Submissions', icon: Inbox, count: metrics.total },
    { path: '/admin/pending', label: 'Pending Review', icon: Clock, count: metrics.pending },
    { path: '/admin/overdue', label: 'Overdue Issues', icon: AlertCircle, count: metrics.overdue, isAlert: metrics.overdue > 0 },
    { path: '/admin/categories', label: 'Categories & SLAs', icon: Tags },
    { path: '/admin/users', label: 'User Accounts', icon: Users },
    { path: '/admin/reports', label: 'Reports & Exports', icon: BarChart3 },
    { path: '/admin/settings', label: 'System Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-6 px-4">
      <div className="space-y-6">
        <div className="px-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Administrative Modules
          </span>
        </div>

        <nav className="space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-brand-950/80 text-brand-300 border border-brand-800/60 font-semibold'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-surface/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-ink-secondary'}`} />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && item.count > 0 ? (
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      item.isAlert
                        ? 'bg-rose-950/60 text-rose-300 font-bold border border-rose-800/60'
                        : isActive
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface text-ink-secondary border border-border'
                    }`}
                  >
                    {item.count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-surface border border-border/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-primary">Theme Mode</span>
          <ThemeToggle variant="compact" />
        </div>

        <div className="p-3.5 rounded-xl bg-surface border border-border/80 text-xs">
          <p className="font-semibold text-ink-primary mb-1">Administrative Role Active</p>
          <p className="text-ink-secondary text-[11px] leading-relaxed">
            All status modifications, assignments, and resolution notes create permanent audit history records.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-ink-primary flex flex-col antialiased">
      {/* Administrator Authentication Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
      />

      {/* Administrator Top Bar — Full width, never covered by sidebar */}
      <header className="sticky top-0 z-30 w-full bg-surface/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface shrink-0 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Institutional Admin Branding */}
            <Link to="/admin/dashboard" className="flex items-center gap-3 select-none shrink-0 min-w-0">
              <img
                src="/voice-logo.png"
                alt="voice"
                className="h-8 sm:h-9 w-auto object-contain rounded-lg shadow-xs"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-brand-950 text-brand-300 border border-brand-800 shrink-0">
                    Admin Portal
                  </span>
                </div>
                <p className="hidden sm:block text-[11px] text-ink-muted -mt-0.5 truncate">
                  College of Engineering Trivandrum • Administrative Console
                </p>
              </div>
            </Link>
          </div>

          {/* Right Area: Theme Toggle & Admin Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <ThemeToggle variant="normal" />
            {!user || user.role !== 'administrator' ? (
              <button
                onClick={() => setShowAdminLoginModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Shield className="w-4 h-4 text-white" />
                <span>Administrator Sign In</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-950 border border-brand-800 text-brand-300 font-semibold text-xs flex items-center justify-center">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-ink-primary leading-tight">{user?.full_name}</p>
                    <p className="text-[11px] text-brand-400 font-medium capitalize">Administrator</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-ink-secondary" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-2xl z-50 py-1 divide-y divide-border animate-in fade-in-50 duration-150">
                    <div className="px-4 py-3">
                      <p className="text-xs font-semibold text-ink-primary">{user?.full_name}</p>
                      <p className="text-xs text-ink-secondary truncate">{user?.email}</p>
                      <p className="text-[11px] text-ink-muted mt-1">{user?.department || 'Administration'}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/admin/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-2 text-xs text-ink-primary hover:bg-surface/80 flex items-center gap-2 text-left"
                      >
                        <Settings className="w-4 h-4 text-ink-secondary" />
                        Administrative Settings
                      </Link>
                      <Link
                        to="/"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-2 text-xs text-brand-400 hover:bg-brand-950/40 flex items-center gap-2 text-left cursor-pointer"
                      >
                        <GraduationCap className="w-4 h-4 text-brand-400" />
                        View Student Portal
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Persistent Maintenance Mode Alert Bar */}
      {settings.maintenance_mode?.enabled && (
        <div className="bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 px-4 sm:px-6 py-2.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 z-40 border-b border-amber-300 dark:border-amber-800/80 shadow-xs">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 shrink-0 animate-pulse text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Maintenance Mode Active:</strong> Public portal access is currently paused. Students and visitors will see the maintenance notice.
            </span>
          </div>
          <button
            onClick={() =>
              updateSettings({
                maintenance_mode: {
                  ...settings.maintenance_mode!,
                  enabled: false,
                },
              })
            }
            className="px-3 py-1 rounded-lg bg-surface border border-amber-500 dark:border-amber-600 text-amber-900 dark:text-amber-300 font-bold hover:bg-amber-50 dark:hover:bg-amber-900/60 transition-colors text-xs shrink-0 cursor-pointer shadow-xs"
          >
            Turn Off Maintenance Mode
          </button>
        </div>
      )}

      {/* Main Workspace: Sidebar sits cleanly BELOW the header */}
      <div className="flex-1 flex w-full">
        {/* Desktop Administrator Sidebar */}
        <aside className="w-64 shrink-0 bg-surface border-r border-border min-h-[calc(100vh-4rem)] sticky top-16 hidden lg:block">
          {sidebarContent}
        </aside>

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-surface border-r border-border z-50 shadow-2xl flex flex-col">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="/voice-logo.png"
                    alt="voice"
                    className="h-6 w-auto object-contain rounded-md"
                  />
                  <span className="font-semibold text-xs uppercase tracking-wider text-ink-secondary">
                    Admin Navigation
                  </span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-ink-muted hover:text-ink-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sidebarContent}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Workspace Container */}
        <main className="flex-1 min-w-0 py-5 sm:py-8 px-3.5 sm:px-6 lg:px-8 overflow-x-hidden">
          {pageTitle && (
            <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-border/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-[28px] font-semibold text-ink-primary tracking-tight">
                  {pageTitle}
                </h1>
                {pageDescription && (
                  <p className="text-xs sm:text-sm text-ink-secondary mt-1">{pageDescription}</p>
                )}
              </div>
              {headerAction && <div className="shrink-0">{headerAction}</div>}
            </div>
          )}

          <div className="w-full min-w-0 space-y-6 sm:space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
