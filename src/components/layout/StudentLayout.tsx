import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import {
  GraduationCap,
  Bell,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  PlusCircle,
  FileText,
  Menu,
  X,
  CheckCircle2,
} from 'lucide-react';

import { CollegeLoginModal } from '../auth/CollegeLoginModal';

interface StudentLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  headerAction?: React.ReactNode;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({
  children,
  pageTitle,
  pageDescription,
  headerAction,
}) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, settings } = useSystem();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const studentNavItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/submit-feedback', label: 'Submit Feedback', icon: PlusCircle },
    { path: '/my-submissions', label: 'My Submissions', icon: FileText },
    { path: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount || undefined },
    { path: '/profile', label: 'Profile & Help', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <div className="min-h-screen bg-background text-ink-primary flex flex-col antialiased">
      {/* College Login Modal */}
      <CollegeLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Student Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & College Identity */}
          <Link to="/" className="flex items-center gap-3 select-none">
            <div className="w-9 h-9 rounded-lg bg-brand-700 flex items-center justify-center text-white font-bold shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink-primary tracking-tight text-base sm:text-lg">
                  {settings.college_info.name || 'College of Engineering Trivandrum'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-surface text-ink-secondary border border-border">
                  Grievance Portal
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-ink-muted -mt-0.5">
                Official Student Feedback & Resolution System
              </p>
            </div>
          </Link>

          {/* Right Area: Login Button or Profile */}
          <div className="flex items-center gap-3">
            {!user ? (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-ink-primary text-xs font-semibold shadow-xs hover:border-slate-400 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Login with College Mail</span>
              </button>
            ) : (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifMenu(!showNotifMenu)}
                    className="relative p-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-700 ring-2 ring-white" />
                    )}
                  </button>

                  {showNotifMenu && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in-50 duration-150">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                            Notifications
                          </span>
                          {unreadCount > 0 && (
                            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-brand-100 text-brand-800 font-semibold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-xs text-brand-700 hover:text-brand-800 font-medium flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-border">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-ink-muted">No notifications yet</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotificationRead(n.id);
                                navigate('/my-submissions');
                                setShowNotifMenu(false);
                              }}
                              className={`p-3.5 text-xs hover:bg-surface cursor-pointer transition-colors ${
                                !n.is_read ? 'bg-brand-50/40' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-ink-primary">{n.title}</p>
                                <span className="text-[10px] text-ink-muted shrink-0">
                                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-ink-secondary mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Student User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 text-brand-800 font-semibold text-xs flex items-center justify-center">
                      {user?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs font-semibold text-ink-primary leading-tight">{user?.full_name}</p>
                      <p className="text-[11px] text-ink-secondary capitalize">{user?.role || 'Student'}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-ink-secondary" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-border rounded-xl shadow-lg z-50 py-1 divide-y divide-border animate-in fade-in-50 duration-150">
                      <div className="px-4 py-3">
                        <p className="text-xs font-semibold text-ink-primary">{user?.full_name}</p>
                        <p className="text-xs text-ink-secondary truncate">{user?.email}</p>
                        <p className="text-[11px] font-mono text-brand-700 mt-1">
                          {user?.student_id || 'ID Verified'}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full px-4 py-2 text-xs text-ink-primary hover:bg-surface flex items-center gap-2 text-left"
                        >
                          <User className="w-4 h-4 text-ink-secondary" />
                          Student Profile & Help
                        </Link>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto min-w-0">
        {/* Mobile Overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Student Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border transition-transform transform lg:translate-x-0 lg:static lg:block shrink-0 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col justify-between py-6 px-4">
            <div className="space-y-6">
              <div className="px-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  Student Workspace
                </span>
              </div>

              <nav className="space-y-1">
                {studentNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-ink-secondary hover:text-ink-primary hover:bg-surface'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-brand-700' : 'text-ink-secondary'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge ? (
                        <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-brand-700 text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border/80 text-xs">
              <p className="font-semibold text-ink-primary mb-1">Confidential & Protected</p>
              <p className="text-ink-secondary text-[11px] leading-relaxed">
                Submissions are handled strictly in accordance with College Grievance Redressal Policies.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content View Container */}
        <main className="flex-1 min-w-0 py-8 px-4 sm:px-8 lg:px-10 overflow-x-hidden">
          {/* Mobile hamburger button */}
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface"
            >
              <Menu className="w-4 h-4" />
              Menu Navigation
            </button>
          </div>

          {pageTitle && (
            <div className="mb-8 pb-6 border-b border-border/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-[28px] font-semibold text-ink-primary tracking-tight">
                  {pageTitle}
                </h1>
                {pageDescription && (
                  <p className="text-sm text-ink-secondary mt-1">{pageDescription}</p>
                )}
              </div>
              {headerAction && <div className="shrink-0">{headerAction}</div>}
            </div>
          )}

          <div className="w-full min-w-0 space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
