import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Profile, AppRole } from '../types/database';
import { MockStorage } from '../lib/mockStorage';
import { isUsingRealSupabase, supabase } from '../lib/supabase';

/**
 * Resolves the configured college email domain.
 * Supports VITE_COLLEGE_EMAIL_DOMAIN, VITE_ALLOWED_EMAIL_DOMAIN, and ALLOWED_EMAIL_DOMAIN.
 * Defaults to 'cet.ac.in'.
 */
export function getCollegeDomainConfig() {
  const rawDomain = (
    (typeof import.meta !== 'undefined' && (
      import.meta.env.VITE_COLLEGE_EMAIL_DOMAIN ||
      import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN ||
      import.meta.env.ALLOWED_EMAIL_DOMAIN
    )) ||
    'cet.ac.in'
  ).toLowerCase().trim();

  const cleanDomain = rawDomain.replace(/^@/, '');
  const domainWithAt = `@${cleanDomain}`;

  return { cleanDomain, domainWithAt };
}

export const { cleanDomain: COLLEGE_DOMAIN, domainWithAt: ALLOWED_EMAIL_DOMAIN } = getCollegeDomainConfig();

/**
 * Validates whether an email belongs to the institutional domain.
 * - Trims whitespace
 * - Case-insensitive
 * - Validates the full domain part (e.g. student@cet.ac.in or student@dept.cet.ac.in)
 * - Rejects partial substring matches like fakecet.ac.in
 */
export function isAllowedCollegeEmail(email: string | null | undefined, domain: string = COLLEGE_DOMAIN): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const atIndex = normalized.lastIndexOf('@');
  if (atIndex === -1 || atIndex === 0 || atIndex === normalized.length - 1) return false;

  const emailDomain = normalized.slice(atIndex + 1);
  const targetDomain = domain.replace(/^@/, '').toLowerCase().trim();

  return emailDomain === targetDomain || emailDomain.endsWith(`.${targetDomain}`);
}

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
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  syncSession: () => Promise<void>;
  allowedEmailDomain: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ait_auth_session_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync session strictly from real Supabase database
  const syncSession = useCallback(async () => {
    try {
      if (!isUsingRealSupabase || !supabase) {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }

      const authUserId = session.user.id;
      const userEmail = (session.user.email || '').toLowerCase().trim();

      // 1. Query user_roles table for authorized database role (trusted source of truth)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUserId)
        .maybeSingle();

      const isAdmin = roleData?.role === 'administrator';

      // When actively resolving on /auth/callback, don't execute premature logout
      if (typeof window !== 'undefined' && window.location.pathname === '/auth/callback') {
        return;
      }

      const isEmailVerified = Boolean(
        session.user.user_metadata?.email_verified === true ||
        session.user.user_metadata?.email_verified === 'true' ||
        session.user.email_confirmed_at
      );

      // Domain eligibility check: only pre-registered administrators or verified @cet.ac.in emails
      const isCollegeEmail = isAllowedCollegeEmail(userEmail, COLLEGE_DOMAIN);
      const isEligible = isAdmin || (isEmailVerified && isCollegeEmail);
      if (!isEligible) {
        console.warn(`User ${userEmail} does not match allowed domain ${ALLOWED_EMAIL_DOMAIN} or email is unverified`);
        await supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }

      // Requirement 7: Load role strictly from database. Never assume every user is a Student.
      // Testing case: Missing or invalid profile/role: does not default to Student.
      const dbRole: AppRole | null = roleData?.role || null;
      if (!dbRole) {
        console.warn(`User ${userEmail} has no valid role assigned in database.`);
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }

      // 2. Query profiles table
      let { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUserId)
        .maybeSingle();

      if (!profileData) {
        const rawMeta = session.user.user_metadata || {};
        const fullName = rawMeta.full_name || rawMeta.name || userEmail.split('@')[0];
        const avatarUrl = rawMeta.avatar_url || rawMeta.picture || '';
        const studentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;

        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert({
            id: authUserId,
            email: userEmail,
            full_name: fullName,
            student_id: studentId,
            department: dbRole === 'administrator' ? 'Central Grievance Redressal Cell' : 'General Studies',
            course_programme: dbRole === 'administrator' ? 'Administration' : 'Undergraduate',
            avatar_url: avatarUrl,
            is_active: true,
          })
          .select()
          .maybeSingle();

        profileData = newProfile;
      }

      if (!profileData || !profileData.is_active) {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }

      const authSession: AuthUser = {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        student_id: profileData.student_id,
        phone: profileData.phone,
        department: profileData.department,
        course_programme: profileData.course_programme,
        avatar_url: profileData.avatar_url,
        is_active: profileData.is_active ?? true,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
        role: dbRole,
      };

      setUser(authSession);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
    } catch (e) {
      console.error('Session sync error:', e);
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
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

  const loginAsStudent = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isAllowedCollegeEmail(normalizedEmail, COLLEGE_DOMAIN)) {
      return {
        success: false,
        error: `Access restricted. Please use your official college email address (${ALLOWED_EMAIL_DOMAIN})`,
      };
    }

    if (!isUsingRealSupabase || !supabase) {
      return {
        success: false,
        error: 'Authentication service is unavailable. Please check Supabase configuration.',
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const authedUserId = data?.user?.id;
    if (!authedUserId) {
      return { success: false, error: 'Authentication failed.' };
    }

    // Verify role strictly from database
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authedUserId)
      .maybeSingle();

    if (!roleData?.role) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Access denied: No role assigned to this account in the database.',
      };
    }

    await syncSession();
    return { success: true };
  };

  const loginAsAdmin = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!isUsingRealSupabase || !supabase) {
      return {
        success: false,
        error: 'Authentication service is unavailable. Please check Supabase configuration.',
      };
    }

    if (!normalizedEmail || !password) {
      return { success: false, error: 'Administrator email and password are required.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const authedUserId = data?.user?.id;
    if (!authedUserId) {
      return { success: false, error: 'Failed to authenticate user.' };
    }

    // Requirement 7: Load user role strictly from database; never grant admin privileges based on frontend
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authedUserId)
      .maybeSingle();

    if (roleData?.role !== 'administrator') {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Access denied: This account does not possess administrator privileges in the college database.',
      };
    }

    await syncSession();
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
    const normalizedEmail = data.email.trim().toLowerCase();
    if (!isAllowedCollegeEmail(normalizedEmail, COLLEGE_DOMAIN)) {
      return {
        success: false,
        error: `Invalid email domain. Please use your official college address ending in ${ALLOWED_EMAIL_DOMAIN}`,
      };
    }

    if (!isUsingRealSupabase || !supabase) {
      return {
        success: false,
        error: 'Registration service is unavailable. Please check Supabase configuration.',
      };
    }

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
      await supabase.from('profiles').upsert({
        id: signUpData.user.id,
        email: normalizedEmail,
        full_name: data.fullName.trim(),
        student_id: data.studentId.trim().toUpperCase(),
        department: data.department,
        course_programme: data.courseProgramme || 'Undergraduate',
        is_active: true,
      });

      await supabase.from('user_roles').upsert({
        user_id: signUpData.user.id,
        role: 'student',
      });
    }

    await syncSession();
    return { success: true };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isUsingRealSupabase || !supabase) {
      return {
        success: false,
        error: 'Authentication service is unavailable. Please check Supabase configuration.',
      };
    }

    const cleanDomain = COLLEGE_DOMAIN;
    const redirectUri = typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}/auth/callback`
      : 'https://feedback.rishichandran17.workers.dev/auth/callback';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline',
          hd: cleanDomain,
        },
      },
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('ait_auth_session');
    localStorage.removeItem('ait_auth_session_v2');
    if (isUsingRealSupabase && supabase) {
      await supabase.auth.signOut();
    }
  };

  const checkAdminAccess = (): boolean => {
    return user?.role === 'administrator';
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
        loginWithGoogle,
        syncSession,
        allowedEmailDomain: ALLOWED_EMAIL_DOMAIN,
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
