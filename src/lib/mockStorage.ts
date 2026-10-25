// Mock Storage & Engine with RLS Simulation, Audit Trail, and Transactional Email Queue

import {
  Submission,
  Category,
  Department,
  Profile,
  SubmissionStatus,
  SubmissionStatusHistory,
  SubmissionMessage,
  Notification,
  EmailNotification,
  SystemSettings,
  AppRole,
} from '../types/database';
import {
  initialCategories,
  initialDepartments,
  initialProfiles,
  initialSubmissions,
  initialNotifications,
  initialEmailNotifications,
  initialSystemSettings,
} from './mockData';

const STORAGE_KEYS = {
  SUBMISSIONS: 'ait_submissions_v1',
  CATEGORIES: 'ait_categories_v1',
  DEPARTMENTS: 'ait_departments_v1',
  PROFILES: 'ait_profiles_v1',
  USER_ROLES: 'ait_user_roles_v1',
  NOTIFICATIONS: 'ait_notifications_v1',
  EMAIL_NOTIFS: 'ait_email_notifications_v1',
  SETTINGS: 'ait_settings_v1',
};

// Initialize default storage data
function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

export const MockStorage = {
  init() {
    // Purge legacy mock profiles and mock submissions if present in localStorage
    const profiles = getStored<Profile[]>(STORAGE_KEYS.PROFILES, []);
    const cleanProfiles = profiles.filter(
      (p) =>
        p &&
        p.id !== 'u-student-01' &&
        p.id !== 'u-student-02' &&
        p.id !== 'u-admin-01' &&
        !p.email?.includes('arjun.patel') &&
        !p.email?.includes('priya.sharma') &&
        !p.email?.includes('arthur.vance')
    );
    setStored(STORAGE_KEYS.PROFILES, cleanProfiles);

    const subs = getStored<Submission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    const cleanSubs = subs.filter(
      (s) =>
        s &&
        s.student_id !== 'u-student-01' &&
        s.student_id !== 'u-student-02' &&
        s.student_name !== 'Arjun Patel' &&
        s.student_name !== 'Priya Sharma'
    );
    setStored(STORAGE_KEYS.SUBMISSIONS, cleanSubs);

    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      setStored(STORAGE_KEYS.CATEGORIES, initialCategories);
    }
    const storedDepts = getStored<Department[]>(STORAGE_KEYS.DEPARTMENTS, []);
    const hasFacultyDepts =
      !localStorage.getItem(STORAGE_KEYS.DEPARTMENTS) ||
      storedDepts.some(
        (d) =>
          d.head_of_department?.includes('Dr.') ||
          d.head_of_department?.includes('Prof.') ||
          d.head_of_department?.includes('Eng.') ||
          d.head_of_department?.includes('Officer') ||
          d.head_of_department?.includes('Bursar') ||
          d.head_of_department?.includes('Vance') ||
          d.head_of_department?.includes('Wright') ||
          d.head_of_department?.includes('Brody') ||
          d.head_of_department?.includes('Menon') ||
          d.head_of_department?.includes('Sterling') ||
          d.head_of_department?.includes('Lin') ||
          d.contact_email?.includes('dean') ||
          d.contact_email?.includes('estate') ||
          d.contact_email?.includes('coe') ||
          d.contact_email?.includes('warden')
      );
    if (hasFacultyDepts) {
      setStored(STORAGE_KEYS.DEPARTMENTS, initialDepartments);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      setStored(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EMAIL_NOTIFS)) {
      setStored(STORAGE_KEYS.EMAIL_NOTIFS, initialEmailNotifications);
    }
    const currentSettings = getStored<SystemSettings | null>(STORAGE_KEYS.SETTINGS, null);
    if (!currentSettings || currentSettings.college_info?.name?.includes('Apex') || currentSettings.college_info?.name === 'CET') {
      setStored(STORAGE_KEYS.SETTINGS, initialSystemSettings);
    } else if (currentSettings.college_info && currentSettings.college_info.name !== 'College of Engineering Trivandrum') {
      currentSettings.college_info.name = 'College of Engineering Trivandrum';
      currentSettings.college_info.code = 'CET';
      currentSettings.college_info.support_email = 'admin@cet.ac.in';
      currentSettings.college_info.portal_url = 'https://feedback.cet.ac.in';
      if (currentSettings.auth_config) {
        currentSettings.auth_config.allowed_email_domain = '@cet.ac.in';
      }
      setStored(STORAGE_KEYS.SETTINGS, currentSettings);
    }
  },

  // Submissions with RLS enforcement
  getSubmissions(role: AppRole, userId: string): Submission[] {
    this.init();
    const subs: Submission[] = getStored(STORAGE_KEYS.SUBMISSIONS, initialSubmissions);
    if (role === 'administrator') {
      return subs;
    }
    // Student RLS: Only see own submissions
    return subs.filter((s) => s.student_id === userId);
  },

  getSubmissionById(id: string, role: AppRole, userId: string): Submission | null {
    this.init();
    const subs: Submission[] = getStored(STORAGE_KEYS.SUBMISSIONS, initialSubmissions);
    const sub = subs.find((s) => s.id === id);
    if (!sub) return null;

    // RLS Enforcement: Student cannot view another student's submission
    if (role === 'student' && sub.student_id !== userId) {
      throw new Error('Access denied: You are not authorized to view this grievance.');
    }

    // Security Filter: Strip out internal notes for students
    if (role === 'student' && sub.messages) {
      return {
        ...sub,
        messages: sub.messages.filter((m) => !m.is_internal),
      };
    }

    return sub;
  },

  createSubmission(
    payload: {
      student_id: string;
      student_name: string;
      student_email: string;
      submission_type: Submission['submission_type'];
      category_id?: string;
      subject: string;
      description: string;
      location?: string;
      priority: Submission['priority'];
      is_anonymous?: boolean;
      attachments?: { file_name: string; file_size: number; file_type: string; storage_path: string }[];
    }
  ): Submission {
    this.init();
    const subs = getStored<Submission[]>(STORAGE_KEYS.SUBMISSIONS, initialSubmissions);
    const categories = this.getCategories();
    const departments = this.getDepartments();

    const cat = payload.category_id ? categories.find((c) => c.id === payload.category_id) : (categories[0] || null);
    const dept = departments.find((d) => d.id === cat?.department_id);

    // Generate unique reference number: FB-YYYY-XXXX
    const nextNum = 1000 + subs.length + 1;
    const ref = `FB-${new Date().getFullYear()}-${nextNum}`;
    const newId = `sub-${Date.now()}`;
    const nowIso = new Date().toISOString();

    // Calculate due date based on category target resolution days
    const targetDays = cat?.target_resolution_days || 5;
    const dueDate = new Date(Date.now() + targetDays * 24 * 60 * 60 * 1000).toISOString();

    const initialHistory: SubmissionStatusHistory = {
      id: `sh-${Date.now()}`,
      submission_id: newId,
      new_status: 'submitted',
      remarks: 'Initial submission recorded via student portal.',
      changed_by: payload.student_id,
      changed_by_name: payload.student_name,
      created_at: nowIso,
    };

    const newSub: Submission = {
      id: newId,
      reference_number: ref,
      student_id: payload.student_id,
      student_name: payload.student_name,
      student_email: payload.student_email,
      submission_type: payload.submission_type,
      category_id: payload.category_id || cat?.id || '',
      category_name: cat?.name || 'General Category',
      department_id: cat?.department_id,
      department_name: dept?.name || 'College Office',
      subject: payload.subject,
      description: payload.description,
      location: payload.location,
      priority: payload.priority,
      is_anonymous: payload.is_anonymous ?? false,
      status: 'submitted',
      due_date: dueDate,
      created_at: nowIso,
      updated_at: nowIso,
      attachments: (payload.attachments || []).map((att, idx) => ({
        id: `att-${Date.now()}-${idx}`,
        submission_id: newId,
        file_name: att.file_name,
        file_size: att.file_size,
        file_type: att.file_type,
        storage_path: att.storage_path,
        uploaded_by: payload.student_id,
        created_at: nowIso,
      })),
      messages: [],
      status_history: [initialHistory],
    };

    subs.unshift(newSub);
    setStored(STORAGE_KEYS.SUBMISSIONS, subs);

    // Queue Transactional Acknowledgement Email
    this.enqueueEmail({
      submission_id: newId,
      submission_ref: ref,
      recipient_email: payload.student_email,
      event_type: 'submission_acknowledgement',
      subject: `[CET] Submission Received – ${ref}`,
      body_text: `Your ${payload.submission_type} (${ref}) has been received.`,
    });

    // In-app notification
    this.addNotification({
      user_id: payload.student_id,
      submission_id: newId,
      title: `Submission Received: ${ref}`,
      message: `Your feedback has been logged and assigned reference ${ref}.`,
      type: 'success',
    });

    return newSub;
  },

  updateSubmissionStatus(
    submissionId: string,
    newStatus: SubmissionStatus,
    adminUser: { id: string; name: string },
    remarks?: string,
    resolutionSummary?: string
  ): Submission {
    this.init();
    const subs = getStored<Submission[]>(STORAGE_KEYS.SUBMISSIONS, initialSubmissions);
    const subIndex = subs.findIndex((s) => s.id === submissionId);
    if (subIndex === -1) {
      return {
        id: submissionId,
        reference_number: `FB-${submissionId.slice(0, 8)}`,
        status: newStatus,
        updated_at: new Date().toISOString(),
      } as any;
    }

    const sub = subs[subIndex];
    const prevStatus = sub.status;

    if (newStatus === 'resolved' && !resolutionSummary?.trim()) {
      throw new Error('A detailed resolution summary is required before resolving a grievance.');
    }

    const nowIso = new Date().toISOString();
    const historyItem: SubmissionStatusHistory = {
      id: `sh-${Date.now()}`,
      submission_id: submissionId,
      previous_status: prevStatus,
      new_status: newStatus,
      remarks: remarks || `Status transitioned to ${newStatus.replace('_', ' ')}`,
      changed_by: adminUser.id,
      changed_by_name: adminUser.name,
      created_at: nowIso,
    };

    sub.status = newStatus;
    sub.updated_at = nowIso;
    sub.status_history = sub.status_history || [];
    sub.status_history.push(historyItem);

    if (remarks) {
      sub.student_remarks = remarks;
    }

    if (newStatus === 'resolved') {
      sub.resolution_date = nowIso;
      sub.resolution_summary = resolutionSummary;
    } else if (newStatus === 'reopened') {
      sub.resolution_date = undefined;
    }

    subs[subIndex] = sub;
    setStored(STORAGE_KEYS.SUBMISSIONS, subs);

    // Determine email notification event
    let eventType: EmailNotification['event_type'] = 'status_update';
    let subject = `[CET] Status Updated – ${sub.reference_number}`;

    if (newStatus === 'resolved') {
      eventType = 'issue_resolved';
      subject = `[CET] Your Issue Has Been Resolved – ${sub.reference_number}`;
    } else if (newStatus === 'reopened') {
      eventType = 'issue_reopened';
      subject = `[CET] Issue Reopened – ${sub.reference_number}`;
    }

    if (sub.student_email) {
      this.enqueueEmail({
        submission_id: sub.id,
        submission_ref: sub.reference_number,
        recipient_email: sub.student_email,
        event_type: eventType,
        subject,
        body_text: `Status changed from ${prevStatus} to ${newStatus}. Remarks: ${remarks || 'None'}`,
      });
    }

    this.addNotification({
      user_id: sub.student_id,
      submission_id: sub.id,
      title: `Status Updated: ${sub.reference_number}`,
      message: `Your grievance is now '${newStatus.replace(/_/g, ' ')}'.`,
      type: newStatus === 'resolved' ? 'success' : 'info',
    });

    return sub;
  },

  assignSubmission(
    submissionId: string,
    departmentId: string,
    assignedAdminId: string,
    adminUser: { id: string; name: string }
  ): Submission {
    this.init();
    const subs = getStored<Submission[]>(STORAGE_KEYS.SUBMISSIONS, initialSubmissions);
    const subIndex = subs.findIndex((s) => s.id === submissionId);
    if (subIndex === -1) {
      return {
        id: submissionId,
        department_id: departmentId,
        assigned_to: assignedAdminId,
      } as any;
    }

    const sub = subs[subIndex];
    const departments = this.getDepartments();
    const profiles = this.getProfiles();

    const dept = departments.find((d) => d.id === departmentId);
    const admin = profiles.find((p) => p.id === assignedAdminId);

    sub.department_id = departmentId;
    sub.department_name = dept?.name || sub.department_name;
    sub.assigned_to = assignedAdminId;
    sub.assigned_to_name = admin?.full_name || 'Department Representative';
    sub.updated_at = new Date().toISOString();

    subs[subIndex] = sub;
    setStored(STORAGE_KEYS.SUBMISSIONS, subs);
    return sub;
  },

  setDueDate(submissionId: string, dueDateIso: string): Submission {
    this.init();
    const subs = getStored<Submission[]>(STORAGE_KEYS.SUBMISSIONS, initialSubmissions);
    const subIndex = subs.findIndex((s) => s.id === submissionId);
    if (subIndex === -1) {
      return {
        id: submissionId,
        due_date: dueDateIso,
      } as any;
    }

    subs[subIndex].due_date = dueDateIso;
    subs[subIndex].updated_at = new Date().toISOString();
    setStored(STORAGE_KEYS.SUBMISSIONS, subs);
    return subs[subIndex];
  },

  addMessage(
    submissionId: string,
    content: string,
    messageType: SubmissionMessage['message_type'],
    isInternal: boolean,
    user: { id: string; name: string; role: AppRole }
  ): SubmissionMessage {
    this.init();
    const subs = getStored<Submission[]>(STORAGE_KEYS.SUBMISSIONS, initialSubmissions);
    const subIndex = subs.findIndex((s) => s.id === submissionId);
    if (subIndex === -1) {
      return {
        id: `msg-${Date.now()}`,
        submission_id: submissionId,
        sender_id: user.id,
        sender_name: user.name,
        sender_role: user.role,
        message_type: messageType,
        content,
        is_internal: isInternal,
        created_at: new Date().toISOString(),
      } as any;
    }

    const sub = subs[subIndex];

    // Security: Student cannot create internal notes
    if (user.role === 'student' && isInternal) {
      throw new Error('Unauthorized action.');
    }

    const newMessage: SubmissionMessage = {
      id: `msg-${Date.now()}`,
      submission_id: submissionId,
      sender_id: user.id,
      sender_name: user.name,
      sender_role: user.role,
      message_type: messageType,
      content,
      is_internal: isInternal,
      created_at: new Date().toISOString(),
    };

    sub.messages = sub.messages || [];
    sub.messages.push(newMessage);
    sub.updated_at = new Date().toISOString();

    // If student replied, transition status if awaiting response
    if (user.role === 'student' && sub.status === 'awaiting_student_response') {
      sub.status = 'in_progress';
      sub.status_history?.push({
        id: `sh-${Date.now()}`,
        submission_id: submissionId,
        previous_status: 'awaiting_student_response',
        new_status: 'in_progress',
        remarks: 'Student submitted requested clarification.',
        changed_by: user.id,
        changed_by_name: user.name,
        created_at: new Date().toISOString(),
      });
    }

    subs[subIndex] = sub;
    setStored(STORAGE_KEYS.SUBMISSIONS, subs);

    // Email notification if admin posted a non-internal message
    if (user.role === 'administrator' && !isInternal && sub.student_email) {
      const isInfoReq = messageType === 'info_request';
      this.enqueueEmail({
        submission_id: sub.id,
        submission_ref: sub.reference_number,
        recipient_email: sub.student_email,
        event_type: isInfoReq ? 'info_request' : 'admin_reply',
        subject: `[CET] ${isInfoReq ? 'Information Requested' : 'Administrator Reply'} – ${sub.reference_number}`,
        body_text: content,
      });

      this.addNotification({
        user_id: sub.student_id,
        submission_id: sub.id,
        title: isInfoReq ? `Information Required: ${sub.reference_number}` : `New Reply: ${sub.reference_number}`,
        message: content.length > 80 ? `${content.substring(0, 80)}...` : content,
        type: isInfoReq ? 'warning' : 'info',
      });
    }

    return newMessage;
  },

  // Categories
  getCategories(): Category[] {
    this.init();
    const cats: Category[] = getStored(STORAGE_KEYS.CATEGORIES, initialCategories);
    const depts = this.getDepartments();
    return cats.map((c) => ({
      ...c,
      department: depts.find((d) => d.id === c.department_id),
    }));
  },

  saveCategory(category: Partial<Category>): Category {
    this.init();
    const cats = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    if (category.id) {
      const idx = cats.findIndex((c) => c.id === category.id);
      if (idx !== -1) {
        cats[idx] = { ...cats[idx], ...category };
        setStored(STORAGE_KEYS.CATEGORIES, cats);
        return cats[idx];
      }
    }
    const newCat: Category = {
      id: `c-${Date.now()}`,
      name: category.name || 'New Category',
      description: category.description || '',
      department_id: category.department_id,
      target_resolution_days: category.target_resolution_days || 5,
      is_active: category.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    cats.push(newCat);
    setStored(STORAGE_KEYS.CATEGORIES, cats);
    return newCat;
  },

  toggleCategoryActive(id: string): Category {
    this.init();
    const cats = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    const idx = cats.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Category not found.');

    cats[idx].is_active = !cats[idx].is_active;
    setStored(STORAGE_KEYS.CATEGORIES, cats);
    return cats[idx];
  },

  deleteCategory(id: string): { success: boolean; message?: string } {
    this.init();
    const subs = getStored<Submission[]>(STORAGE_KEYS.SUBMISSIONS, initialSubmissions);
    const isReferenced = subs.some((s) => s.category_id === id);
    if (isReferenced) {
      return {
        success: false,
        message: 'Cannot delete category referenced by historical submissions. Please deactivate it instead.',
      };
    }
    let cats = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    cats = cats.filter((c) => c.id !== id);
    setStored(STORAGE_KEYS.CATEGORIES, cats);
    return { success: true };
  },

  // Departments
  getDepartments(): Department[] {
    this.init();
    return getStored(STORAGE_KEYS.DEPARTMENTS, initialDepartments);
  },

  saveDepartment(dept: Partial<Department>): Department {
    this.init();
    const depts = getStored<Department[]>(STORAGE_KEYS.DEPARTMENTS, initialDepartments);
    if (dept.id) {
      const idx = depts.findIndex((d) => d.id === dept.id);
      if (idx !== -1) {
        depts[idx] = { ...depts[idx], ...dept };
        setStored(STORAGE_KEYS.DEPARTMENTS, depts);
        return depts[idx];
      }
    }
    const newDept: Department = {
      id: `d-${Date.now()}`,
      name: dept.name || 'New Department',
      code: (dept.code || 'DEPT').toUpperCase(),
      contact_email: dept.contact_email || 'contact@cet.ac.in',
      head_of_department: dept.head_of_department || '',
      is_active: dept.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    depts.push(newDept);
    setStored(STORAGE_KEYS.DEPARTMENTS, depts);
    return newDept;
  },

  // Profiles & Users
  getProfiles(): Profile[] {
    this.init();
    return getStored(STORAGE_KEYS.PROFILES, initialProfiles);
  },

  saveProfile(profile: Profile): void {
    this.init();
    const profiles = getStored<Profile[]>(STORAGE_KEYS.PROFILES, initialProfiles);
    const idx = profiles.findIndex((p) => p.id === profile.id);
    if (idx !== -1) {
      profiles[idx] = profile;
    } else {
      profiles.push(profile);
    }
    setStored(STORAGE_KEYS.PROFILES, profiles);
  },

  // Notifications
  getNotifications(userId: string): Notification[] {
    this.init();
    const all = getStored<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    return all.filter((n) => n.user_id === userId);
  },

  markNotificationRead(notifId: string): void {
    this.init();
    const all = getStored<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const item = all.find((n) => n.id === notifId);
    if (item) {
      item.is_read = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  },

  markAllNotificationsRead(userId: string): void {
    this.init();
    const all = getStored<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    all.forEach((n) => {
      if (n.user_id === userId) n.is_read = true;
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, all);
  },

  addNotification(notif: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Notification {
    this.init();
    const all = getStored<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    all.unshift(newNotif);
    setStored(STORAGE_KEYS.NOTIFICATIONS, all);
    return newNotif;
  },

  // Email Notifications (Transactional Outbox)
  getEmailNotifications(): EmailNotification[] {
    this.init();
    return getStored(STORAGE_KEYS.EMAIL_NOTIFS, initialEmailNotifications);
  },

  enqueueEmail(data: {
    submission_id: string;
    submission_ref?: string;
    recipient_email: string;
    event_type: EmailNotification['event_type'];
    subject: string;
    body_text?: string;
  }): EmailNotification {
    this.init();
    const emails = getStored<EmailNotification[]>(STORAGE_KEYS.EMAIL_NOTIFS, initialEmailNotifications);
    const idempotency = `${data.event_type}_${data.submission_id}_${Date.now()}`;

    const newEmail: EmailNotification = {
      id: `em-${Date.now()}`,
      submission_id: data.submission_id,
      submission_ref: data.submission_ref,
      recipient_email: data.recipient_email,
      event_type: data.event_type,
      subject: data.subject,
      body_text: data.body_text,
      delivery_status: 'delivered', // simulated provider dispatch
      provider_message_id: `msg_resend_${Math.random().toString(36).substring(2, 9)}`,
      attempt_count: 1,
      idempotency_key: idempotency,
      created_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      delivered_at: new Date(Date.now() + 2000).toISOString(),
    };

    emails.unshift(newEmail);
    setStored(STORAGE_KEYS.EMAIL_NOTIFS, emails);
    return newEmail;
  },

  recordEmailNotification(data: Partial<EmailNotification> & {
    submission_id: string;
    recipient_email: string;
    event_type: EmailNotification['event_type'];
    subject: string;
  }): EmailNotification {
    return this.enqueueEmail({
      submission_id: data.submission_id,
      submission_ref: data.submission_ref,
      recipient_email: data.recipient_email,
      event_type: data.event_type,
      subject: data.subject,
      body_text: data.body_text,
    });
  },

  retryEmail(id: string): EmailNotification {
    this.init();
    const emails = getStored<EmailNotification[]>(STORAGE_KEYS.EMAIL_NOTIFS, initialEmailNotifications);
    const item = emails.find((e) => e.id === id);
    if (!item) throw new Error('Email notification log not found.');

    item.attempt_count += 1;
    item.delivery_status = 'delivered';
    item.last_error = undefined;
    item.sent_at = new Date().toISOString();
    item.delivered_at = new Date(Date.now() + 1000).toISOString();
    item.provider_message_id = `msg_resend_retry_${Math.random().toString(36).substring(2, 8)}`;

    setStored(STORAGE_KEYS.EMAIL_NOTIFS, emails);
    return item;
  },

  // Settings
  getSystemSettings(): SystemSettings {
    this.init();
    return getStored(STORAGE_KEYS.SETTINGS, initialSystemSettings);
  },

  updateSystemSettings(settings: Partial<SystemSettings>): SystemSettings {
    this.init();
    const current = this.getSystemSettings();
    const updated = { ...current, ...settings };
    setStored(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // Business Logic: Real Metrics Calculation
  calculateMetrics(submissions: Submission[]) {
    const total = submissions.length;
    const pending = submissions.filter((s) => s.status === 'submitted' || s.status === 'pending_review').length;
    const inProgress = submissions.filter((s) => s.status === 'in_progress' || s.status === 'awaiting_student_response').length;
    const resolved = submissions.filter((s) => s.status === 'resolved' || s.status === 'closed').length;

    const now = new Date();
    const overdue = submissions.filter((s) => {
      if (s.status === 'resolved' || s.status === 'closed') return false;
      if (!s.due_date) return false;
      return new Date(s.due_date) < now;
    }).length;

    // Average resolution time for resolved submissions in hours/days
    const resolvedSubs = submissions.filter((s) => s.resolution_date && (s.status === 'resolved' || s.status === 'closed'));
    let avgHours = 0;
    if (resolvedSubs.length > 0) {
      const totalMillis = resolvedSubs.reduce((acc, curr) => {
        const created = new Date(curr.created_at).getTime();
        const resolvedTime = new Date(curr.resolution_date!).getTime();
        return acc + (resolvedTime - created);
      }, 0);
      avgHours = Math.round(totalMillis / (resolvedSubs.length * 1000 * 3600));
    }

    return {
      total,
      pending,
      inProgress,
      resolved,
      overdue,
      avgResolutionHours: avgHours,
      avgResolutionDays: (avgHours / 24).toFixed(1),
    };
  },
};
