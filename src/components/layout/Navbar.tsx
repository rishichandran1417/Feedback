import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import {
  Bell,
  GraduationCap,
  ShieldCheck,
  LogOut,
  User,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (tab: string) => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeTab: _activeTab }) => {
  const { user, logout, switchRole } = useAuth();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useSystem();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-700 flex items-center justify-center text-white font-bold shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink-primary tracking-tight text-base sm:text-lg">
                Apex Institute
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-surface text-ink-secondary border border-border">
                Grievance Cell
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-ink-muted -mt-0.5">
              Official Student Feedback & Resolution System
            </p>
          </div>
        </div>

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick Role Switcher (For Evaluation & Demo) */}
          <div className="hidden md:flex items-center bg-surface border border-border rounded-lg p-0.5 text-xs">
            <button
              onClick={() => switchRole('student')}
              className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                user?.role === 'student'
                  ? 'bg-white text-brand-700 shadow-xs border border-border/80'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Student View
            </button>
            <button
              onClick={() => switchRole('administrator')}
              className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                user?.role === 'administrator'
                  ? 'bg-white text-brand-700 shadow-xs border border-border/80'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-700" />
              Admin Portal
            </button>
          </div>

          {/* Notifications Popover */}
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
                          if (user?.role === 'student') onNavigate('submissions');
                          else onNavigate('admin_submissions');
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

          {/* User Account Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 text-brand-800 font-semibold text-xs flex items-center justify-center">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-ink-primary leading-tight">{user?.full_name}</p>
                <p className="text-[11px] text-ink-secondary capitalize">
                  {user?.role === 'administrator' ? 'Faculty Admin' : 'Student'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-ink-secondary" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-border rounded-xl shadow-lg z-50 py-1 divide-y divide-border animate-in fade-in-50 duration-150">
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-ink-primary">{user?.full_name}</p>
                  <p className="text-xs text-ink-secondary truncate">{user?.email}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-surface text-ink-secondary border border-border">
                      {user?.student_id || user?.department || 'Official Account'}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      switchRole(user?.role === 'student' ? 'administrator' : 'student');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-xs text-ink-primary hover:bg-surface flex items-center gap-2 text-left"
                  >
                    <Layers className="w-4 h-4 text-ink-secondary" />
                    Switch to {user?.role === 'student' ? 'Admin Portal' : 'Student Portal'}
                  </button>
                  <button
                    onClick={() => {
                      onNavigate(user?.role === 'student' ? 'profile' : 'admin_settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-xs text-ink-primary hover:bg-surface flex items-center gap-2 text-left"
                  >
                    <User className="w-4 h-4 text-ink-secondary" />
                    Account Settings
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
