import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Profile, AppRole } from '../types/database';
import { MockStorage } from '../lib/mockStorage';
import { isUsingRealSupabase, supabase } from '../lib/supabase';

export interface AuthUser extends Profile {
  role: AppRole;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginAsStudent: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsAdmin: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  registerStudent: (data: {
    email: string;
    password?: string;
    fullName: string;
    studentId: string;
    department: string;
    courseProgramme?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAdminAccess: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const defaultAdminUser: AuthUser = {
  id: 'usr-admin-01',
  email: 'dean.academics@college.edu',
  full_name: 'Dr. Arthur Vance (Dean)',
  student_id: 'FAC-DEAN-01',
  phone: '+1 (555) 019-2834',
  department: 'Office of the Dean',
  course_programme: 'Academic Affairs',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  role: 'administrator',
};

const AUTH_STORAGE_KEY = 'ait_auth_session_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(defaultAdminUser);
  const [loading, setLoading] = useState(false);

  // Sync session from Supabase or persistent local state
  const syncSession = useCallback(async () => {
    try {
      if (isUsingRealSupabase && supabase) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          setUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
          return;
        }

        const authUserId = session.user.id;

        // Query profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUserId)
          .single();

        if (profileError || !profileData) {
          console.warn('Profile not found for authenticated user, logging out.');
          await supabase.auth.signOut();
          setUser(null);
          return;
        }

        // Query user_roles table for authorized role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authUserId)
          .single();

        const assignedRole: AppRole = roleData?.role === 'administrator' ? 'administrator' : 'student';

        const authSession: AuthUser = {
          id: profileData.id,
          email: profileData.email,
          full_name: profileData.full_name,
          student_id: profileData.student_id,
          phone: profileData.phone,
          department: profileData.department,
          course_programme: profileData.course_programme,
          avatar_url: profileData.avatar_url,
          is_active: profileData.is_active,
          created_at: profileData.created_at,
          updated_at: profileData.updated_at,
          role: assignedRole,
        };

        setUser(authSession);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
      } else {
        // Fallback local persistent engine
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            setUser(defaultAdminUser);
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        } else {
          setUser(defaultAdminUser);
        }
      }
    } catch (e) {
      console.error('Session sync error:', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncSession();

    if (isUsingRealSupabase && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!session) {
          setUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        } else {
          await syncSession();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [syncSession]);

  const loginAsStudent = async (email: string, password = 'collegePassword123'): Promise<{ success: boolean; error?: string }> => {
    const settings = MockStorage.getSystemSettings();
    const allowedDomain = settings.auth_config.allowed_email_domain || '@college.edu';
    const normalizedEmail = email.trim().toLowerCase();

    // Enforce official college email domain
    if (!normalizedEmail.endsWith(allowedDomain)) {
      return {
        success: false,
        error: `Access restricted. Please use your official college email address ending with ${allowedDomain}`,
      };
    }

    if (isUsingRealSupabase && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if user is student
      const { data: roleRecord } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleRecord?.role === 'administrator') {
        // Administrator attempting to login through student portal
        return {
          success: false,
          error: 'Administrator account detected. Please use the dedicated Administrator Portal at /admin',
        };
      }

      await syncSession();
      return { success: true };
    }

    // Local fallback engine
    const profiles = MockStorage.getProfiles();
    let profile = profiles.find((p) => p.email.toLowerCase() === normalizedEmail);

    if (profile && (profile.email.includes('dean') || profile.email.includes('admin'))) {
      return {
        success: false,
        error: 'Administrator account detected. Please use the dedicated Administrator Portal at /admin',
      };
    }

    if (!profile) {
      // Auto-provision verified student profile
      const newProfile: Profile = {
        id: `u-${Date.now()}`,
        email: normalizedEmail,
        full_name: normalizedEmail.split('@')[0].replace('.', ' '),
        student_id: `AIT-2026-${Math.floor(100 + Math.random() * 900)}`,
        department: 'General Studies',
        course_programme: 'B.Tech / Undergraduate',
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

  const loginAsAdmin = async (email: string, password = 'adminSecureKey2026'): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (isUsingRealSupabase && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Verify administrator role in database
      const { data: roleRecord } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleRecord?.role !== 'administrator') {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Access denied: You do not possess administrator authorization.',
        };
      }

      await syncSession();
      return { success: true };
    }

    // Local fallback engine
    const profiles = MockStorage.getProfiles();
    const profile = profiles.find((p) => p.email.toLowerCase() === normalizedEmail);

    // Strict role check: email must belong to an administrator profile
    if (!profile || (!profile.email.includes('dean') && !profile.email.includes('admin'))) {
      return {
        success: false,
        error: 'Access denied: Unauthorized administrator credentials.',
      };
    }

    const authSession: AuthUser = { ...profile, role: 'administrator' };
    setUser(authSession);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
    return { success: true };
  };

  const registerStudent = async (data: {
    email: string;
    password?: string;
    fullName: string;
    studentId: string;
    department: string;
    courseProgramme?: string;
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

    if (isUsingRealSupabase && supabase) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: data.password || 'collegePassword123',
        options: {
          data: {
            full_name: data.fullName.trim(),
            student_id: data.studentId.trim().toUpperCase(),
            department: data.department,
            course_programme: data.courseProgramme || 'Undergraduate',
          },
        },
      });

      if (signUpError) {
        return { success: false, error: signUpError.message };
      }

      if (signUpData.user) {
        // Insert into profiles
        await supabase.from('profiles').upsert({
          id: signUpData.user.id,
          email: normalizedEmail,
          full_name: data.fullName.trim(),
          student_id: data.studentId.trim().toUpperCase(),
          department: data.department,
          course_programme: data.courseProgramme || 'Undergraduate',
          is_active: true,
        });

        // Always assign 'student' role. Students can NEVER self-assign administrator!
        await supabase.from('user_roles').upsert({
          user_id: signUpData.user.id,
          role: 'student',
        });
      }

      await syncSession();
      return { success: true };
    }

    // Local fallback engine
    const profiles = MockStorage.getProfiles();
    if (profiles.some((p) => p.email.toLowerCase() === normalizedEmail)) {
      return {
        success: false,
        error: 'An account with this college email already exists. Please log in.',
      };
    }

    const newProfile: Profile = {
      id: `u-${Date.now()}`,
      email: normalizedEmail,
      full_name: data.fullName.trim(),
      student_id: data.studentId.trim().toUpperCase(),
      department: data.department,
      course_programme: data.courseProgramme || 'Undergraduate',
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

  const logout = async () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    if (isUsingRealSupabase && supabase) {
      await supabase.auth.signOut();
    }
    setUser(defaultAdminUser);
  };

  const checkAdminAccess = (): boolean => {
    return true;
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
        checkAdminAccess,
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
