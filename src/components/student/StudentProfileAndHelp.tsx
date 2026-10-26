import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { CollegeLoginModal } from '../auth/CollegeLoginModal';
import {
  User,
  HelpCircle,
  Mail,
} from 'lucide-react';

export const StudentProfileAndHelp: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useSystem();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="max-w-4xl space-y-6 sm:space-y-8">
      <CollegeLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Student Profile Overview */}
      <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 shadow-xs">
        {!user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-border">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-background text-ink-muted font-bold text-lg sm:text-xl flex items-center justify-center border border-border shrink-0">
                <User className="w-6 h-6 text-ink-muted" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-ink-primary">Student / Campus Visitor</h2>
                <p className="text-xs text-ink-secondary">Sign in with your @cet.ac.in college email to verify your student identity and record submissions.</p>
              </div>
            </div>
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Mail className="w-4 h-4" />
              <span>Login with College Mail</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-border">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-brand-950/80 text-brand-300 font-bold text-lg sm:text-xl flex items-center justify-center border border-brand-800/60 shrink-0">
                {user?.full_name?.charAt(0) || 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-ink-primary truncate">{user?.full_name}</h2>
                <p className="text-xs text-ink-secondary truncate font-mono">{user?.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-background border border-border text-brand-300">
                    {user?.student_id || 'ID Pending'}
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 font-medium">
                    Verified College Identity
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* College Grievance Policy & FAQs */}
      <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-brand-400 shrink-0" />
          <h3 className="text-base font-semibold text-ink-primary">
            Student Grievance Guidelines & Resolution SLAs
          </h3>
        </div>

        <div className="space-y-4 text-xs text-ink-secondary leading-relaxed">
          <div className="p-3.5 sm:p-4 rounded-xl bg-background/60 border border-border">
            <h4 className="font-semibold text-ink-primary text-sm mb-1">
              How does the grievance review workflow operate?
            </h4>
            <p>
              When you submit a complaint or suggestion, a unique tracking reference number (e.g. <code>FB-2026-1001</code>) is automatically generated. The ticket is queued directly to the responsible Department Representative, who investigates, coordinates, and remediates the issue within target SLA deadlines.
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-background/60 border border-border">
            <h4 className="font-semibold text-ink-primary text-sm mb-1">
              How is my student data and evidence protected?
            </h4>
            <p>
              Your submissions and evidence documents are stored securely with Row Level Security. Only authorized student department representatives assigned to your grievance have access to review and resolve your ticket.
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-background/60 border border-border">
            <h4 className="font-semibold text-ink-primary text-sm mb-1">
              What should I do if my grievance is not resolved on time?
            </h4>
            <p>
              If your grievance is not resolved within the target timeframe, it is automatically flagged as <strong>Overdue</strong>. You can reach out directly by posting a message in your submission's communication thread to follow up with the department representative.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

