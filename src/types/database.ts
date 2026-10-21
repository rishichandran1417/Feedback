// TypeScript definitions for College Feedback & Grievance Management System

export type AppRole = 'student' | 'administrator';

export type SubmissionType = 'complaint' | 'suggestion' | 'general_feedback';

export type SubmissionPriority = 'low' | 'medium' | 'high' | 'urgent';

export type SubmissionStatus = 
  | 'submitted'
  | 'pending_review'
  | 'in_progress'
  | 'awaiting_student_response'
  | 'resolved'
  | 'closed'
  | 'reopened';

export type MessageType = 'student_reply' | 'admin_reply' | 'info_request' | 'internal_note';

export type EmailEventType = 
  | 'submission_acknowledgement'
  | 'status_update'
  | 'issue_resolved'
  | 'issue_reopened'
  | 'admin_reply'
  | 'info_request';

export type EmailDeliveryStatus = 
  | 'queued'
  | 'sending'
  | 'sent_to_provider'
  | 'delivered'
  | 'failed'
  | 'bounced';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  student_id?: string;
  phone?: string;
  department?: string;
  course_programme?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  contact_email: string;
  head_of_department?: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  department_id?: string;
  target_resolution_days: number;
  is_active: boolean;
  created_at: string;
  // Joined field
  department?: Department;
}

export interface SubmissionAttachment {
  id: string;
  submission_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
}

export interface SubmissionMessage {
  id: string;
  submission_id: string;
  sender_id: string;
  sender_name?: string;
  sender_role?: AppRole;
  message_type: MessageType;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface SubmissionStatusHistory {
  id: string;
  submission_id: string;
  previous_status?: SubmissionStatus;
  new_status: SubmissionStatus;
  remarks?: string;
  changed_by: string;
  changed_by_name?: string;
  created_at: string;
}

export interface Submission {
  id: string;
  reference_number: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  submission_type: SubmissionType;
  category_id?: string;
  category_name?: string;
  department_id?: string;
  department_name?: string;
  subject: string;
  description: string;
  location?: string;
  priority: SubmissionPriority;
  is_anonymous: boolean;
  status: SubmissionStatus;
  assigned_to?: string;
  assigned_to_name?: string;
  due_date?: string;
  resolution_date?: string;
  resolution_summary?: string;
  student_remarks?: string;
  created_at: string;
  updated_at: string;
  // Related lists
  attachments?: SubmissionAttachment[];
  messages?: SubmissionMessage[];
  status_history?: SubmissionStatusHistory[];
}

export interface Notification {
  id: string;
  user_id: string;
  submission_id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  is_read: boolean;
  created_at: string;
}

export interface EmailNotification {
  id: string;
  submission_id: string;
  submission_ref?: string;
  recipient_email: string;
  event_type: EmailEventType;
  subject: string;
  body_html?: string;
  body_text?: string;
  delivery_status: EmailDeliveryStatus;
  provider_message_id?: string;
  attempt_count: number;
  last_error?: string;
  idempotency_key: string;
  created_at: string;
  sent_at?: string;
  delivered_at?: string;
}

export interface SystemSettings {
  college_info: {
    name: string;
    code: string;
    support_email: string;
    portal_url: string;
  };
  auth_config: {
    allowed_email_domain: string;
    require_email_verification: boolean;
  };
  file_upload_limits: {
    max_file_size_mb: number;
    allowed_extensions: string[];
  };
  workflow_rules: {
    allow_anonymous: boolean;
    enable_reopening: boolean;
    reopen_window_days: number;
  };
  email_provider_config: {
    provider: string;
    sender_name: string;
    sender_email: string;
    resend_configured: boolean;
    enabled_events: EmailEventType[];
    last_successful_send?: string;
    recent_failure_count?: number;
  };
}
