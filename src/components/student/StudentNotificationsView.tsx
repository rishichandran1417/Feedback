import React from 'react';
import { useSystem } from '../../context/SystemContext';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../common/Button';
import { Bell, CheckCircle2, AlertTriangle, ArrowRight, Clock } from 'lucide-react';

interface StudentNotificationsViewProps {
  onSelectSubmission: (id: string) => void;
}

export const StudentNotificationsView: React.FC<StudentNotificationsViewProps> = ({
  onSelectSubmission,
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useSystem();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="text-base font-semibold text-ink-primary">Your Notification Feed</h3>
          <p className="text-xs text-ink-secondary mt-0.5">
            Real-time status alerts, replies, and requests from administrative officers.
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
        <div className="bg-white border border-border rounded-xl divide-y divide-border overflow-hidden shadow-xs">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationRead(notif.id);
                if (notif.submission_id) onSelectSubmission(notif.submission_id);
              }}
              className={`p-3.5 sm:p-5 flex items-start justify-between gap-3 sm:gap-4 cursor-pointer transition-colors hover:bg-surface/60 ${
                !notif.is_read ? 'bg-brand-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    notif.type === 'warning'
                      ? 'bg-amber-100 text-amber-700'
                      : notif.type === 'success'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-brand-100 text-brand-700'
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
                      <span className="w-2 h-2 rounded-full bg-brand-700 inline-block shrink-0" />
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
                <div className="flex items-center gap-1 text-xs font-medium text-brand-700 shrink-0 self-center">
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
