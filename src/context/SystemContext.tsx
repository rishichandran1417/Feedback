import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Submission,
  Category,
  Department,
  Notification,
  EmailNotification,
  SystemSettings,
  SubmissionStatus,
  SubmissionMessage,
} from '../types/database';
import { MockStorage } from '../lib/mockStorage';
import { isUsingRealSupabase, supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface SystemContextType {
  submissions: Submission[];
  categories: Category[];
  departments: Department[];
  notifications: Notification[];
  emailNotifications: EmailNotification[];
  settings: SystemSettings;
  unreadCount: number;
  metrics: ReturnType<typeof MockStorage.calculateMetrics>;
  refreshData: () => Promise<void>;
  createSubmission: (payload: {
    submission_type: Submission['submission_type'];
    category_id: string;
    subject: string;
    description: string;
    location?: string;
    priority: Submission['priority'];
    attachments?: { file_name: string; file_size: number; file_type: string; storage_path: string }[];
  }) => Promise<Submission>;
  updateStatus: (
    submissionId: string,
    newStatus: SubmissionStatus,
    remarks?: string,
    resolutionSummary?: string
  ) => Promise<Submission>;
  assignSubmission: (submissionId: string, departmentId: string, adminId: string) => Promise<Submission>;
  setDueDate: (submissionId: string, dueDate: string) => Promise<Submission>;
  addMessage: (
    submissionId: string,
    content: string,
    messageType: SubmissionMessage['message_type'],
    isInternal: boolean
  ) => Promise<SubmissionMessage>;
  saveCategory: (cat: Partial<Category>) => Promise<Category>;
  toggleCategoryActive: (id: string) => Promise<Category>;
  deleteCategory: (id: string) => Promise<{ success: boolean; message?: string }>;
  saveDepartment: (dept: Partial<Department>) => Promise<Department>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  retryEmail: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emailNotifications, setEmailNotifications] = useState<EmailNotification[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(MockStorage.getSystemSettings());

  const refreshData = useCallback(async () => {
    if (!user) {
      setSubmissions([]);
      setNotifications([]);
      return;
    }

    if (isUsingRealSupabase && supabase) {
      try {
        // Fetch categories & departments
        const [{ data: depts }, { data: cats }] = await Promise.all([
          supabase.from('departments').select('*').order('name'),
          supabase.from('categories').select('*').order('name'),
        ]);

        const populatedDepts: Department[] = depts || [];
        const populatedCats: Category[] = (cats || []).map((c: any) => ({
          ...c,
          department: populatedDepts.find((d) => d.id === c.department_id),
        }));

        setDepartments(populatedDepts);
        setCategories(populatedCats);

        // Fetch submissions with RLS enforcement
        let query = supabase
          .from('submissions')
          .select(`
            *,
            attachments:submission_attachments(*),
            messages:submission_messages(*),
            status_history:submission_status_history(*)
          `)
          .order('created_at', { ascending: false });

        if (user.role === 'student') {
          query = query.eq('student_id', user.id);
        }

        const { data: subData, error: subError } = await query;
        if (!subError && subData) {
          const mappedSubs: Submission[] = subData.map((s: any) => {
            const cat = populatedCats.find((c) => c.id === s.category_id);
            const dept = populatedDepts.find((d) => d.id === s.department_id);
            // Hide internal notes for students
            const msgs = (s.messages || []).filter((m: any) =>
              user.role === 'administrator' ? true : !m.is_internal
            );
            return {
              ...s,
              category_name: cat?.name || 'General',
              department_name: dept?.name || 'College Office',
              messages: msgs,
            };
          });
          setSubmissions(mappedSubs);
        }

        // Fetch notifications
        const { data: notifData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (notifData) setNotifications(notifData);

        // Fetch email logs (Admin only)
        if (user.role === 'administrator') {
          const { data: emailData } = await supabase
            .from('email_notifications')
            .select('*')
            .order('created_at', { ascending: false });
          if (emailData) setEmailNotifications(emailData);
        }
        return;
      } catch (err) {
        console.error('Supabase query error, falling back to local store:', err);
      }
    }

    // Local fallback engine
    const subs = MockStorage.getSubmissions(user.role, user.id);
    setSubmissions(subs);
    setCategories(MockStorage.getCategories());
    setDepartments(MockStorage.getDepartments());
    setNotifications(MockStorage.getNotifications(user.id));
    setEmailNotifications(MockStorage.getEmailNotifications());
    setSettings(MockStorage.getSystemSettings());
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const allSubmissionsForMetrics = user?.role === 'administrator'
    ? submissions
    : MockStorage.getSubmissions('administrator', '');
  const metrics = MockStorage.calculateMetrics(allSubmissionsForMetrics);

  const createSubmission = async (payload: {
    submission_type: Submission['submission_type'];
    category_id: string;
    subject: string;
    description: string;
    location?: string;
    priority: Submission['priority'];
    attachments?: { file_name: string; file_size: number; file_type: string; storage_path: string }[];
  }) => {
    if (!user) throw new Error('Authentication required');

    if (isUsingRealSupabase && supabase) {
      const cat = categories.find((c) => c.id === payload.category_id);
      const targetDays = cat?.target_resolution_days || 5;
      const dueDate = new Date(Date.now() + targetDays * 24 * 60 * 60 * 1000).toISOString();
      const nextNum = 1000 + submissions.length + 1;
      const ref = `FB-${new Date().getFullYear()}-${nextNum}`;

      const { data: subData, error: subError } = await supabase
        .from('submissions')
        .insert({
          reference_number: ref,
          student_id: user.id,
          submission_type: payload.submission_type,
          category_id: payload.category_id,
          department_id: cat?.department_id,
          subject: payload.subject,
          description: payload.description,
          location: payload.location,
          priority: payload.priority,
          is_anonymous: false,
          status: 'submitted',
          due_date: dueDate,
        })
        .select()
        .single();

      if (subError) throw new Error(subError.message);

      // Insert attachments if present
      if (payload.attachments && payload.attachments.length > 0) {
        await supabase.from('submission_attachments').insert(
          payload.attachments.map((att) => ({
            submission_id: subData.id,
            file_name: att.file_name,
            file_size: att.file_size,
            file_type: att.file_type,
            storage_path: att.storage_path,
            uploaded_by: user.id,
          }))
        );
      }

      // Insert initial history
      await supabase.from('submission_status_history').insert({
        submission_id: subData.id,
        new_status: 'submitted',
        remarks: 'Initial submission recorded via student portal.',
        changed_by: user.id,
      });

      await refreshData();
      return subData;
    }

    const created = MockStorage.createSubmission({
      ...payload,
      is_anonymous: false,
      student_id: user.id,
      student_name: user.full_name,
      student_email: user.email,
    });

    await refreshData();
    return created;
  };

  const updateStatus = async (
    submissionId: string,
    newStatus: SubmissionStatus,
    remarks?: string,
    resolutionSummary?: string
  ) => {
    if (!user || user.role !== 'administrator') {
      throw new Error('Unauthorized: Administrator privileges required.');
    }

    if (newStatus === 'resolved' && !resolutionSummary?.trim()) {
      throw new Error('A detailed resolution summary is required before resolving a grievance.');
    }

    if (isUsingRealSupabase && supabase) {
      const updatePayload: any = {
        status: newStatus,
        student_remarks: remarks || null,
        updated_at: new Date().toISOString(),
      };
      if (newStatus === 'resolved') {
        updatePayload.resolution_date = new Date().toISOString();
        updatePayload.resolution_summary = resolutionSummary;
      }

      const { data, error } = await supabase
        .from('submissions')
        .update(updatePayload)
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw new Error(error.message);

      await supabase.from('submission_status_history').insert({
        submission_id: submissionId,
        new_status: newStatus,
        remarks: remarks || `Status changed to ${newStatus}`,
        changed_by: user.id,
      });

      await refreshData();
      return data;
    }

    const updated = MockStorage.updateSubmissionStatus(
      submissionId,
      newStatus,
      { id: user.id, name: user.full_name },
      remarks,
      resolutionSummary
    );

    await refreshData();
    return updated;
  };

  const assignSubmission = async (submissionId: string, departmentId: string, adminId: string) => {
    if (!user || user.role !== 'administrator') throw new Error('Unauthorized');

    if (isUsingRealSupabase && supabase) {
      const { data, error } = await supabase
        .from('submissions')
        .update({
          department_id: departmentId,
          assigned_to: adminId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      await refreshData();
      return data;
    }

    const updated = MockStorage.assignSubmission(
      submissionId,
      departmentId,
      adminId,
      { id: user.id, name: user.full_name }
    );
    await refreshData();
    return updated;
  };

  const setDueDate = async (submissionId: string, dueDate: string) => {
    if (!user || user.role !== 'administrator') throw new Error('Unauthorized');

    if (isUsingRealSupabase && supabase) {
      const { data, error } = await supabase
        .from('submissions')
        .update({ due_date: dueDate, updated_at: new Date().toISOString() })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      await refreshData();
      return data;
    }

    const updated = MockStorage.setDueDate(submissionId, dueDate);
    await refreshData();
    return updated;
  };

  const addMessage = async (
    submissionId: string,
    content: string,
    messageType: SubmissionMessage['message_type'],
    isInternal: boolean
  ) => {
    if (!user) throw new Error('Authentication required');

    if (user.role === 'student' && isInternal) {
      throw new Error('Unauthorized');
    }

    if (isUsingRealSupabase && supabase) {
      const { data, error } = await supabase
        .from('submission_messages')
        .insert({
          submission_id: submissionId,
          sender_id: user.id,
          message_type: messageType,
          content,
          is_internal: isInternal,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      await refreshData();
      return data;
    }

    const msg = MockStorage.addMessage(
      submissionId,
      content,
      messageType,
      isInternal,
      { id: user.id, name: user.full_name, role: user.role }
    );

    await refreshData();
    return msg;
  };

  const saveCategory = async (cat: Partial<Category>) => {
    if (isUsingRealSupabase && supabase) {
      const { data, error } = await supabase.from('categories').upsert(cat).select().single();
      if (error) throw new Error(error.message);
      await refreshData();
      return data;
    }
    const res = MockStorage.saveCategory(cat);
    await refreshData();
    return res;
  };

  const toggleCategoryActive = async (id: string) => {
    if (isUsingRealSupabase && supabase) {
      const current = categories.find((c) => c.id === id);
      const { data, error } = await supabase
        .from('categories')
        .update({ is_active: !current?.is_active })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      await refreshData();
      return data;
    }
    const res = MockStorage.toggleCategoryActive(id);
    await refreshData();
    return res;
  };

  const deleteCategory = async (id: string) => {
    if (isUsingRealSupabase && supabase) {
      const { data: inUse } = await supabase.from('submissions').select('id').eq('category_id', id).limit(1);
      if (inUse && inUse.length > 0) {
        return { success: false, message: 'Category is referenced by existing submissions. Deactivate it instead.' };
      }
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) return { success: false, message: error.message };
      await refreshData();
      return { success: true };
    }
    const res = MockStorage.deleteCategory(id);
    await refreshData();
    return res;
  };

  const saveDepartment = async (dept: Partial<Department>) => {
    if (isUsingRealSupabase && supabase) {
      const { data, error } = await supabase.from('departments').upsert(dept).select().single();
      if (error) throw new Error(error.message);
      await refreshData();
      return data;
    }
    const res = MockStorage.saveDepartment(dept);
    await refreshData();
    return res;
  };

  const markNotificationRead = async (id: string) => {
    if (isUsingRealSupabase && supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    } else {
      MockStorage.markNotificationRead(id);
    }
    await refreshData();
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    if (isUsingRealSupabase && supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    } else {
      MockStorage.markAllNotificationsRead(user.id);
    }
    await refreshData();
  };

  const retryEmail = async (id: string) => {
    MockStorage.retryEmail(id);
    await refreshData();
  };

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    MockStorage.updateSystemSettings(newSettings);
    await refreshData();
  };

  return (
    <SystemContext.Provider
      value={{
        submissions,
        categories,
        departments,
        notifications,
        emailNotifications,
        settings,
        unreadCount,
        metrics,
        refreshData,
        createSubmission,
        updateStatus,
        assignSubmission,
        setDueDate,
        addMessage,
        saveCategory,
        toggleCategoryActive,
        deleteCategory,
        saveDepartment,
        markNotificationRead,
        markAllNotificationsRead,
        retryEmail,
        updateSettings,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error('useSystem must be used within a SystemProvider');
  return context;
};
