import React from 'react';
import { SubmissionType } from '../../types/database';

interface TypeBadgeProps {
  type: SubmissionType;
}

const typeMap: Record<SubmissionType, { label: string; text: string; bg: string }> = {
  complaint: { label: 'Complaint', text: 'text-rose-700', bg: 'bg-rose-50' },
  suggestion: { label: 'Suggestion', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  general_feedback: { label: 'Feedback', text: 'text-indigo-700', bg: 'bg-indigo-50' },
};

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  const cfg = typeMap[type] || typeMap.general_feedback;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-transparent ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
};
