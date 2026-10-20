import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { exportSubmissionsToCsv, exportSubmissionsToExcel, formatDurationHours } from '../../lib/exportUtils';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import { TypeBadge } from '../common/TypeBadge';
import {
  FileSpreadsheet,
  Download,
  Filter,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export const ReportsAndExports: React.FC = () => {
  const { submissions, categories, departments, metrics } = useSystem();

  const [dateRange, setDateRange] = useState<'30' | '90' | '365' | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const now = new Date();

  // Apply Filters
  const filtered = submissions.filter((s) => {
    // Date Range
    if (dateRange !== 'all') {
      const days = parseInt(dateRange, 10);
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      if (new Date(s.created_at) < cutoff) return false;
    }

    if (selectedType !== 'all' && s.submission_type !== selectedType) return false;
    if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
    if (selectedDept !== 'all' && s.department_id !== selectedDept) return false;

    return true;
  });

  // Analytics for filtered dataset
  const resolvedList = filtered.filter((s) => s.resolution_date && (s.status === 'resolved' || s.status === 'closed'));
  let avgResolutionHours = 0;
  if (resolvedList.length > 0) {
    const totalMillis = resolvedList.reduce((acc, curr) => {
      const start = new Date(curr.created_at).getTime();
      const end = new Date(curr.resolution_date!).getTime();
      return acc + (end - start);
    }, 0);
    avgResolutionHours = Math.round(totalMillis / (resolvedList.length * 1000 * 3600));
  }

  const overdueList = filtered.filter((s) => {
    if (s.status === 'resolved' || s.status === 'closed') return false;
    if (!s.due_date) return false;
    return new Date(s.due_date) < now;
  });

  const handleExportCsv = () => {
    exportSubmissionsToCsv(filtered, `college_grievance_report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportExcel = () => {
    exportSubmissionsToExcel(filtered, `college_grievance_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-8">
      {/* Filters & Export Actions Card */}
      <div className="bg-white border border-border rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-ink-primary">Audit Reports & Data Export</h3>
            <p className="text-xs text-ink-secondary mt-0.5">
              Generate official committee summaries and download sanitized datasets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportCsv}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
              onClick={handleExportExcel}
            >
              Export Excel (.xlsx)
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Reporting Period
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-border text-xs text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">Entire Academic Year</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days (Quarter)</option>
              <option value="365">Past 12 Months</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Submission Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border text-xs text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Feedback Types</option>
              <option value="complaint">Complaints Only</option>
              <option value="suggestion">Suggestions Only</option>
              <option value="general_feedback">General Feedback</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border text-xs text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Status Filter
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border text-xs text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="resolved">Resolved / Closed</option>
              <option value="in_progress">In Progress</option>
              <option value="pending_review">Pending Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analysis Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-border rounded-xl p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary block mb-1">
            Matching Records
          </span>
          <p className="text-2xl font-bold text-ink-primary">{filtered.length}</p>
          <span className="text-xs text-ink-muted mt-1 block">Included in export</span>
        </div>

        <div className="bg-white border border-border rounded-xl p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary block mb-1">
            Resolved Issues
          </span>
          <p className="text-2xl font-bold text-emerald-600">{resolvedList.length}</p>
          <span className="text-xs text-ink-muted mt-1 block">
            {filtered.length > 0 ? `${Math.round((resolvedList.length / filtered.length) * 100)}% resolution rate` : 'N/A'}
          </span>
        </div>

        <div className="bg-white border border-border rounded-xl p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary block mb-1">
            Overdue Issues
          </span>
          <p className={`text-2xl font-bold ${overdueList.length > 0 ? 'text-rose-600' : 'text-ink-primary'}`}>
            {overdueList.length}
          </p>
          <span className="text-xs text-ink-muted mt-1 block">Target date elapsed</span>
        </div>

        <div className="bg-white border border-border rounded-xl p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary block mb-1">
            Avg Turnaround
          </span>
          <p className="text-2xl font-bold text-ink-primary">
            {(avgResolutionHours / 24).toFixed(1)} <span className="text-xs font-normal text-ink-muted">days</span>
          </p>
          <span className="text-xs text-ink-muted mt-1 block">({avgResolutionHours} hrs avg)</span>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border bg-surface/40 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-primary">
            Export Preview Dataset ({filtered.length} rows)
          </span>
          <span className="text-[11px] text-ink-muted">Formula injection sanitization active</span>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-surface sticky top-0 border-b border-border text-ink-secondary uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-4">Ref #</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Resolution Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-surface/50">
                  <td className="py-2.5 px-4 font-mono font-semibold text-brand-700">{s.reference_number}</td>
                  <td className="py-2.5 px-4 text-ink-secondary">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="py-2.5 px-4"><TypeBadge type={s.submission_type} /></td>
                  <td className="py-2.5 px-4 font-medium text-ink-primary">{s.category_name}</td>
                  <td className="py-2.5 px-4 text-ink-secondary">{s.department_name}</td>
                  <td className="py-2.5 px-4"><StatusBadge status={s.status} size="sm" /></td>
                  <td className="py-2.5 px-4 font-mono text-ink-secondary">
                    {formatDurationHours(s.created_at, s.resolution_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
