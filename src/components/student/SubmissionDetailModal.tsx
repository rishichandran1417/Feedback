import React, { useState } from 'react';
import { Submission, SubmissionStatus } from '../../types/database';
import { useSystem } from '../../context/SystemContext';
import { StatusBadge } from '../common/StatusBadge';
import { TypeBadge } from '../common/TypeBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { Button } from '../common/Button';
import {
  X,
  Calendar,
  Clock,
  Building,
  User,
  Paperclip,
  Download,
  Send,
  CheckCircle2,
  AlertTriangle,
  History,
  FileCheck,
} from 'lucide-react';

interface SubmissionDetailModalProps {
  submissionId: string;
  onClose: () => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submissionId,
  onClose,
}) => {
  const { submissions, addMessage } = useSystem();
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sub = submissions.find((s) => s.id === submissionId);

  if (!sub) return null;

  // Security: only non-internal messages visible to students
  const visibleMessages = (sub.messages || []).filter((m) => !m.is_internal);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setIsSending(true);
      setErrorMsg(null);
      await addMessage(sub.id, replyText.trim(), 'student_reply', false);
      setReplyText('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit response.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadAttachment = (fileName: string) => {
    // Generate a temporary downloadable dummy/file blob for simulation
    const blob = new Blob([`Sample evidence data for ${fileName}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl max-h-[calc(100dvh-2rem)] flex flex-col bg-surface rounded-xl border border-border shadow-2xl z-10 my-auto overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border flex items-start justify-between bg-surface shrink-0">
          <div className="space-y-1.5 pr-2 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-mono text-xs font-bold text-brand-300 bg-brand-950/80 px-2 py-0.5 rounded border border-brand-800/60">
                {sub.reference_number}
              </span>
              <TypeBadge type={sub.submission_type} />
              <PriorityBadge priority={sub.priority} />
              <StatusBadge status={sub.status} />
            </div>
            <h2 className="text-base sm:text-xl font-semibold text-ink-primary tracking-tight break-words">
              {sub.subject}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-ink-secondary hover:text-ink-primary p-1.5 rounded-lg hover:bg-background/60 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 flex-1 overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-background/60 border border-border text-xs">
            <div>
              <span className="text-ink-muted block text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
                Submission Date
              </span>
              <span className="font-medium text-ink-primary mt-0.5 block truncate">
                {new Date(sub.created_at).toLocaleDateString()}
              </span>
            </div>

            <div>
              <span className="text-ink-muted block text-[11px] uppercase tracking-wider font-semibold">
                Department
              </span>
              <span className="font-medium text-ink-primary mt-0.5 block truncate">
                {sub.department_name || 'General Admin'}
              </span>
            </div>

            <div>
              <span className="text-ink-muted block text-[11px] uppercase tracking-wider font-semibold">
                Category
              </span>
              <span className="font-medium text-ink-primary mt-0.5 block truncate">
                {sub.category_name}
              </span>
            </div>

            <div>
              <span className="text-ink-muted block text-[11px] uppercase tracking-wider font-semibold">
                Resolution Target
              </span>
              <span className="font-medium text-ink-primary mt-0.5 block">
                {sub.due_date ? new Date(sub.due_date).toLocaleDateString() : 'Under Review'}
              </span>
            </div>
          </div>

          {/* Overdue / Escalation Alert if past due date */}
          {sub.due_date && new Date(sub.due_date) < new Date() && sub.status !== 'resolved' && sub.status !== 'closed' && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-950 dark:text-amber-100">Resolution Target Exceeded:</span> If your issue has not been resolved on time, you can reach support (Admin) by posting a message in the communication thread below.
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Grievance Description
            </h4>
            <div className="p-4 rounded-xl bg-background/50 border border-border text-sm text-ink-primary leading-relaxed whitespace-pre-line">
              {sub.description}
            </div>
            {sub.location && (
              <p className="text-xs text-ink-secondary flex items-center gap-1.5 pt-1">
                <span className="font-medium text-ink-primary">Location:</span> {sub.location}
              </p>
            )}
          </div>

          {/* Resolution Card if Resolved */}
          {sub.resolution_summary && (
            <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                Administrative Resolution Summary
              </div>
              <p className="text-xs text-emerald-200 leading-relaxed pl-7">
                {sub.resolution_summary}
              </p>
              {sub.resolution_date && (
                <p className="text-[11px] text-emerald-400/80 pl-7 font-medium">
                  Resolved on: {new Date(sub.resolution_date).toLocaleDateString()} at{' '}
                  {new Date(sub.resolution_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          )}

          {/* Attached Evidence */}
          {sub.attachments && sub.attachments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-brand-400" />
                Supporting Evidence ({sub.attachments.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sub.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-lg border border-border bg-background/70 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="truncate">
                      <p className="font-medium text-ink-primary truncate">{att.file_name}</p>
                      <p className="text-[11px] text-ink-muted">
                        {Math.round(att.file_size / 1024)} KB • Confidential
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownloadAttachment(att.file_name)}
                      className="p-1.5 text-brand-400 hover:bg-brand-950/60 rounded-md transition-colors shrink-0 cursor-pointer"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status History Timeline */}
          {sub.status_history && sub.status_history.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
                <History className="w-4 h-4 text-brand-400" />
                Official Status History
              </h4>
              <div className="border border-border rounded-xl divide-y divide-border bg-background/50 overflow-hidden text-xs">
                {sub.status_history.map((hist) => (
                  <div key={hist.id} className="p-3.5 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={hist.new_status} size="sm" />
                        <span className="text-[11px] text-ink-secondary font-medium">
                          by {hist.changed_by_name || 'Authority'}
                        </span>
                      </div>
                      {hist.remarks && (
                        <p className="text-xs text-ink-primary pl-1 font-medium">{hist.remarks}</p>
                      )}
                    </div>
                    <span className="text-[11px] text-ink-muted shrink-0">
                      {new Date(hist.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Communication & Replies */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Official Communication Thread
            </h4>

            {visibleMessages.length === 0 ? (
              <p className="text-xs text-ink-muted italic p-4 text-center border border-dashed border-border rounded-xl bg-background/30">
                No replies posted yet. When an administrator responds or requests info, messages will appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {visibleMessages.map((msg) => {
                  const isStudent = msg.message_type === 'student_reply';
                  const isInfoReq = msg.message_type === 'info_request';

                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                        isStudent
                          ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-200 dark:border-brand-800/60 ml-4 sm:ml-8 text-brand-950 dark:text-purple-100'
                          : isInfoReq
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 mr-4 sm:mr-8 text-amber-950 dark:text-amber-100'
                          : 'bg-background/80 border-border mr-4 sm:mr-8 text-ink-primary'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold flex items-center gap-1.5">
                          {isInfoReq && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                          {isStudent ? (
                            <>
                              <span className="text-brand-300">{msg.sender_name || 'You'}</span>
                              <span className="text-ink-muted font-normal"> (Student)</span>
                            </>
                          ) : isInfoReq ? (
                            <>
                              <span className="text-amber-300">{msg.sender_name || 'Administrator'}</span>
                              <span className="text-ink-muted font-normal"> (Information Request)</span>
                            </>
                          ) : (
                            <span className="text-ink-primary">{msg.sender_name || 'Administrator'}</span>
                          )}
                        </span>
                        <span className="text-ink-muted">
                          {new Date(msg.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="whitespace-pre-line leading-relaxed text-ink-secondary">
                        {msg.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Student Reply Input Box */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-2">
              {errorMsg && (
                <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
              )}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-ink-primary">
                  Message Department Representative
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Need support, follow up on an unresolved issue, or reply to the department representative? Type here..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-xs text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-ink-muted resize-y"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSending}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                  disabled={!replyText.trim()}
                >
                  Post Reply
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border flex justify-end bg-surface">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
