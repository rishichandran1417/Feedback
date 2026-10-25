import {
  Department,
  Category,
  Profile,
  Submission,
  SystemSettings,
  Notification,
  EmailNotification,
} from '../types/database';

export const initialSystemSettings: SystemSettings = {
  college_info: {
    name: 'College of Engineering Trivandrum',
    code: 'CET',
    support_email: 'admin@cet.ac.in',
    portal_url: 'https://feedback.cet.ac.in',
  },
  auth_config: {
    allowed_email_domain: '@cet.ac.in',
    require_email_verification: true,
  },
  file_upload_limits: {
    max_file_size_mb: 10,
    allowed_extensions: ['.jpg', '.jpeg', '.png', '.pdf', '.docx'],
  },
  workflow_rules: {
    allow_anonymous: true,
    enable_reopening: true,
    reopen_window_days: 14,
  },
  email_provider_config: {
    provider: 'resend',
    sender_name: 'CET Grievance Redressal Cell',
    sender_email: 'notifications@cet.ac.in',
    resend_configured: true,
    enabled_events: [
      'submission_acknowledgement',
      'status_update',
      'issue_resolved',
      'issue_reopened',
      'admin_reply',
      'info_request',
    ],
    last_successful_send: '2026-10-19T14:30:00Z',
    recent_failure_count: 0,
  },
  maintenance_mode: {
    enabled: false,
    message: 'This website is currently under maintenance. We are performing scheduled updates and will be back shortly.',
    estimated_end: '',
  },
};

export const initialDepartments: Department[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    name: 'Academic Affairs',
    code: 'ACAD',
    contact_email: 'acad.rep@cet.ac.in',
    head_of_department: 'Department Representative',
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    name: 'Facilities & Campus Infrastructure',
    code: 'FACIL',
    contact_email: 'facilities.rep@cet.ac.in',
    head_of_department: 'Department Representative',
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    name: 'IT Services & Campus Network',
    code: 'IT-SYS',
    contact_email: 'it.rep@cet.ac.in',
    head_of_department: 'Department Representative',
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    name: 'Hostel & Residential Life',
    code: 'HOSTEL',
    contact_email: 'hostel.rep@cet.ac.in',
    head_of_department: 'Department Representative',
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'd5555555-5555-5555-5555-555555555555',
    name: 'Financial Aid & Student Accounts',
    code: 'FIN-AID',
    contact_email: 'accounts.rep@cet.ac.in',
    head_of_department: 'Department Representative',
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'd6666666-6666-6666-6666-666666666666',
    name: 'Examination & Records Cell',
    code: 'EXAM',
    contact_email: 'exam.rep@cet.ac.in',
    head_of_department: 'Department Representative',
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
];

export const initialCategories: Category[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Course Registration & Timetables',
    description: 'Issues with course enrollments, class conflicts, syllabus updates, or class scheduling.',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    target_resolution_days: 3,
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Classroom & Laboratory Equipment',
    description: 'Faulty AV projectors, broken laboratory apparatus, malfunctioning air conditioning.',
    department_id: 'd2222222-2222-2222-2222-222222222222',
    target_resolution_days: 2,
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Campus WiFi & LMS Access',
    description: 'Campus Wi-Fi connectivity degradation, student portal login failures, or online test access.',
    department_id: 'd3333333-3333-3333-3333-333333333333',
    target_resolution_days: 1,
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Hostel Maintenance & Mess Food',
    description: 'Hostel room repairs, plumbing/water availability, cleanliness, or cafeteria/mess dietary standards.',
    department_id: 'd4444444-4444-4444-4444-444444444444',
    target_resolution_days: 2,
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    name: 'Scholarship & Fee Disbursements',
    description: 'Tuition receipt discrepancies, delayed scholarship credit, refund processing.',
    department_id: 'd5555555-5555-5555-5555-555555555555',
    target_resolution_days: 7,
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'c6666666-6666-6666-6666-666666666666',
    name: 'Grade Discrepancies & Transcripts',
    description: 'Delays in grade cards, re-evaluation submissions, or official degree transcript requests.',
    department_id: 'd6666666-6666-6666-6666-666666666666',
    target_resolution_days: 5,
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
  },
];

export const initialProfiles: Profile[] = [];
export const initialSubmissions: Submission[] = [];
export const initialNotifications: Notification[] = [];
export const initialEmailNotifications: EmailNotification[] = [];
