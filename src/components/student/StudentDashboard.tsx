import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { StatusBadge } from '../common/StatusBadge';
import { TypeBadge } from '../common/TypeBadge';
import { Button } from '../common/Button';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (tab: string) => void;
  onSelectSubmission: (id: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onSelectSubmission,
}) => {
  const { user } = useAuth();
  const { submissions, notifications, settings } = useSystem();

  // Metrics for current student
  const studentSubmissions = submissions; // already RLS filtered
  const totalSubmissions = studentSubmissions.length;
  const pendingCount = studentSubmissions.filter((s) => s.status === 'submitted' || s.status === 'pending_review').length;
  const inProgressCount = studentSubmissions.filter(
    (s) => s.status === 'in_progress' || s.status === 'awaiting_student_response'
  ).length;
  const resolvedCount = studentSubmissions.filter((s) => s.status === 'resolved' || s.status === 'closed').length;

  const awaitingStudentCount = studentSubmissions.filter(
    (s) => s.status === 'awaiting_student_response'
  ).length;

  const recentSubmissions = [...studentSubmissions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Student Redressal Portal
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold text-ink-primary mt-1">
            {user?.full_name ? `Welcome back, ${user.full_name.split(' ')[0]}` : 'Welcome to voice'}
          </h2>
          <p className="text-sm text-ink-secondary mt-1 max-w-xl">
            {user
              ? 'Track your submitted campus grievances, reply to inquiries from administrators, and submit new feedback directly to the responsible departments.'
              : 'Submit academic or campus grievances, provide suggestions, and track college resolutions with verified institutional security.'}
          </p>
        </div>

        <Button
          onClick={() => onNavigate('submit')}
          leftIcon={<PlusCircle className="w-4 h-4" />}
          size="md"
          className="self-start md:self-auto shrink-0"
        >
          Submit Feedback
        </Button>
      </div>

      {/* Guest Information Banner if not logged in */}
      {!user && (
        <div className="bg-brand-950/40 border border-brand-800/50 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-brand-200">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-brand-400 shrink-0" />
            <span>
              You can browse categories, policies, and draft submissions freely. Login with your official college mail (<strong>@cet.ac.in</strong>) is only required when you submit feedback.
            </span>
          </div>
          <button
            onClick={() => onNavigate('submit')}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-500 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Start Feedback &rarr;
          </button>
        </div>
      )}

      {/* Action Required Alert Banner if awaiting response */}
      {awaitingStudentCount > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-300">
                Information Requested ({awaitingStudentCount})
              </h4>
              <p className="text-xs text-amber-400/90 mt-0.5">
                An administrator has requested additional clarification or supporting documents for your open submission. Please provide a response to proceed.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('submissions')}
            className="text-xs font-semibold text-amber-300 hover:underline shrink-0 self-start sm:self-auto pl-8 sm:pl-0"
          >
            Review Issues &rarr;
          </button>
        </div>
      )}

      {/* KPI Cards: Restrained, Whitespace-First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 lg:p-6 transition-all hover:border-brand-500/40">
          <div className="flex items-center justify-between text-ink-secondary mb-2.5 sm:mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Total Submissions</span>
            <FileText className="w-4 h-4 text-ink-muted" />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-ink-primary">{totalSubmissions}</p>
          <span className="text-xs text-ink-muted mt-1 block">Lifetime student records</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 lg:p-6 transition-all hover:border-brand-500/40">
          <div className="flex items-center justify-between text-ink-secondary mb-2.5 sm:mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-ink-primary">{pendingCount}</p>
          <span className="text-xs text-ink-muted mt-1 block">Awaiting triage</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 lg:p-6 transition-all hover:border-brand-500/40">
          <div className="flex items-center justify-between text-ink-secondary mb-2.5 sm:mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">In Progress</span>
            <MessageSquare className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-ink-primary">{inProgressCount}</p>
          <span className="text-xs text-ink-muted mt-1 block">Under active investigation</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 lg:p-6 transition-all hover:border-brand-500/40">
          <div className="flex items-center justify-between text-ink-secondary mb-2.5 sm:mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-ink-primary">{resolvedCount}</p>
          <span className="text-xs text-ink-muted mt-1 block">Successfully resolved</span>
        </div>
      </div>

      {/* Recent Submissions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink-primary tracking-tight">Recent Activity</h3>
            <p className="text-xs text-ink-secondary">Your latest submissions and their current status</p>
          </div>
          {studentSubmissions.length > 0 && (
            <button
              onClick={() => onNavigate('submissions')}
              className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              View all ({studentSubmissions.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentSubmissions.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl bg-surface/30">
            <FileText className="w-8 h-8 text-ink-muted mx-auto mb-2" />
            <p className="text-sm font-medium text-ink-primary">No submissions yet</p>
            <p className="text-xs text-ink-secondary mt-1 mb-4">
              Have an academic issue or campus suggestion? Submit your first feedback.
            </p>
            <Button size="sm" onClick={() => onNavigate('submit')}>
              Submit Feedback
            </Button>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden">
            {recentSubmissions.map((sub) => (
              <div
                key={sub.id}
                onClick={() => onSelectSubmission(sub.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface/60 cursor-pointer transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-brand-400">
                      {sub.reference_number}
                    </span>
                    <TypeBadge type={sub.submission_type} />
                    <span className="text-xs text-ink-muted">•</span>
                    <span className="text-xs text-ink-secondary truncate max-w-xs">{sub.category_name}</span>
                  </div>
                  <h4 className="text-sm font-medium text-ink-primary truncate">{sub.subject}</h4>
                  <p className="text-xs text-ink-muted">
                    Submitted on {new Date(sub.created_at).toLocaleDateString()} at{' '}
                    {new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                  <StatusBadge status={sub.status} />
                  <ArrowRight className="w-4 h-4 text-ink-muted" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
