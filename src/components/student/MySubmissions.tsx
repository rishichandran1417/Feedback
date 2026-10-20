import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { StatusBadge } from '../common/StatusBadge';
import { TypeBadge } from '../common/TypeBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { EmptyState } from '../common/EmptyState';
import {
  Search,
  Filter,
  ArrowUpDown,
  AlertCircle,
  Calendar,
  MessageSquare,
  FileCheck,
} from 'lucide-react';

interface MySubmissionsProps {
  onSelectSubmission: (id: string) => void;
  onNewSubmission: () => void;
}

export const MySubmissions: React.FC<MySubmissionsProps> = ({
  onSelectSubmission,
  onNewSubmission,
}) => {
  const { submissions, categories } = useSystem();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    // Search
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      sub.reference_number.toLowerCase().includes(term) ||
      sub.subject.toLowerCase().includes(term) ||
      sub.description.toLowerCase().includes(term);

    // Type filter
    const matchType = selectedType === 'all' || sub.submission_type === selectedType;

    // Category filter
    const matchCategory = selectedCategory === 'all' || sub.category_id === selectedCategory;

    // Status filter
    const matchStatus = selectedStatus === 'all' || sub.status === selectedStatus;

    return matchSearch && matchType && matchCategory && matchStatus;
  });

  // Sort
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white border border-border rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by reference number (e.g. FB-2026-1001) or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border text-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
              className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface flex items-center gap-1.5 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortBy === 'newest' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>

        {/* Filter Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/60">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-border text-xs text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Types</option>
              <option value="complaint">Complaints</option>
              <option value="suggestion">Suggestions</option>
              <option value="general_feedback">General Feedback</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-border text-xs text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-border text-xs text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="pending_review">Pending Review</option>
              <option value="in_progress">In Progress</option>
              <option value="awaiting_student_response">Awaiting Your Response</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {sortedSubmissions.length === 0 ? (
        <EmptyState
          title="No submissions match your filters"
          description="Try clearing your search keyword or selected category/status filters."
          actionLabel="Submit New Feedback"
          onAction={onNewSubmission}
        />
      ) : (
        <div className="bg-white border border-border rounded-xl divide-y divide-border overflow-hidden shadow-xs">
          {sortedSubmissions.map((sub) => {
            const isAwaiting = sub.status === 'awaiting_student_response';
            const messageCount = sub.messages ? sub.messages.filter((m) => !m.is_internal).length : 0;

            return (
              <div
                key={sub.id}
                onClick={() => onSelectSubmission(sub.id)}
                className={`p-5 sm:p-6 transition-colors cursor-pointer hover:bg-surface/70 ${
                  isAwaiting ? 'bg-amber-50/30' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200/60">
                        {sub.reference_number}
                      </span>
                      <TypeBadge type={sub.submission_type} />
                      <PriorityBadge priority={sub.priority} />

                      {isAwaiting && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          <AlertCircle className="w-3 h-3" />
                          Action Required
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-ink-primary hover:text-brand-700 transition-colors">
                      {sub.subject}
                    </h3>

                    <p className="text-xs text-ink-secondary line-clamp-2 leading-relaxed">
                      {sub.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(sub.created_at).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>Department: {sub.department_name}</span>
                      <span>•</span>
                      <span>Category: {sub.category_name}</span>

                      {messageCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-ink-primary font-medium">
                            <MessageSquare className="w-3.5 h-3.5 text-brand-700" />
                            {messageCount} {messageCount === 1 ? 'reply' : 'replies'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0">
                    <StatusBadge status={sub.status} />

                    {sub.resolution_date && (
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5" />
                        Resolved {new Date(sub.resolution_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
