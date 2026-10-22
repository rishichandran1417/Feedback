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
    category_id?: string;
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

const sanitizeSettings = (raw: SystemSettings): SystemSettings => {
  const merged = { ...raw };
  if (!merged.college_info || merged.college_info.name?.includes('Apex') || merged.college_info.name === 'CET') {
    merged.college_info = {
      name: 'College of Engineering Trivandrum',
      code: 'CET',
      support_email: 'admin@cet.ac.in',
      portal_url: 'https://feedback.cet.ac.in',
    };
  }
  if (merged.auth_config) {
    merged.auth_config.allowed_email_domain = '@cet.ac.in';
  }
  if (!merged.maintenance_mode) {
    merged.maintenance_mode = {
      enabled: false,
      message: 'This website is currently under maintenance. We are performing scheduled updates and will be back shortly.',
      estimated_end: '',
    };
  }
  return merged;
};

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emailNotifications, setEmailNotifications] = useState<EmailNotification[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(() => sanitizeSettings(MockStorage.getSystemSettings()));

  const refreshData = useCallback(async () => {
    // 1. Fetch settings from Supabase or fallback
    if (isUsingRealSupabase && supabase) {
      try {
        const { data: allSettings } = await supabase
          .from('system_settings')
          .select('key, value');

        if (allSettings && allSettings.length > 0) {
          const coreConfig = allSettings.find((s) => s.key === 'core_config');
          if (coreConfig?.value) {
            const parsed = { ...coreConfig.value };
            const maint = allSettings.find((s) => s.key === 'maintenance_mode');
            if (maint?.value) parsed.maintenance_mode = maint.value;
            setSettings(sanitizeSettings(parsed));
          } else {
            const fallback = MockStorage.getSystemSettings();
            const merged: SystemSettings = { ...fallback };
            allSettings.forEach((item) => {
              if (item.key === 'college_info' && item.value) merged.college_info = item.value;
              if (item.key === 'auth_config' && item.value) merged.auth_config = item.value;
              if (item.key === 'file_upload_limits' && item.value) merged.file_upload_limits = item.value;
              if (item.key === 'workflow_rules' && item.value) merged.workflow_rules = item.value;
              if (item.key === 'email_provider_config' && item.value) merged.email_provider_config = item.value;
              if (item.key === 'maintenance_mode' && item.value) merged.maintenance_mode = item.value;
            });
            setSettings(sanitizeSettings(merged));
          }
        } else {
          setSettings(sanitizeSettings(MockStorage.getSystemSettings()));
        }
      } catch {
        setSettings(sanitizeSettings(MockStorage.getSystemSettings()));
      }

      try {
        // Fetch categories, departments & student profiles (for admin view)
        const [{ data: depts }, { data: cats }, profilesRes] = await Promise.all([
          supabase.from('departments').select('*').order('name'),
          supabase.from('categories').select('*').order('name'),
          user?.role === 'administrator'
            ? supabase.from('profiles').select('id, full_name, email, student_id')
            : Promise.resolve({ data: [] }),
        ]);

        const populatedDepts: Department[] = depts || [];
        const populatedCats: Category[] = (cats || []).map((c: any) => ({
          ...c,
          department: populatedDepts.find((d) => d.id === c.department_id),
        }));
        const profilesList: any[] = (profilesRes as any)?.data || [];

        setDepartments(populatedDepts);
        setCategories(populatedCats);

        // Fetch submissions with strict auth boundary
        if (!user) {
          setSubmissions([]);
        } else {
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
              const studentProfile = profilesList.find((p: any) => p.id === s.student_id);
              const msgs = (s.messages || []).filter((m: any) =>
                user?.role === 'administrator' ? true : !m.is_internal
              );
              return {
                ...s,
                student_name: studentProfile?.full_name || s.student_name || 'Verified Student',
                student_email: studentProfile?.email || s.student_email || 'Confidential',
                category_name: cat?.name || 'General',
                department_name: dept?.name || 'College Office',
                messages: msgs,
              };
            });
            setSubmissions(mappedSubs);
          }
        }

        // Fetch notifications
        if (user) {
          const { data: notifData } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (notifData) setNotifications(notifData);
        } else {
          setNotifications([]);
        }

        // Fetch email notifications outbox (admin only)
        if (user?.role === 'administrator') {
          const { data: emailData } = await supabase
            .from('email_notifications')
            .select('*')
            .order('created_at', { ascending: false });
          if (emailData) setEmailNotifications(emailData);
        } else {
          setEmailNotifications([]);
        }

        return;
      } catch (err) {
        console.error('Supabase query error, falling back to local store:', err);
      }
    }

    // Local fallback engine with strict auth boundary
    if (!user) {
      setSubmissions([]);
    } else {
      const subs = MockStorage.getSubmissions(user.role, user.id);
      setSubmissions(subs);
    }
    setCategories(MockStorage.getCategories());
    setDepartments(MockStorage.getDepartments());
    setNotifications(user ? MockStorage.getNotifications(user.id) : []);
    setEmailNotifications(user?.role === 'administrator' ? MockStorage.getEmailNotifications() : []);
    setSettings(MockStorage.getSystemSettings());
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const allSubmissionsForMetrics = user?.role === 'administrator' ? submissions : [];
  const metrics = MockStorage.calculateMetrics(allSubmissionsForMetrics);

  const createSubmission = async (payload: {
    submission_type: Submission['submission_type'];
    category_id?: string;
    subject: string;
    description: string;
    location?: string;
    priority: Submission['priority'];
    attachments?: { file_name: string; file_size: number; file_type: string; storage_path: string }[];
  }) => {
    if (!user) throw new Error('Authentication required');

    if (isUsingRealSupabase && supabase) {
      const chosenCat = payload.category_id ? categories.find((c) => c.id === payload.category_id) : null;
      const cat = chosenCat || (categories.length > 0 ? categories[0] : null);
      const targetDays = cat?.target_resolution_days || 5;
      const dueDate = new Date(Date.now() + targetDays * 24 * 60 * 60 * 1000).toISOString();
      const nextNum = 1000 + submissions.length + 1;
      const ref = `FB-${new Date().getFullYear()}-${nextNum}`;
      const categoryIdToUse = payload.category_id || cat?.id || null;
      const departmentIdToUse = chosenCat?.department_id || cat?.department_id || null;

      // Ensure profile exists in profiles table so foreign key constraint succeeds
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          full_name: user.full_name || user.email.split('@')[0],
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } catch (e) {
        console.warn('Profile sync before submission:', e);
      }

      const { data: subData, error: subError } = await supabase
        .from('submissions')
        .insert({
          reference_number: ref,
          student_id: user.id,
          submission_type: payload.submission_type,
          category_id: categoryIdToUse,
          department_id: departmentIdToUse,
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

      // Email Communication: Dispatch Acknowledgement Email
      const studentEmail = user.email || (payload as any).student_email;
      if (studentEmail) {
        const emailRecord = {
          submission_id: subData.id,
          recipient_email: studentEmail,
          event_type: 'submission_acknowledgement',
          subject: `[${settings.college_info.name || 'Grievance Portal'}] Confirmation: Ref #${ref}`,
          body_text: `Dear ${user.full_name || 'Student'},\n\nYour grievance regarding "${payload.subject}" has been successfully logged under reference number ${ref}.\n\nCategory: ${cat?.name || 'General'}\nPriority: ${payload.priority}\nTarget Turnaround: ~${targetDays} business days.\n\nSincerely,\n${settings.college_info.name || 'Central Grievance Redressal Cell'}`,
          delivery_status: 'delivered',
          idempotency_key: `ack_${subData.id}_${Date.now()}`,
          sent_at: new Date().toISOString(),
          delivered_at: new Date().toISOString(),
        };

        try {
          await supabase.from('email_notifications').insert(emailRecord);
        } catch (e) {
          console.error('Failed to log email in Supabase:', e);
        }
        MockStorage.recordEmailNotification(emailRecord as any);
      }

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

    // Local Email Dispatch
    if (user.email) {
      MockStorage.recordEmailNotification({
        id: `email-${Date.now()}`,
        submission_id: created.id,
        recipient_email: user.email,
        event_type: 'submission_acknowledgement',
        subject: `[${settings.college_info.name || 'Grievance Portal'}] Confirmation: Ref #${created.reference_number}`,
        body_text: `Dear ${user.full_name},\n\nYour ticket #${created.reference_number} ("${payload.subject}") has been registered.`,
        delivery_status: 'delivered',
        attempt_count: 1,
        idempotency_key: `ack_${created.id}_${Date.now()}`,
        created_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
      });
    }

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

    const targetSub = submissions.find((s) => s.id === submissionId);

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

      let dbUpdated: Submission | null = null;
      try {
        const { data, error } = await supabase
          .from('submissions')
          .update(updatePayload)
          .eq('id', submissionId)
          .select()
          .maybeSingle();

        if (error) {
          console.warn('Supabase update submission notice:', error.message);
        } else if (data) {
          dbUpdated = data;
          await supabase.from('submission_status_history').insert({
            submission_id: submissionId,
            new_status: newStatus,
            remarks: remarks || `Status changed to ${newStatus}`,
            changed_by: user.id,
          });
        }
      } catch (e) {
        console.warn('Supabase status sync error:', e);
      }

      // Email Communication: Dispatch Resolution Email if resolved
      if (newStatus === 'resolved') {
        const studentEmail = targetSub?.student_email;
        if (studentEmail) {
          const emailRecord = {
            submission_id: submissionId,
            recipient_email: studentEmail,
            event_type: 'issue_resolved',
            subject: `[${settings.college_info.name || 'Grievance Portal'}] Grievance Resolved: Ref #${targetSub?.reference_number || submissionId}`,
            body_text: `Dear ${targetSub?.student_name || 'Student'},\n\nYour grievance ticket #${targetSub?.reference_number} ("${targetSub?.subject}") has been marked as RESOLVED.\n\nResolution Summary:\n${resolutionSummary}\n\nResolved Date: ${new Date().toLocaleDateString()}\n\nSincerely,\nOffice of the Dean & Grievance Redressal Committee`,
            delivery_status: 'delivered',
            idempotency_key: `res_${submissionId}_${Date.now()}`,
            sent_at: new Date().toISOString(),
            delivered_at: new Date().toISOString(),
          };

          try {
            await supabase.from('email_notifications').insert(emailRecord);
          } catch (e) {
            console.error('Failed to log resolution email in Supabase:', e);
          }
          try {
            MockStorage.recordEmailNotification(emailRecord as any);
          } catch {
            // Ignore mock storage errors in live mode
          }
        }
      }

      // Safely mirror to MockStorage if present in local cache
      try {
        MockStorage.updateSubmissionStatus(
          submissionId,
          newStatus,
          { id: user.id, name: user.full_name },
          remarks,
          resolutionSummary
        );
      } catch {
        // Safe to ignore for real database submissions
      }

      await refreshData();
      return dbUpdated || (targetSub as any);
    }

    const updated = MockStorage.updateSubmissionStatus(
      submissionId,
      newStatus,
      { id: user.id, name: user.full_name },
      remarks,
      resolutionSummary
    );

    // Email Communication: Local Resolution Email Dispatch
    if (newStatus === 'resolved' && targetSub?.student_email) {
      MockStorage.recordEmailNotification({
        id: `email-${Date.now()}`,
        submission_id: submissionId,
        recipient_email: targetSub.student_email,
        event_type: 'issue_resolved',
        subject: `[${settings.college_info.name || 'Grievance Portal'}] Grievance Resolved: Ref #${targetSub.reference_number}`,
        body_text: `Dear ${targetSub.student_name},\n\nYour grievance #${targetSub.reference_number} ("${targetSub.subject}") has been marked as RESOLVED.\n\nResolution Summary:\n${resolutionSummary}`,
        delivery_status: 'delivered',
        attempt_count: 1,
        idempotency_key: `res_${submissionId}_${Date.now()}`,
        created_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
      });
    }

    await refreshData();
    return updated;
  };

  const assignSubmission = async (submissionId: string, departmentId: string, adminId: string) => {
    if (!user || user.role !== 'administrator') throw new Error('Unauthorized');

    if (isUsingRealSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .update({
            department_id: departmentId,
            assigned_to: adminId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', submissionId)
          .select()
          .maybeSingle();

        if (data) {
          await refreshData();
          return data;
        }
      } catch (e) {
        console.warn('Supabase assignSubmission fallback:', e);
      }
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
      try {
        const { data, error } = await supabase
          .from('submissions')
          .update({ due_date: dueDate, updated_at: new Date().toISOString() })
          .eq('id', submissionId)
          .select()
          .maybeSingle();

        if (data) {
          await refreshData();
          return data;
        }
      } catch (e) {
        console.warn('Supabase setDueDate fallback:', e);
      }
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
    const updated = MockStorage.updateSystemSettings(newSettings);
    setSettings(updated);

    if (isUsingRealSupabase && supabase) {
      try {
        await Promise.all([
          supabase.from('system_settings').upsert({
            key: 'core_config',
            value: updated,
            updated_at: new Date().toISOString(),
          }),
          supabase.from('system_settings').upsert({
            key: 'college_info',
            value: updated.college_info,
            updated_at: new Date().toISOString(),
          }),
          supabase.from('system_settings').upsert({
            key: 'auth_config',
            value: updated.auth_config,
            updated_at: new Date().toISOString(),
          }),
          supabase.from('system_settings').upsert({
            key: 'file_upload_limits',
            value: updated.file_upload_limits,
            updated_at: new Date().toISOString(),
          }),
          supabase.from('system_settings').upsert({
            key: 'workflow_rules',
            value: updated.workflow_rules,
            updated_at: new Date().toISOString(),
          }),
          supabase.from('system_settings').upsert({
            key: 'maintenance_mode',
            value: updated.maintenance_mode,
            updated_at: new Date().toISOString(),
          }),
        ]);
      } catch (e) {
        console.error('Failed to persist settings to Supabase system_settings:', e);
      }
    }

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
