import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { SubmissionStatus, MessageType } from '../../types/database';
import { StatusBadge } from '../common/StatusBadge';
import { TypeBadge } from '../common/TypeBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import {
  X,
  Calendar,
  Building,
  User,
  Paperclip,
  Download,
  Send,
  AlertCircle,
  History,
  Lock,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

interface SubmissionAdminDrawerProps {
  submissionId: string;
  onClose: () => void;
}

export const SubmissionAdminDrawer: React.FC<SubmissionAdminDrawerProps> = ({
  submissionId,
  onClose,
}) => {
  const {
    submissions,
    departments,
    updateStatus,
    assignSubmission,
    setDueDate,
    addMessage,
  } = useSystem();

  const sub = submissions.find((s) => s.id === submissionId);

  // Status Change State
  const [newStatus, setNewStatus] = useState<SubmissionStatus | ''>('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);

  // Assignment State
  const [selectedDeptId, setSelectedDeptId] = useState(sub?.department_id || '');
  const [customDueDate, setCustomDueDate] = useState(
    sub?.due_date ? new Date(sub.due_date).toISOString().split('T')[0] : ''
  );

  // Communication State
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('admin_reply');
  const [isInternalNote, setIsInternalNote] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!sub) return null;

  const handleStatusTransition = async (targetStatus: SubmissionStatus) => {
    if (targetStatus === 'resolved') {
      setNewStatus('resolved');
      setShowResolveModal(true);
      return;
    }

    try {
      setIsLoading(true);
      setFeedbackMsg(null);
      await updateStatus(sub.id, targetStatus, statusRemarks.trim() || undefined);
      setStatusRemarks('');
      setFeedbackMsg({ type: 'success', text: `Status successfully updated to ${targetStatus.replace('_', ' ')}` });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Status transition failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmResolve = async () => {
    if (!resolutionSummary.trim()) {
      setFeedbackMsg({ type: 'error', text: 'A detailed resolution summary is mandatory before resolving this issue.' });
      return;
    }

    try {
      setIsLoading(true);
      setFeedbackMsg(null);
      await updateStatus(
        sub.id,
        'resolved',
        statusRemarks.trim() || undefined,
        resolutionSummary.trim()
      );
      setShowResolveModal(false);
      setResolutionSummary('');
      setStatusRemarks('');
      setFeedbackMsg({ type: 'success', text: 'Issue marked as Resolved. Resolution email dispatched to student.' });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to resolve grievance.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAssignment = async () => {
    try {
      setIsLoading(true);
      setFeedbackMsg(null);
      await assignSubmission(sub.id, selectedDeptId, sub.assigned_to || 'u-admin-01');
      if (customDueDate) {
        await setDueDate(sub.id, new Date(customDueDate).toISOString());
      }
      setFeedbackMsg({ type: 'success', text: 'Department routing & target date updated.' });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Assignment update failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    try {
      setIsLoading(true);
      setFeedbackMsg(null);
      const chosenType: MessageType = isInternalNote ? 'internal_note' : messageType;
      await addMessage(sub.id, messageContent.trim(), chosenType, isInternalNote);
      setMessageContent('');
      setFeedbackMsg({
        type: 'success',
        text: isInternalNote
          ? 'Internal staff note recorded (private to administration).'
          : 'Reply sent and student notified via college email.',
      });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Message dispatch failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAttachment = (fileName: string) => {
    const blob = new Blob([`Evidence for ${fileName}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Mandatory Resolution Summary Modal */}
      {showResolveModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowResolveModal(false)}
          title="Resolve Grievance & Record Remediation"
          description={`Reference: ${sub.reference_number} — ${sub.subject}`}
        >
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                Resolution Summary (Mandatory for Registry & Student Email) *
              </label>
              <textarea
                rows={4}
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
                placeholder="Explain the investigation findings, corrective actions taken, and college remediation..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-border text-xs text-ink-primary focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-ink-muted resize-y"
                required
              />
              <p className="text-[11px] text-ink-muted mt-1">
                This official summary will be emailed directly to the student and archived permanently in audit records.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1.5">
                Closing Remarks (Optional)
              </label>
              <input
                type="text"
                value={statusRemarks}
                onChange={(e) => setStatusRemarks(e.target.value)}
                placeholder="e.g. Approved by Dean of Academic Affairs"
                className="w-full px-3.5 py-2 rounded-lg border border-border text-xs text-ink-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowResolveModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isLoading}
                onClick={handleConfirmResolve}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Confirm & Mark Resolved
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Main Drawer Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Drawer Window */}
        <div className="relative w-full max-w-2xl h-full bg-white border-l border-border shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-5 border-b border-border flex items-start justify-between bg-surface/50">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  {sub.reference_number}
                </span>
                <TypeBadge type={sub.submission_type} />
                <PriorityBadge priority={sub.priority} />
                <StatusBadge status={sub.status} />
              </div>
              <h2 className="text-base font-semibold text-ink-primary">{sub.subject}</h2>
            </div>

            <button
              onClick={onClose}
              className="text-ink-secondary hover:text-ink-primary p-1 rounded-lg hover:bg-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Scroll */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 text-xs">
            {feedbackMsg && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* Student Identity Card */}
            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-primary uppercase tracking-wider text-[11px]">
                  Student Identity Details
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-ink-secondary pt-1">
                <div>
                  <span className="text-ink-muted block text-[10px] uppercase">Student Name:</span>
                  <span className="font-medium text-ink-primary">{sub.student_name}</span>
                </div>
                <div>
                  <span className="text-ink-muted block text-[10px] uppercase">College Email:</span>
                  <span className="font-medium text-ink-primary">{sub.student_email || 'Confidential'}</span>
                </div>
              </div>
            </div>

            {/* Workflow Status Actions: 7-Stage Workflow */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-primary uppercase tracking-wider text-[11px]">
                  Workflow State Transition
                </span>
                <span className="text-ink-muted text-[11px]">Current: {sub.status.replace('_', ' ')}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={sub.status === 'pending_review'}
                  onClick={() => handleStatusTransition('pending_review')}
                >
                  Pending Review
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  disabled={sub.status === 'in_progress'}
                  onClick={() => handleStatusTransition('in_progress')}
                >
                  In Progress
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  disabled={sub.status === 'awaiting_student_response'}
                  onClick={() => handleStatusTransition('awaiting_student_response')}
                >
                  Ask Student
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={sub.status === 'resolved'}
                  onClick={() => handleStatusTransition('resolved')}
                >
                  Resolve Issue
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  disabled={sub.status === 'closed'}
                  onClick={() => handleStatusTransition('closed')}
                >
                  Close Ticket
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  className="text-rose-700 hover:bg-rose-50"
                  disabled={sub.status !== 'resolved' && sub.status !== 'closed'}
                  onClick={() => handleStatusTransition('reopened')}
                >
                  Reopen Issue
                </Button>
              </div>
            </div>

            {/* Department Assignment & Due Date */}
            <div className="space-y-3 p-4 rounded-xl border border-border bg-white">
              <span className="font-semibold text-ink-primary uppercase tracking-wider text-[11px]">
                Department Routing & Target Resolution SLA
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-ink-primary mb-1">
                    Responsible Department
                  </label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-ink-primary mb-1">
                    Target Resolution Due Date
                  </label>
                  <input
                    type="date"
                    value={customDueDate}
                    onChange={(e) => setCustomDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button size="sm" variant="secondary" onClick={handleUpdateAssignment}>
                  Save Routing Changes
                </Button>
              </div>
            </div>

            {/* Full Grievance Description */}
            <div className="space-y-2">
              <span className="font-semibold text-ink-primary uppercase tracking-wider text-[11px]">
                Full Description
              </span>
              <div className="p-4 rounded-xl bg-surface border border-border text-ink-primary leading-relaxed whitespace-pre-line">
                {sub.description}
              </div>
              {sub.location && (
                <p className="text-ink-secondary text-[11px]">
                  <strong className="text-ink-primary">Observed Location:</strong> {sub.location}
                </p>
              )}
            </div>

            {/* Resolution Summary if Present */}
            {sub.resolution_summary && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  Official Resolution Record
                </div>
                <p className="text-emerald-900 leading-relaxed pl-5 text-xs">
                  {sub.resolution_summary}
                </p>
              </div>
            )}

            {/* Attached Evidence */}
            {sub.attachments && sub.attachments.length > 0 && (
              <div className="space-y-2">
                <span className="font-semibold text-ink-primary uppercase tracking-wider text-[11px]">
                  Uploaded Evidence ({sub.attachments.length})
                </span>
                <div className="space-y-2">
                  {sub.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-lg border border-border bg-white flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-medium text-ink-primary">{att.file_name}</p>
                        <p className="text-[10px] text-ink-muted">{Math.round(att.file_size / 1024)} KB</p>
                      </div>
                      <button
                        onClick={() => handleDownloadAttachment(att.file_name)}
                        className="p-1.5 text-brand-700 hover:bg-brand-50 rounded-md"
                        title="Download evidence"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit History Timeline */}
            <div className="space-y-3">
              <span className="font-semibold text-ink-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-ink-secondary" />
                Immutable Audit History
              </span>
              <div className="border border-border rounded-xl divide-y divide-border bg-white overflow-hidden">
                {sub.status_history?.map((hist) => (
                  <div key={hist.id} className="p-3 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={hist.new_status} size="sm" />
                        <span className="text-[11px] text-ink-secondary">
                          by <strong>{hist.changed_by_name || 'Admin'}</strong>
                        </span>
                      </div>
                      {hist.remarks && (
                        <p className="text-ink-primary font-medium pl-1 text-[11px]">{hist.remarks}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-ink-muted shrink-0">
                      {new Date(hist.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Communication Thread & Internal Notes */}
            <div className="space-y-4">
              <span className="font-semibold text-ink-primary uppercase tracking-wider text-[11px]">
                Communication Thread & Staff Notes
              </span>

              {/* Message Feed */}
              <div className="space-y-3">
                {sub.messages?.map((msg) => {
                  const isInternal = msg.is_internal;
                  const isStudent = msg.message_type === 'student_reply';

                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-xl border space-y-1 ${
                        isInternal
                          ? 'bg-amber-50/60 border-amber-300'
                          : isStudent
                          ? 'bg-brand-50/50 border-brand-200'
                          : 'bg-surface border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-ink-primary flex items-center gap-1.5">
                          {isInternal && <Lock className="w-3 h-3 text-amber-700" />}
                          {msg.sender_name || 'User'}
                          <span className="text-ink-muted font-normal">
                            ({isInternal ? 'Private Staff Note' : isStudent ? 'Student Reply' : 'Admin Reply'})
                          </span>
                        </span>
                        <span className="text-ink-muted">
                          {new Date(msg.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-ink-primary whitespace-pre-line">{msg.content}</p>
                    </div>
                  );
                })}
              </div>

              {/* Admin Composer */}
              <form onSubmit={handleSendMessage} className="space-y-3 pt-2">
                <div className="flex items-center gap-4 bg-surface p-2 rounded-lg border border-border">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="msg_visibility"
                      checked={!isInternalNote}
                      onChange={() => setIsInternalNote(false)}
                      className="text-brand-700"
                    />
                    <span className="text-ink-primary font-medium">Student Visible Reply</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="msg_visibility"
                      checked={isInternalNote}
                      onChange={() => setIsInternalNote(true)}
                      className="text-amber-700"
                    />
                    <span className="text-amber-900 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-700" /> Internal Staff Note Only
                    </span>
                  </label>
                </div>

                {!isInternalNote && (
                  <div className="flex items-center gap-3">
                    <span className="text-ink-muted">Type:</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="admin_reply_kind"
                        checked={messageType === 'admin_reply'}
                        onChange={() => setMessageType('admin_reply')}
                      />
                      <span>General Reply</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="admin_reply_kind"
                        checked={messageType === 'info_request'}
                        onChange={() => setMessageType('info_request')}
                      />
                      <span>Request Additional Info</span>
                    </label>
                  </div>
                )}

                <textarea
                  rows={3}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder={
                    isInternalNote
                      ? 'Add confidential note (never visible to student)...'
                      : 'Add remarks for student (will trigger transactional email)...'
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-ink-muted"
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isLoading}
                    disabled={!messageContent.trim()}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    {isInternalNote ? 'Save Private Note' : 'Send & Notify Student'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-border flex justify-end bg-surface/40">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close Drawer
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
