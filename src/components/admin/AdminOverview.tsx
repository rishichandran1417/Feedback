import React from 'react';
import { useSystem } from '../../context/SystemContext';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Timer,
  TrendingUp,
  BarChart2,
  Calendar,
  AlertOctagon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export const AdminOverview: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { submissions, categories, metrics } = useSystem();

  // Status breakdown data for Pie Chart
  const statusCounts: Record<string, number> = {};
  submissions.forEach((s) => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });

  const statusChartData = [
    { name: 'Submitted', value: statusCounts['submitted'] || 0, color: '#94a3b8' },
    { name: 'Pending Review', value: statusCounts['pending_review'] || 0, color: '#f59e0b' },
    { name: 'In Progress', value: statusCounts['in_progress'] || 0, color: '#3b82f6' },
    { name: 'Awaiting Student', value: statusCounts['awaiting_student_response'] || 0, color: '#a855f7' },
    { name: 'Resolved', value: statusCounts['resolved'] || 0, color: '#10b981' },
    { name: 'Closed', value: statusCounts['closed'] || 0, color: '#64748b' },
    { name: 'Reopened', value: statusCounts['reopened'] || 0, color: '#f43f5e' },
  ].filter((item) => item.value > 0);

  // Category breakdown data
  const categoryCounts: Record<string, number> = {};
  submissions.forEach((s) => {
    const catName = s.category_name || 'Other';
    categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
  });

  const categoryChartData = Object.entries(categoryCounts).map(([name, count]) => ({
    name: name.length > 20 ? `${name.substring(0, 18)}...` : name,
    count,
  }));

  // Timeline / Volume over time (grouped by day)
  const timelineMap: Record<string, number> = {};
  submissions.forEach((s) => {
    const dateKey = new Date(s.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
    timelineMap[dateKey] = (timelineMap[dateKey] || 0) + 1;
  });

  const timelineChartData = Object.entries(timelineMap).map(([date, count]) => ({
    date,
    submissions: count,
  }));

  return (
    <div className="space-y-8">
      {/* Overdue Warning Alert Banner if overdue complaints exist */}
      {metrics.overdue > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-rose-900">
                Action Required: {metrics.overdue} Overdue Grievance{metrics.overdue > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-rose-700 mt-0.5">
                Target SLA resolution dates have passed without resolution. Immediate departmental escalation recommended.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('admin_overdue')}
            className="text-xs font-semibold text-rose-800 hover:text-rose-900 bg-white border border-rose-200 px-3 py-1.5 rounded-lg shrink-0 shadow-2xs hover:bg-rose-100/50 transition-colors"
          >
            Review Overdue Issues &rarr;
          </button>
        </div>
      )}

      {/* KPI Cards: Calculated from Real Database Records */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-ink-secondary mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Received</span>
            <Inbox className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-ink-primary">{metrics.total}</p>
          <span className="text-[11px] text-ink-muted mt-1 block">All registered tickets</span>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-ink-secondary mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{metrics.pending}</p>
          <span className="text-[11px] text-ink-muted mt-1 block">Awaiting triage</span>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-ink-secondary mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Progress</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{metrics.inProgress}</p>
          <span className="text-[11px] text-ink-muted mt-1 block">Active handling</span>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-ink-secondary mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{metrics.resolved}</p>
          <span className="text-[11px] text-ink-muted mt-1 block">Closed / Remediated</span>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-ink-secondary mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className={`text-2xl font-bold ${metrics.overdue > 0 ? 'text-rose-600' : 'text-ink-primary'}`}>
            {metrics.overdue}
          </p>
          <span className="text-[11px] text-ink-muted mt-1 block">Passed target SLA</span>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-ink-secondary mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Resolution</span>
            <Timer className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-ink-primary">
            {metrics.avgResolutionDays} <span className="text-xs font-normal text-ink-secondary">days</span>
          </p>
          <span className="text-[11px] text-ink-muted mt-1 block">({metrics.avgResolutionHours} hrs avg)</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions by Status */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink-primary">Workflow Distribution by Status</h3>
              <p className="text-xs text-ink-secondary mt-0.5">Real-time breakdown of current ticket stages</p>
            </div>
            <BarChart2 className="w-4 h-4 text-ink-muted" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} tickets`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-border/60">
            {statusChartData.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-ink-secondary">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span>
                  {s.name}: <strong className="text-ink-primary">{s.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Complaints by Category */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink-primary">Grievances by Category</h3>
              <p className="text-xs text-ink-secondary mt-0.5">Frequency distribution across operational areas</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} grievances`, 'Volume']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#1d4ed8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Volume Over Time */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink-primary">Feedback Intake Trend Over Time</h3>
              <p className="text-xs text-ink-secondary mt-0.5">Daily submission volume</p>
            </div>
            <Calendar className="w-4 h-4 text-ink-muted" />
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} submissions`, 'Received']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="submissions"
                  stroke="#1d4ed8"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#1d4ed8' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
