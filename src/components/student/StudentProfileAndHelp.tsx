import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import {
  User,
  GraduationCap,
  Shield,
  HelpCircle,
  FileText,
  Mail,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const StudentProfileAndHelp: React.FC = () => {
  const { user } = useAuth();
  const { settings, departments } = useSystem();

  return (
    <div className="max-w-4xl space-y-8">
      {/* Student Profile Overview */}
      <div className="bg-white border border-border rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-700 font-bold text-xl flex items-center justify-center border border-brand-200">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink-primary">{user?.full_name}</h2>
              <p className="text-xs text-ink-secondary">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-surface border border-border text-brand-700">
                  {user?.student_id || 'ID Pending'}
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                  Verified College Identity
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* College Grievance Policy & FAQs */}
      <div className="bg-white border border-border rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-brand-700" />
          <h3 className="text-base font-semibold text-ink-primary">
            Student Grievance Guidelines & Resolution SLAs
          </h3>
        </div>

        <div className="space-y-4 text-xs text-ink-secondary leading-relaxed">
          <div className="p-4 rounded-xl bg-surface border border-border">
            <h4 className="font-semibold text-ink-primary text-sm mb-1">
              How does the grievance review workflow operate?
            </h4>
            <p>
              When you submit a complaint or suggestion, a unique tracking reference number (e.g. <code>FB-2026-1001</code>) is automatically generated and an acknowledgement email is dispatched to your registered college address. The ticket is queued to the responsible department head, who assigns an officer to investigate and remediate the issue within target SLA deadlines.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border">
            <h4 className="font-semibold text-ink-primary text-sm mb-1">
              How is my student data and evidence protected?
            </h4>
            <p>
              Your submissions and evidence documents are stored securely with Row Level Security. Only the authorized departmental committee members assigned to your grievance have access to investigate your ticket.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border">
            <h4 className="font-semibold text-ink-primary text-sm mb-1">
              What should I do if my grievance is not resolved on time?
            </h4>
            <p>
              Tickets that exceed their target due date are automatically flagged as <strong>Overdue</strong> on the Dean's central dashboard. You may also post a follow-up message inside the ticket communication thread or contact the Central Grievance Cell at{' '}
              <a href={`mailto:${settings.college_info.support_email}`} className="text-brand-700 font-medium underline">
                {settings.college_info.support_email}
              </a>.
            </p>
          </div>
        </div>
      </div>

      {/* Department Escalation Contacts */}
      <div className="bg-white border border-border rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
        <h3 className="text-sm font-semibold text-ink-primary uppercase tracking-wider">
          Campus Redressal Officers Directory
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {departments.map((dept) => (
            <div key={dept.id} className="p-3.5 rounded-lg border border-border bg-surface/50 flex flex-col justify-between">
              <div>
                <p className="font-semibold text-ink-primary">{dept.name}</p>
                <p className="text-ink-muted text-[11px]">{dept.head_of_department || 'Department Coordinator'}</p>
              </div>
              <a
                href={`mailto:${dept.contact_email}`}
                className="text-brand-700 font-mono text-[11px] mt-2 inline-flex items-center gap-1 hover:underline"
              >
                <Mail className="w-3 h-3" /> {dept.contact_email}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
