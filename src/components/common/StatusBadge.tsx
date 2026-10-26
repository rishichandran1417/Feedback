import React from 'react';
import { SubmissionStatus } from '../../types/database';

interface StatusBadgeProps {
  status: SubmissionStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<SubmissionStatus, { label: string; bg: string; text: string; dot: string; border: string }> = {
  submitted: {
    label: 'Submitted',
    bg: 'bg-surface',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-border',
    dot: 'bg-slate-400',
  },
  pending_review: {
    label: 'Pending Review',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/50',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-brand-950/60',
    text: 'text-brand-300',
    border: 'border-brand-800/60',
    dot: 'bg-brand-400',
  },
  awaiting_student_response: {
    label: 'Awaiting Student',
    bg: 'bg-purple-50 dark:bg-purple-950/50',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800/50',
    dot: 'bg-purple-500 dark:bg-purple-400',
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  closed: {
    label: 'Closed',
    bg: 'bg-surface',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-border',
    dot: 'bg-slate-400 dark:bg-slate-500',
  },
  reopened: {
    label: 'Reopened',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/50',
    dot: 'bg-rose-500 dark:bg-rose-400',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status] || statusConfig.submitted;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};
