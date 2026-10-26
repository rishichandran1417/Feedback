import React from 'react';
import { SubmissionPriority } from '../../types/database';

interface PriorityBadgeProps {
  priority: SubmissionPriority;
}

const priorityMap: Record<SubmissionPriority, { label: string; text: string; bg: string }> = {
  low: { label: 'Low', text: 'text-slate-700 dark:text-slate-300', bg: 'bg-surface border border-border' },
  medium: { label: 'Medium', text: 'text-brand-300', bg: 'bg-brand-950/60 border border-brand-800/60' },
  high: { label: 'High', text: 'text-amber-800 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50' },
  urgent: { label: 'Urgent', text: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50' },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const cfg = priorityMap[priority] || priorityMap.medium;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
};
