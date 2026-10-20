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
  refreshData: () => void;
  createSubmission: (payload: {
    submission_type: Submission['submission_type'];
    category_id: string;
    subject: string;
    description: string;
    location?: string;
    priority: Submission['priority'];
    is_anonymous: boolean;
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
  saveCategory: (cat: Partial<Category>) => Category;
  toggleCategoryActive: (id: string) => Category;
  deleteCategory: (id: string) => { success: boolean; message?: string };
  saveDepartment: (dept: Partial<Department>) => Department;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  retryEmail: (id: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
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

  const refreshData = useCallback(() => {
    if (!user) {
      setSubmissions([]);
      setNotifications([]);
      return;
    }

    // Role-enforced submissions retrieval
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

  // Real-time metric calculation from actual database records
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
    is_anonymous: boolean;
    attachments?: { file_name: string; file_size: number; file_type: string; storage_path: string }[];
  }) => {
    if (!user) throw new Error('Authentication required');

    const created = MockStorage.createSubmission({
      ...payload,
      student_id: user.id,
      student_name: user.full_name,
      student_email: user.email,
    });

    refreshData();
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

    const updated = MockStorage.updateSubmissionStatus(
      submissionId,
      newStatus,
      { id: user.id, name: user.full_name },
      remarks,
      resolutionSummary
    );

    refreshData();
    return updated;
  };

  const assignSubmission = async (submissionId: string, departmentId: string, adminId: string) => {
    if (!user || user.role !== 'administrator') {
      throw new Error('Unauthorized');
    }
    const updated = MockStorage.assignSubmission(
      submissionId,
      departmentId,
      adminId,
      { id: user.id, name: user.full_name }
    );
    refreshData();
    return updated;
  };

  const setDueDate = async (submissionId: string, dueDate: string) => {
    if (!user || user.role !== 'administrator') throw new Error('Unauthorized');
    const updated = MockStorage.setDueDate(submissionId, dueDate);
    refreshData();
    return updated;
  };

  const addMessage = async (
    submissionId: string,
    content: string,
    messageType: SubmissionMessage['message_type'],
    isInternal: boolean
  ) => {
    if (!user) throw new Error('Authentication required');

    const msg = MockStorage.addMessage(
      submissionId,
      content,
      messageType,
      isInternal,
      { id: user.id, name: user.full_name, role: user.role }
    );

    refreshData();
    return msg;
  };

  const saveCategory = (cat: Partial<Category>) => {
    const res = MockStorage.saveCategory(cat);
    refreshData();
    return res;
  };

  const toggleCategoryActive = (id: string) => {
    const res = MockStorage.toggleCategoryActive(id);
    refreshData();
    return res;
  };

  const deleteCategory = (id: string) => {
    const res = MockStorage.deleteCategory(id);
    refreshData();
    return res;
  };

  const saveDepartment = (dept: Partial<Department>) => {
    const res = MockStorage.saveDepartment(dept);
    refreshData();
    return res;
  };

  const markNotificationRead = (id: string) => {
    MockStorage.markNotificationRead(id);
    refreshData();
  };

  const markAllNotificationsRead = () => {
    if (user) {
      MockStorage.markAllNotificationsRead(user.id);
      refreshData();
    }
  };

  const retryEmail = (id: string) => {
    MockStorage.retryEmail(id);
    refreshData();
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    MockStorage.updateSystemSettings(newSettings);
    refreshData();
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
