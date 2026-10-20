import React from 'react';
import { SubmissionPriority } from '../../types/database';

interface PriorityBadgeProps {
  priority: SubmissionPriority;
}

const priorityMap: Record<SubmissionPriority, { label: string; text: string; bg: string }> = {
  low: { label: 'Low', text: 'text-slate-600', bg: 'bg-slate-100' },
  medium: { label: 'Medium', text: 'text-blue-700', bg: 'bg-blue-50' },
  high: { label: 'High', text: 'text-amber-700', bg: 'bg-amber-50' },
  urgent: { label: 'Urgent', text: 'text-rose-700', bg: 'bg-rose-50' },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const cfg = priorityMap[priority] || priorityMap.medium;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
};
