import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../common/Button';
import { CollegeLoginModal } from '../auth/CollegeLoginModal';
import { Bell, CheckCircle2, AlertTriangle, ArrowRight, Clock, Mail, Lock } from 'lucide-react';

interface StudentNotificationsViewProps {
  onSelectSubmission: (id: string) => void;
}

export const StudentNotificationsView: React.FC<StudentNotificationsViewProps> = ({
  onSelectSubmission,
}) => {
  const { user } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useSystem();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (!user) {
    return (
      <div className="max-w-3xl space-y-6">
        <CollegeLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
        <div className="bg-surface border border-border rounded-xl p-8 sm:p-12 text-center space-y-4 shadow-xs max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-brand-950/80 text-brand-300 flex items-center justify-center mx-auto border border-brand-800/60">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-ink-primary">
              Sign In to View Notifications
            </h3>
            <p className="text-xs text-ink-secondary max-w-md mx-auto leading-relaxed">
              Ticket status alerts, administrator replies, and investigation updates are privately delivered to your official college account.
            </p>
          </div>
          <div className="pt-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Login with College Mail</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="text-base font-semibold text-ink-primary">Your Notification Feed</h3>
          <p className="text-xs text-ink-secondary mt-0.5">
            Real-time status alerts, replies, and updates from department representatives.
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            onClick={markAllNotificationsRead}
            className="self-start sm:self-auto shrink-0"
          >
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You are completely up to date. Updates on your feedback will appear here."
        />
      ) : (
        <div className="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden shadow-xs">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationRead(notif.id);
                if (notif.submission_id) onSelectSubmission(notif.submission_id);
              }}
              className={`p-3.5 sm:p-5 flex items-start justify-between gap-3 sm:gap-4 cursor-pointer transition-colors hover:bg-background/60 ${
                !notif.is_read ? 'bg-brand-950/40' : ''
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                    notif.type === 'warning'
                      ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                      : notif.type === 'success'
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                      : 'bg-brand-950/60 text-brand-300 border-brand-800/60'
                  }`}
                >
                  {notif.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : notif.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-ink-primary break-words">{notif.title}</h4>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-brand-400 inline-block shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-ink-secondary leading-relaxed break-words">{notif.message}</p>
                  <p className="text-[11px] text-ink-muted pt-0.5">
                    {new Date(notif.created_at).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>

              {notif.submission_id && (
                <div className="flex items-center gap-1 text-xs font-medium text-brand-400 shrink-0 self-center">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
