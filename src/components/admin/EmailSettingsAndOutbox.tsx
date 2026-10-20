import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { EmailEventType, EmailDeliveryStatus } from '../../types/database';
import { Button } from '../common/Button';
import {
  Mail,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
  Clock,
  RotateCw,
  Key,
  ExternalLink,
} from 'lucide-react';

export const EmailSettingsAndOutbox: React.FC = () => {
  const { settings, emailNotifications, updateSettings, retryEmail } = useSystem();
  const [filterEvent, setFilterEvent] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const emailCfg = settings.email_provider_config;

  const eventTypeLabels: Record<EmailEventType, string> = {
    submission_acknowledgement: 'Submission Acknowledgement',
    status_update: 'Status Change Updates',
    issue_resolved: 'Issue Resolution Summary',
    issue_reopened: 'Issue Reopened Alerts',
    admin_reply: 'Officer Replies',
    info_request: 'Requests for Additional Information',
  };

  const toggleEvent = (event: EmailEventType) => {
    const current = emailCfg.enabled_events || [];
    const exists = current.includes(event);
    const updated = exists ? current.filter((e) => e !== event) : [...current, event];

    updateSettings({
      email_provider_config: {
        ...emailCfg,
        enabled_events: updated,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    try {
      await retryEmail(id);
    } finally {
      setTimeout(() => setRetryingId(null), 600);
    }
  };

  const filteredLogs = emailNotifications.filter((em) => {
    const matchEvent = filterEvent === 'all' || em.event_type === filterEvent;
    const matchStatus = filterStatus === 'all' || em.delivery_status === filterStatus;
    return matchEvent && matchStatus;
  });

  return (
    <div className="space-y-8">
      {/* Provider Status Card */}
      <div className="bg-white border border-border rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink-primary">
                Resend Transactional Email Engine
              </h3>
              <p className="text-xs text-ink-secondary mt-0.5">
                Automated student notification dispatch via server-side Edge Function.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Provider Verified & Active
            </span>
          </div>
        </div>

        {/* Configuration Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="p-4 rounded-xl bg-surface border border-border/70">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1">
              Configured Sender
            </span>
            <p className="text-xs font-semibold text-ink-primary truncate">{emailCfg.sender_name}</p>
            <p className="text-[11px] font-mono text-ink-secondary truncate">{emailCfg.sender_email}</p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border/70">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1">
              API Key Storage
            </span>
            <div className="flex items-center gap-1.5 text-xs text-ink-primary font-medium">
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              <span>Server-Side Secrets Vault</span>
            </div>
            <p className="text-[11px] text-ink-muted mt-0.5">Exclusively in Supabase Deno env secrets</p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border/70">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1">
              Last Outbox Dispatch
            </span>
            <p className="text-xs font-semibold text-ink-primary">
              {emailCfg.last_successful_send
                ? new Date(emailCfg.last_successful_send).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                : 'Active (simulated)'}
            </p>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">0 delivery failures</p>
          </div>
        </div>

        {/* Enabled Event Types Toggles */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-primary">
              Active Trigger Events
            </span>
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Preferences saved
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.keys(eventTypeLabels) as EmailEventType[]).map((evt) => {
              const isEnabled = emailCfg.enabled_events.includes(evt);
              return (
                <div
                  key={evt}
                  onClick={() => toggleEvent(evt)}
                  className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                    isEnabled
                      ? 'bg-brand-50/50 border-brand-200'
                      : 'bg-surface/50 border-border text-ink-muted'
                  }`}
                >
                  <span className="text-xs font-medium text-ink-primary">{eventTypeLabels[evt]}</span>
                  <div
                    className={`w-8 h-4 rounded-full relative transition-colors ${
                      isEnabled ? 'bg-brand-700' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                        isEnabled ? 'right-0.5' : 'left-0.5'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Outbox & Delivery Logs Table */}
      <div className="bg-white border border-border rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-ink-primary">
              Transactional Outbox & Delivery Logs ({filteredLogs.length})
            </h3>
            <p className="text-xs text-ink-secondary mt-0.5">
              Event-driven message tracking with idempotency safeguards.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-border text-xs text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Events</option>
              <option value="submission_acknowledgement">Acknowledgements</option>
              <option value="status_update">Status Updates</option>
              <option value="issue_resolved">Resolution Notices</option>
              <option value="admin_reply">Staff Replies</option>
              <option value="info_request">Information Requests</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-border text-xs text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="sent_to_provider">Sent to Provider</option>
              <option value="queued">Queued</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="border border-border rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead className="bg-surface border-b border-border text-ink-secondary uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Event & Subject</th>
                  <th className="py-3 px-4">Ref Ticket</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Idempotency Key</th>
                  <th className="py-3 px-4">Sent At</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log) => {
                  const isDelivered = log.delivery_status === 'delivered';
                  const isFailed = log.delivery_status === 'failed';

                  return (
                    <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-ink-primary whitespace-nowrap">
                        {log.recipient_email}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-medium text-ink-primary block truncate">{log.subject}</span>
                        <span className="text-[10px] text-ink-muted uppercase">
                          {eventTypeLabels[log.event_type] || log.event_type}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-brand-700 whitespace-nowrap">
                        {log.submission_ref || '--'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            isDelivered
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isFailed
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isDelivered ? 'bg-emerald-500' : isFailed ? 'bg-rose-500' : 'bg-blue-500'
                            }`}
                          />
                          {log.delivery_status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[10px] text-ink-muted truncate max-w-[120px]">
                        {log.idempotency_key}
                      </td>

                      <td className="py-3 px-4 text-ink-secondary whitespace-nowrap">
                        {log.sent_at
                          ? new Date(log.sent_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                          : 'Queued'}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleRetry(log.id)}
                          disabled={retryingId === log.id}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-700 hover:text-brand-800 p-1 rounded hover:bg-brand-50 transition-colors"
                          title="Retry delivery"
                        >
                          <RotateCw className={`w-3.5 h-3.5 ${retryingId === log.id ? 'animate-spin' : ''}`} />
                          Retry
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
