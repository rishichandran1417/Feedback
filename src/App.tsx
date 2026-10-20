import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import { Layout } from './components/layout/Layout';
import { LoginView } from './components/auth/LoginView';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { SubmitFeedbackForm } from './components/student/SubmitFeedbackForm';
import { MySubmissions } from './components/student/MySubmissions';
import { SubmissionDetailModal } from './components/student/SubmissionDetailModal';
import { StudentProfileAndHelp } from './components/student/StudentProfileAndHelp';
import { StudentNotificationsView } from './components/student/StudentNotificationsView';

// Administrator Components
import { AdminOverview } from './components/admin/AdminOverview';
import { SubmissionsTable } from './components/admin/SubmissionsTable';
import { SubmissionAdminDrawer } from './components/admin/SubmissionAdminDrawer';
import { CategoryManagement } from './components/admin/CategoryManagement';
import { DepartmentManagement } from './components/admin/DepartmentManagement';
import { UserManagement } from './components/admin/UserManagement';
import { ReportsAndExports } from './components/admin/ReportsAndExports';
import { EmailSettingsAndOutbox } from './components/admin/EmailSettingsAndOutbox';
import { SystemSettingsView } from './components/admin/SystemSettingsView';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-ink-secondary">Authenticating secure session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView onSuccess={() => setActiveTab('dashboard')} />;
  }

  // Adjust activeTab if role changes
  const isStudent = user.role === 'student';

  const getPageMeta = () => {
    switch (activeTab) {
      // Student views
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

      // Admin views
      case 'admin_overview':
        return {
          title: 'Grievance Central Overview',
          description: 'Institutional KPIs, resolution throughput, and operational metrics.',
        };
      case 'admin_submissions':
        return {
          title: 'All Submissions Master Registry',
          description: 'Searchable, filterable, and exportable database of all feedback records.',
        };
      case 'admin_pending':
        return {
          title: 'Pending Review & Triage',
          description: 'Incoming student grievances requiring departmental assignment.',
        };
      case 'admin_overdue':
        return {
          title: 'Overdue Grievance Escalations',
          description: 'Active tickets exceeding targeted SLA resolution windows.',
        };
      case 'admin_categories':
        return {
          title: 'Category Master & SLA Targets',
          description: 'Manage grievance categories and target turnaround days.',
        };
      case 'admin_departments':
        return {
          title: 'Campus Departments',
          description: 'Routing departments, coordinators, and escalation emails.',
        };
      case 'admin_users':
        return {
          title: 'User Accounts & Roles',
          description: 'Student accounts and verified administration staff.',
        };
      case 'admin_reports':
        return {
          title: 'Reports & Spreadsheet Exports',
          description: 'Export customized datasets to CSV or Excel (.xlsx).',
        };
      case 'admin_email_settings':
        return {
          title: 'Automated Email Notification Hub',
          description: 'Resend provider configuration, active triggers, and transactional outbox logs.',
        };
      case 'admin_settings':
        return {
          title: 'System Settings & Security Policies',
          description: 'Enforced email domain, attachment limits, and workflow parameters.',
        };

      default:
        return { title: 'Feedback & Grievance Portal' };
    }
  };

  const meta = getPageMeta();

  return (
    <Layout
      activeTab={activeTab}
      onNavigate={(tab) => {
        setActiveTab(tab);
        setSelectedSubmissionId(null);
      }}
      pageTitle={meta.title}
      pageDescription={meta.description}
    >
      {/* Student Screens */}
      {isStudent && (
        <>
          {activeTab === 'dashboard' && (
            <StudentDashboard
              onNavigate={setActiveTab}
              onSelectSubmission={(id) => setSelectedSubmissionId(id)}
            />
          )}

          {activeTab === 'submit' && (
            <SubmitFeedbackForm
              onSuccess={(newId) => {
                setActiveTab('submissions');
                setSelectedSubmissionId(newId);
              }}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'submissions' && (
            <MySubmissions
              onSelectSubmission={(id) => setSelectedSubmissionId(id)}
              onNewSubmission={() => setActiveTab('submit')}
            />
          )}

          {activeTab === 'notifications' && (
            <StudentNotificationsView
              onSelectSubmission={(id) => setSelectedSubmissionId(id)}
            />
          )}

          {activeTab === 'profile' && <StudentProfileAndHelp />}

          {/* Student Detail Modal */}
          {selectedSubmissionId && (
            <SubmissionDetailModal
              submissionId={selectedSubmissionId}
              onClose={() => setSelectedSubmissionId(null)}
            />
          )}
        </>
      )}

      {/* Administrator Screens */}
      {!isStudent && (
        <>
          {activeTab === 'admin_overview' && (
            <AdminOverview onNavigate={setActiveTab} />
          )}

          {activeTab === 'admin_submissions' && (
            <SubmissionsTable
              onSelectSubmission={(id) => setSelectedSubmissionId(id)}
            />
          )}

          {activeTab === 'admin_pending' && (
            <SubmissionsTable
              initialPendingOnly={true}
              onSelectSubmission={(id) => setSelectedSubmissionId(id)}
            />
          )}

          {activeTab === 'admin_overdue' && (
            <SubmissionsTable
              initialOverdueOnly={true}
              onSelectSubmission={(id) => setSelectedSubmissionId(id)}
            />
          )}

          {activeTab === 'admin_categories' && <CategoryManagement />}

          {activeTab === 'admin_departments' && <DepartmentManagement />}

          {activeTab === 'admin_users' && <UserManagement />}

          {activeTab === 'admin_reports' && <ReportsAndExports />}

          {activeTab === 'admin_email_settings' && <EmailSettingsAndOutbox />}

          {activeTab === 'admin_settings' && <SystemSettingsView />}

          {/* Administrator Drawer */}
          {selectedSubmissionId && (
            <SubmissionAdminDrawer
              submissionId={selectedSubmissionId}
              onClose={() => setSelectedSubmissionId(null)}
            />
          )}
        </>
      )}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SystemProvider>
        <MainApp />
      </SystemProvider>
    </AuthProvider>
  );
}
