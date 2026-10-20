import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, AppRole } from '../types/database';
import { MockStorage } from '../lib/mockStorage';
import { isUsingRealSupabase, supabase } from '../lib/supabase';

interface AuthUser extends Profile {
  role: AppRole;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginAsStudent: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsAdmin: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  registerStudent: (data: { email: string; fullName: string; studentId: string; department: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: AppRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ait_auth_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        // Default demo session: Student Arjun Patel
        const profiles = MockStorage.getProfiles();
        const student = profiles.find((p) => p.email.includes('arjun'));
        if (student) {
          const defaultSession: AuthUser = { ...student, role: 'student' };
          setUser(defaultSession);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultSession));
        }
      }
    } catch (e) {
      console.error('Session restore error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAsStudent = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const settings = MockStorage.getSystemSettings();
    const allowedDomain = settings.auth_config.allowed_email_domain || '@college.edu';

    // Domain validation
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith(allowedDomain)) {
      return {
        success: false,
        error: `Registration and access restricted to official college email accounts ending with ${allowedDomain}`,
      };
    }

    const profiles = MockStorage.getProfiles();
    let profile = profiles.find((p) => p.email.toLowerCase() === normalizedEmail);

    if (!profile) {
      // Auto register for seamless verification testing
      const newProfile: Profile = {
        id: `u-${Date.now()}`,
        email: normalizedEmail,
        full_name: normalizedEmail.split('@')[0].replace('.', ' '),
        student_id: `AIT-2026-${Math.floor(100 + Math.random() * 900)}`,
        department: 'General Sciences',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MockStorage.saveProfile(newProfile);
      profile = newProfile;
    }

    if (!profile.is_active) {
      return {
        success: false,
        error: 'Your student account has been temporarily suspended. Please contact the Registrar.',
      };
    }

    const authSession: AuthUser = { ...profile, role: 'student' };
    setUser(authSession);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
    return { success: true };
  };

  const loginAsAdmin = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const profiles = MockStorage.getProfiles();
    const profile = profiles.find((p) => p.email.toLowerCase() === normalizedEmail);

    // Only allow verified admin profiles
    if (!profile || !profile.email.includes('dean') && !profile.email.includes('admin')) {
      return {
        success: false,
        error: 'Unauthorized administrator credentials. Access to the administration portal is restricted.',
      };
    }

    const authSession: AuthUser = { ...profile, role: 'administrator' };
    setUser(authSession);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
    return { success: true };
  };

  const registerStudent = async (data: {
    email: string;
    fullName: string;
    studentId: string;
    department: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const settings = MockStorage.getSystemSettings();
    const allowedDomain = settings.auth_config.allowed_email_domain || '@college.edu';

    const normalizedEmail = data.email.trim().toLowerCase();
    if (!normalizedEmail.endsWith(allowedDomain)) {
      return {
        success: false,
        error: `Invalid email domain. Please use your official college address ending in ${allowedDomain}`,
      };
    }

    const profiles = MockStorage.getProfiles();
    const exists = profiles.some((p) => p.email.toLowerCase() === normalizedEmail);
    if (exists) {
      return {
        success: false,
        error: 'An account with this official college email already exists. Please log in.',
      };
    }

    const newProfile: Profile = {
      id: `u-${Date.now()}`,
      email: normalizedEmail,
      full_name: data.fullName.trim(),
      student_id: data.studentId.trim().toUpperCase(),
      department: data.department,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    MockStorage.saveProfile(newProfile);
    const authSession: AuthUser = { ...newProfile, role: 'student' };
    setUser(authSession);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    if (isUsingRealSupabase && supabase) {
      supabase.auth.signOut();
    }
  };

  const switchRole = (newRole: AppRole) => {
    const profiles = MockStorage.getProfiles();
    if (newRole === 'student') {
      const student = profiles.find((p) => p.email.includes('arjun')) || profiles[0];
      const authSession: AuthUser = { ...student, role: 'student' };
      setUser(authSession);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
    } else {
      const admin = profiles.find((p) => p.email.includes('dean')) || profiles[2];
      const authSession: AuthUser = { ...admin, role: 'administrator' };
      setUser(authSession);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginAsStudent,
        loginAsAdmin,
        registerStudent,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
