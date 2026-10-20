import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { SubmissionType, SubmissionPriority } from '../../types/database';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import confetti from 'canvas-confetti';
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Send,
} from 'lucide-react';

interface SubmitFeedbackFormProps {
  onSuccess: (newSubId: string) => void;
  onCancel: () => void;
}

export const SubmitFeedbackForm: React.FC<SubmitFeedbackFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { categories, settings, createSubmission } = useSystem();

  const [submissionType, setSubmissionType] = useState<SubmissionType>('complaint');
  const [categoryId, setCategoryId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<SubmissionPriority>('medium');

  // File uploads
  const [attachments, setAttachments] = useState<
    { file_name: string; file_size: number; file_type: string; storage_path: string }[]
  >([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<{ id: string; ref: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeCategories = categories.filter((c) => c.is_active);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxMb = settings.file_upload_limits.max_file_size_mb || 10;
    const allowedExts = settings.file_upload_limits.allowed_extensions || ['.jpg', '.png', '.pdf', '.docx'];

    const newAttachments = [...attachments];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!allowedExts.includes(ext)) {
        setUploadError(`File ${file.name} has an unsupported format. Allowed: ${allowedExts.join(', ')}`);
        return;
      }

      if (file.size > maxMb * 1024 * 1024) {
        setUploadError(`File ${file.name} exceeds the maximum allowed limit of ${maxMb}MB.`);
        return;
      }

      newAttachments.push({
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || 'application/octet-stream',
        storage_path: `submission-evidence/${Date.now()}_${file.name}`,
      });
    }

    setAttachments(newAttachments);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!categoryId) {
      setErrorMsg('Please select a relevant category.');
      return;
    }
    if (!subject.trim()) {
      setErrorMsg('Subject line is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Detailed description of your issue or suggestion is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createSubmission({
        submission_type: submissionType,
        category_id: categoryId,
        subject: subject.trim(),
        description: description.trim(),
        location: location.trim() || undefined,
        priority,
        attachments,
      });

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#1d4ed8', '#3b82f6', '#10b981'],
        });
      } catch {
        // graceful ignore
      }

      setSubmittedRef({ id: created.id, ref: created.reference_number });
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 min-w-0">
      {/* Success Modal */}
      {submittedRef && (
        <Modal
          isOpen={true}
          onClose={() => onSuccess(submittedRef.id)}
          title="Submission Recorded Successfully"
          description="Your feedback has been logged into the college grievance registry."
        >
          <div className="space-y-6 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <p className="text-xs text-ink-secondary uppercase tracking-wider font-semibold">
                Your Official Reference Number
              </p>
              <p className="text-2xl font-mono font-bold text-brand-700 mt-1 select-all">
                {submittedRef.ref}
              </p>
              <p className="text-xs text-ink-secondary mt-2 max-w-sm mx-auto leading-relaxed">
                An automated acknowledgement receipt has been queued to your registered college email. Please retain this reference code for future follow-ups.
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => onSuccess(submittedRef.id)}
              >
                View Submission Details &rarr;
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-xl p-6 sm:p-8 space-y-8 shadow-xs min-w-0">
        {errorMsg && (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 1: Submission Type */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            1. Select Submission Type *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
            {[
              {
                id: 'complaint',
                title: 'Grievance / Complaint',
                desc: 'Report a problem, breakdown, or service deficiency.',
              },
              {
                id: 'suggestion',
                title: 'Suggestion',
                desc: 'Propose an improvement or new campus initiative.',
              },
              {
                id: 'general_feedback',
                title: 'General Feedback',
                desc: 'Share general comments or appreciation.',
              },
            ].map((t) => {
              const isSelected = submissionType === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setSubmissionType(t.id as SubmissionType)}
                  className={`p-4 rounded-xl border text-left transition-all min-w-0 ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-600'
                      : 'border-border hover:border-slate-300 bg-surface/30'
                  }`}
                >
                  <p className={`text-sm font-semibold truncate ${isSelected ? 'text-brand-900' : 'text-ink-primary'}`}>
                    {t.title}
                  </p>
                  <p className="text-xs text-ink-secondary mt-1 line-clamp-2">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Category & Priority */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              2. Category & Department Routing *
            </label>
            <span className="text-xs text-ink-muted">Routed to designated department</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-primary mb-1.5">
                Issue Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                required
              >
                <option value="">-- Choose Category --</option>
                {activeCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (SLA: ~{c.target_resolution_days} days)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-primary mb-1.5">
                Priority / Urgency
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as SubmissionPriority)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
              >
                <option value="low">Low — Minor enhancement</option>
                <option value="medium">Medium — Normal priority</option>
                <option value="high">High — Impairs routine activity</option>
                <option value="urgent">Urgent — Severe hazard or immediate deadline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Subject & Description */}
        <div className="space-y-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            3. Details of Grievance *
          </label>

          <div>
            <label className="block text-xs font-medium text-ink-primary mb-1.5">
              Subject Line *
            </label>
            <input
              type="text"
              placeholder="e.g., Projector malfunctioning in Ramanujan Hall 204"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-ink-muted transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-primary mb-1.5">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              placeholder="Provide a specific description of what occurred, date/time observed, steps taken, or expected outcome..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-ink-muted transition-colors resize-y"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-primary mb-1.5">
              Specific Location or Room (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., North Campus Hostel Block B, Room 312"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-ink-muted transition-colors"
            />
          </div>
        </div>

        {/* Section 4: Supporting Evidence Upload */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              4. Supporting Evidence (Optional)
            </label>
            <span className="text-xs text-ink-muted">
              Max {settings.file_upload_limits.max_file_size_mb}MB (JPG, PNG, PDF, DOCX)
            </span>
          </div>

          <div className="border border-dashed border-border rounded-xl p-6 text-center hover:bg-surface/50 transition-colors">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-ink-primary">
              Click to select or drag and drop supporting photos or documentation
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Evidence is kept confidential and stored within the private 'submission-evidence' vault.
            </p>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload-input"
            />
            <label
              htmlFor="file-upload-input"
              className="inline-block mt-3 px-4 py-1.5 text-xs font-medium rounded-lg border border-border bg-white text-ink-primary hover:bg-surface cursor-pointer"
            >
              Browse Files
            </label>
          </div>

          {uploadError && (
            <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
          )}

          {/* Attached Files List */}
          {attachments.length > 0 && (
            <div className="space-y-2 mt-3">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <File className="w-4 h-4 text-brand-700 shrink-0" />
                    <span className="font-medium text-ink-primary truncate">{file.file_name}</span>
                    <span className="text-ink-muted shrink-0">
                      ({Math.round(file.file_size / 1024)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-ink-secondary hover:text-rose-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <Button type="button" variant="subtle" onClick={onCancel}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Submit Feedback
          </Button>
        </div>
      </form>
    </div>
  );
};
