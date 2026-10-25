import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { Submission } from '../../types/database';
import { StatusBadge } from '../common/StatusBadge';
import { TypeBadge } from '../common/TypeBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { exportSubmissionsToCsv, exportSubmissionsToExcel } from '../../lib/exportUtils';
import {
  Search,
  Download,
  ArrowUpDown,
  AlertTriangle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface SubmissionsTableProps {
  initialOverdueOnly?: boolean;
  initialPendingOnly?: boolean;
  onSelectSubmission: (id: string) => void;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  initialOverdueOnly = false,
  initialPendingOnly = false,
  onSelectSubmission,
}) => {
  const { submissions, categories, departments } = useSystem();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>(
    initialPendingOnly ? 'pending_review' : 'all'
  );
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [overdueOnly, setOverdueOnly] = useState<boolean>(initialOverdueOnly);

  // Pagination & Sorting
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sortField, setSortField] = useState<'created_at' | 'due_date' | 'reference_number'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const now = new Date();

  // Filter Submissions
  const filtered = submissions.filter((sub) => {
    // Search
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      sub.reference_number.toLowerCase().includes(term) ||
      sub.subject.toLowerCase().includes(term) ||
      (sub.student_email && sub.student_email.toLowerCase().includes(term)) ||
      (sub.student_name && sub.student_name.toLowerCase().includes(term));

    // Status
    const matchStatus = selectedStatus === 'all' || sub.status === selectedStatus;

    // Type
    const matchType = selectedType === 'all' || sub.submission_type === selectedType;

    // Category
    const matchCategory = selectedCategory === 'all' || sub.category_id === selectedCategory;

    // Department
    const matchDepartment = selectedDepartment === 'all' || sub.department_id === selectedDepartment;

    // Priority
    const matchPriority = selectedPriority === 'all' || sub.priority === selectedPriority;

    // Overdue filter
    const isOverdue =
      sub.status !== 'resolved' &&
      sub.status !== 'closed' &&
      sub.due_date &&
      new Date(sub.due_date) < now;

    const matchOverdue = !overdueOnly || isOverdue;

    return matchSearch && matchStatus && matchType && matchCategory && matchDepartment && matchPriority && matchOverdue;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField] || '';
    const valB = b[sortField] || '';
    if (sortOrder === 'asc') return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: 'created_at' | 'due_date' | 'reference_number') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-6">
      {/* Search & Export Toolbar */}
      <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 space-y-4 w-full min-w-0 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 min-w-0">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search reference, subject, student name, or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => exportSubmissionsToCsv(filtered)}
              title="Export filtered records to CSV"
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
              onClick={() => exportSubmissionsToExcel(filtered)}
              title="Export filtered records to Excel .xlsx"
            >
              Export Excel (.xlsx)
            </Button>
          </div>
        </div>

        {/* Multi-Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-border min-w-0">
          <div className="min-w-0">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1 truncate">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-border text-xs text-ink-primary bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 truncate"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="pending_review">Pending Review</option>
              <option value="in_progress">In Progress</option>
              <option value="awaiting_student_response">Awaiting Student</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>

          <div className="min-w-0">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1 truncate">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-border text-xs text-ink-primary bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 truncate"
            >
              <option value="all">All Types</option>
              <option value="complaint">Complaint</option>
              <option value="suggestion">Suggestion</option>
              <option value="general_feedback">General Feedback</option>
            </select>
          </div>

          <div className="min-w-0">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1 truncate">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-border text-xs text-ink-primary bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 truncate"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1 truncate">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-border text-xs text-ink-primary bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 truncate"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1 truncate">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-border text-xs text-ink-primary bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 truncate"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex items-center self-end pb-1 min-w-0">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-ink-primary select-none truncate">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => {
                  setOverdueOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-border text-rose-500 focus:ring-rose-500 h-4 w-4 shrink-0 bg-background"
              />
              <span className="text-rose-400 font-semibold flex items-center gap-1 truncate">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Overdue Only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Table Container: strictly bounded width with clean internal scroll if needed */}
      {paginated.length === 0 ? (
        <EmptyState
          title="No grievances match the active criteria"
          description="Adjust your search keywords or reset filter dropdowns."
        />
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden w-full max-w-full min-w-0">
          <div className="w-full overflow-x-auto min-w-0">
            <table className="w-full text-left border-collapse text-xs min-w-[860px]">
              <thead className="bg-background/80 border-b border-border text-ink-secondary uppercase tracking-wider font-semibold">
                <tr>
                  <th
                    className="py-3 px-3 w-[110px] min-w-[100px] cursor-pointer hover:text-ink-primary whitespace-nowrap"
                    onClick={() => toggleSort('reference_number')}
                  >
                    <div className="flex items-center gap-1">
                       <span>Ref #</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 w-[90px] min-w-[85px] cursor-pointer hover:text-ink-primary whitespace-nowrap"
                    onClick={() => toggleSort('created_at')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 w-[150px] min-w-[130px] max-w-[160px]">Student</th>
                  <th className="py-3 px-3 min-w-[180px] max-w-[240px]">Subject & Category</th>
                  <th className="py-3 px-3 w-[130px] min-w-[110px] max-w-[140px]">Department</th>
                  <th className="py-3 px-3 w-[80px] min-w-[75px] whitespace-nowrap">Priority</th>
                  <th className="py-3 px-3 w-[120px] min-w-[110px] whitespace-nowrap">Status</th>
                  <th
                    className="py-3 px-3 w-[95px] min-w-[85px] cursor-pointer hover:text-ink-primary whitespace-nowrap"
                    onClick={() => toggleSort('due_date')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Due Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 w-[55px] min-w-[50px] text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {paginated.map((sub) => {
                  const isOverdue =
                    sub.status !== 'resolved' &&
                    sub.status !== 'closed' &&
                    sub.due_date &&
                    new Date(sub.due_date) < now;

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => onSelectSubmission(sub.id)}
                      className={`hover:bg-background/60 cursor-pointer transition-colors ${
                        isOverdue ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-semibold text-brand-400 whitespace-nowrap">
                        {sub.reference_number}
                      </td>

                      <td className="py-3 px-3 text-ink-secondary whitespace-nowrap">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-3">
                        <div className="max-w-[140px]">
                          <p className="font-medium text-ink-primary truncate" title={sub.student_name}>
                            {sub.student_name}
                          </p>
                          <p className="text-[10px] text-ink-muted truncate font-mono" title={sub.student_email}>
                            {sub.student_email}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-[240px]">
                        <p className="font-semibold text-ink-primary truncate" title={sub.subject}>
                          {sub.subject}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <TypeBadge type={sub.submission_type} />
                          <span className="text-ink-muted truncate text-[11px]" title={sub.category_name}>
                            {sub.category_name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-[130px]">
                        <p className="text-ink-secondary truncate" title={sub.department_name || 'Unassigned'}>
                          {sub.department_name || 'Unassigned'}
                        </p>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <PriorityBadge priority={sub.priority} />
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={sub.status} size="sm" />
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {sub.due_date ? (
                          <div className={isOverdue ? 'text-rose-400 font-semibold flex items-center gap-1' : 'text-ink-secondary'}>
                            {isOverdue && <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />}
                            <span>{new Date(sub.due_date).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-ink-muted">--</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSubmission(sub.id);
                          }}
                          className="p-1.5 text-brand-400 hover:bg-brand-950/60 rounded-md transition-colors cursor-pointer"
                          title="Manage Submission"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-ink-secondary bg-surface">
            <div>
              Showing <strong className="text-ink-primary">{(page - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-ink-primary">{Math.min(page * pageSize, sorted.length)}</strong> of{' '}
              <strong className="text-ink-primary">{sorted.length}</strong> entries
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium text-ink-primary">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
