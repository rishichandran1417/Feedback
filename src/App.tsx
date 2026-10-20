import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';

// Layouts
import { StudentLayout } from './components/layout/StudentLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Auth Pages
import { StudentLoginPage } from './components/auth/StudentLoginPage';
import { StudentRegisterPage } from './components/auth/StudentRegisterPage';
import { AdminLoginPage } from './components/auth/AdminLoginPage';
import { AuthCallback } from './components/auth/AuthCallback';

// Student Pages
import { StudentDashboard } from './components/student/StudentDashboard';
import { SubmitFeedbackForm } from './components/student/SubmitFeedbackForm';
import { MySubmissions } from './components/student/MySubmissions';
import { SubmissionDetailModal } from './components/student/SubmissionDetailModal';
import { StudentProfileAndHelp } from './components/student/StudentProfileAndHelp';
import { StudentNotificationsView } from './components/student/StudentNotificationsView';

// Administrator Pages
import { AdminOverview } from './components/admin/AdminOverview';
import { SubmissionsTable } from './components/admin/SubmissionsTable';
import { SubmissionAdminDrawer } from './components/admin/SubmissionAdminDrawer';
import { CategoryManagement } from './components/admin/CategoryManagement';
import { DepartmentManagement } from './components/admin/DepartmentManagement';
import { UserManagement } from './components/admin/UserManagement';
import { ReportsAndExports } from './components/admin/ReportsAndExports';
import { EmailSettingsAndOutbox } from './components/admin/EmailSettingsAndOutbox';
import { SystemSettingsView } from './components/admin/SystemSettingsView';

// Loading Screen
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-3">
      <div className="w-8 h-8 border-2 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs text-ink-secondary">Verifying secure academic credentials...</p>
    </div>
  </div>
);

// Student Route (Direct open access)
const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Administrator Route (Authentication bypassed for direct open access)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Student Portal Container
const StudentPortal: React.FC<{
  view: 'dashboard' | 'submit' | 'submissions' | 'notifications' | 'profile';
}> = ({ view }) => {
  const navigate = useNavigate();
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  const getMeta = () => {
    switch (view) {
      case 'dashboard':
        return {
          title: 'Student Redressal Dashboard',
          description: 'Overview of your submitted grievances and recent updates.',
        };
      case 'submit':
        return {
          title: 'Submit College Feedback or Grievance',
          description: 'Complete the standardized form below to register a formal ticket.',
        };
      case 'submissions':
        return {
          title: 'My Submissions',
          description: 'Search, filter, and track all your feedback tickets.',
        };
      case 'notifications':
        return {
          title: 'Notifications & Administrative Messages',
          description: 'Recent status changes, remarks, and information requests.',
        };
      case 'profile':
        return {
          title: 'Student Profile & College Policy',
          description: 'Verified student identity, redressal guidelines, and escalation directory.',
        };
    }
  };

  const meta = getMeta();

  return (
    <StudentLayout pageTitle={meta.title} pageDescription={meta.description}>
      {view === 'dashboard' && (
        <StudentDashboard
          onNavigate={(path) => {
            if (path === 'submit') navigate('/submit-feedback');
            else if (path === 'submissions') navigate('/my-submissions');
            else if (path === 'notifications') navigate('/notifications');
            else if (path === 'profile') navigate('/profile');
            else navigate('/');
          }}
          onSelectSubmission={(id) => setSelectedSubId(id)}
        />
      )}

      {view === 'submit' && (
        <SubmitFeedbackForm
          onSuccess={(newId) => {
            navigate('/my-submissions');
            setSelectedSubId(newId);
          }}
          onCancel={() => navigate('/')}
        />
      )}

      {view === 'submissions' && (
        <MySubmissions
          onSelectSubmission={(id) => setSelectedSubId(id)}
          onNewSubmission={() => navigate('/submit-feedback')}
        />
      )}

      {view === 'notifications' && (
        <StudentNotificationsView onSelectSubmission={(id) => setSelectedSubId(id)} />
      )}

      {view === 'profile' && <StudentProfileAndHelp />}

      {/* Detail Modal for Selected Submission */}
      {selectedSubId && (
        <SubmissionDetailModal
          submissionId={selectedSubId}
          onClose={() => setSelectedSubId(null)}
        />
      )}
    </StudentLayout>
  );
};

// Administrator Portal Container
const AdminPortal: React.FC<{
  view:
    | 'dashboard'
    | 'submissions'
    | 'pending'
    | 'overdue'
    | 'categories'
    | 'departments'
    | 'users'
    | 'reports'
    | 'email-settings'
    | 'settings';
}> = ({ view }) => {
  const navigate = useNavigate();
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  const getMeta = () => {
    switch (view) {
      case 'dashboard':
        return {
          title: 'Grievance Central Overview',
          description: 'Institutional KPIs, resolution throughput, and operational metrics.',
        };
      case 'submissions':
        return {
          title: 'All Submissions Master Registry',
          description: 'Searchable, filterable, and exportable database of all feedback records.',
        };
      case 'pending':
        return {
          title: 'Pending Review & Triage',
          description: 'Incoming student grievances requiring departmental assignment.',
        };
      case 'overdue':
        return {
          title: 'Overdue Grievance Escalations',
          description: 'Active tickets exceeding targeted SLA resolution windows.',
        };
      case 'categories':
        return {
          title: 'Category Master & SLA Targets',
          description: 'Manage grievance categories and target turnaround days.',
        };
      case 'departments':
        return {
          title: 'Campus Departments',
          description: 'Routing departments, coordinators, and escalation emails.',
        };
      case 'users':
        return {
          title: 'User Accounts & Roles',
          description: 'Student accounts and verified administration staff.',
        };
      case 'reports':
        return {
          title: 'Reports & Spreadsheet Exports',
          description: 'Export customized datasets to CSV or Excel (.xlsx).',
        };
      case 'email-settings':
        return {
          title: 'Automated Email Notification Hub',
          description: 'Resend provider configuration, active triggers, and transactional outbox logs.',
        };
      case 'settings':
        return {
          title: 'System Settings & Security Policies',
          description: 'Enforced email domain, attachment limits, and workflow parameters.',
        };
    }
  };

  const meta = getMeta();

  return (
    <AdminLayout pageTitle={meta.title} pageDescription={meta.description}>
      {view === 'dashboard' && (
        <AdminOverview
          onNavigate={(target) => {
            if (target === 'admin_overdue') navigate('/admin/overdue');
            else if (target === 'admin_submissions') navigate('/admin/submissions');
            else if (target === 'admin_pending') navigate('/admin/pending');
            else navigate('/admin/dashboard');
          }}
        />
      )}

      {view === 'submissions' && (
        <SubmissionsTable onSelectSubmission={(id) => setSelectedSubId(id)} />
      )}

      {view === 'pending' && (
        <SubmissionsTable
          initialPendingOnly={true}
          onSelectSubmission={(id) => setSelectedSubId(id)}
        />
      )}

      {view === 'overdue' && (
        <SubmissionsTable
          initialOverdueOnly={true}
          onSelectSubmission={(id) => setSelectedSubId(id)}
        />
      )}

      {view === 'categories' && <CategoryManagement />}
      {view === 'departments' && <DepartmentManagement />}
      {view === 'users' && <UserManagement />}
      {view === 'reports' && <ReportsAndExports />}
      {view === 'email-settings' && <EmailSettingsAndOutbox />}
      {view === 'settings' && <SystemSettingsView />}

      {/* Administrator Action Drawer */}
      {selectedSubId && (
        <SubmissionAdminDrawer
          submissionId={selectedSubId}
          onClose={() => setSelectedSubId(null)}
        />
      )}
    </AdminLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SystemProvider>
        <BrowserRouter>
          <Routes>
            {/* OAuth Callback Route */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Unauthenticated Auth Routes */}
            {/* Admin Routes - Direct access without login */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Protected Student Routes */}
            <Route
              path="/"
              element={
                <StudentRoute>
                  <StudentPortal view="dashboard" />
                </StudentRoute>
              }
            />
            <Route
              path="/submit-feedback"
              element={
                <StudentRoute>
                  <StudentPortal view="submit" />
                </StudentRoute>
              }
            />
            <Route
              path="/my-submissions"
              element={
                <StudentRoute>
                  <StudentPortal view="submissions" />
                </StudentRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <StudentRoute>
                  <StudentPortal view="notifications" />
                </StudentRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <StudentRoute>
                  <StudentPortal view="profile" />
                </StudentRoute>
              }
            />

            {/* Protected Administrator Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminPortal view="dashboard" />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/submissions"
              element={
                <AdminRoute>
                  <AdminPortal view="submissions" />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/pending"
              element={
                <AdminRoute>
                  <AdminPortal view="pending" />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/overdue"
              element={
                <AdminRoute>
                  <AdminPortal view="overdue" />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <AdminRoute>
                  <AdminPortal view="categories" />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/departments"
              element={
                <AdminRoute>
                  <AdminPortal view="departments" />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminPortal view="users" />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <AdminPortal view="reports" />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/email-settings"
              element={
                <AdminRoute>
                  <AdminPortal view="email-settings" />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminPortal view="settings" />
                </AdminRoute>
              }
            />

            {/* Fallbacks */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SystemProvider>
    </AuthProvider>
  );
}
