-- Migration 08: Administrator Authorization & Role Management
-- Database: PostgreSQL (Supabase)

-- 1. Helper function for database administrators / project owners to promote an account to administrator securely
CREATE OR REPLACE FUNCTION public.grant_admin_role(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  v_email := LOWER(TRIM(p_email));

  -- Look up user in auth.users or public.profiles
  SELECT id INTO v_user_id FROM auth.users WHERE LOWER(TRIM(email)) = v_email;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM public.profiles WHERE LOWER(TRIM(email)) = v_email;
  END IF;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('User with email %s not found in auth.users or profiles. Please ensure the user has signed in at least once via Google OAuth before promoting.', v_email)
    );
  END IF;

  -- Insert or update user_roles with authoritative administrator role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'administrator'::public.app_role)
  ON CONFLICT (user_id) DO UPDATE SET role = 'administrator';

  -- Update profile department and course_programme to reflect administrator status
  UPDATE public.profiles
  SET department = 'Central Grievance Redressal Cell',
      course_programme = 'Administration',
      updated_at = NOW()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', v_email,
    'role', 'administrator',
    'message', format('Successfully granted administrator role to %s', v_email)
  );
END;
$$;

-- 2. Optional: Helper function to demote an administrator to student (with last admin safety guard)
CREATE OR REPLACE FUNCTION public.revoke_admin_role(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  v_email := LOWER(TRIM(p_email));

  SELECT id INTO v_user_id FROM public.profiles WHERE LOWER(TRIM(email)) = v_email;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', format('User with email %s not found.', v_email));
  END IF;

  -- Safeguard: ensure we don't revoke the last administrator
  IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'administrator' AND user_id != v_user_id) < 1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot revoke the last remaining administrator in the system.');
  END IF;

  UPDATE public.user_roles
  SET role = 'student'::public.app_role
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', v_email,
    'role', 'student',
    'message', format('Successfully updated role to student for %s', v_email)
  );
END;
$$;

-- 3. Initial Admin Whitelist Table (Allows pre-registering administrator emails before first Google login)
CREATE TABLE IF NOT EXISTS public.admin_whitelist (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view whitelist" ON public.admin_whitelist;
CREATE POLICY "Admins can view whitelist"
  ON public.admin_whitelist FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage whitelist" ON public.admin_whitelist;
CREATE POLICY "Admins can manage whitelist"
  ON public.admin_whitelist FOR ALL
  USING (public.is_admin());

-- Pre-seed known faculty administrative emails
INSERT INTO public.admin_whitelist (email)
VALUES 
  ('dean.academics@cet.ac.in'),
  ('principal@cet.ac.in')
ON CONFLICT (email) DO NOTHING;

-- 4. Update handle_new_user() trigger function so that designated initial administrators receive 'administrator'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_email_verified BOOLEAN;
  v_full_name TEXT;
  v_avatar_url TEXT;
  v_student_id TEXT;
  v_allowed_domain TEXT := 'cet.ac.in';
  v_is_admin BOOLEAN := false;
  v_target_role public.app_role := 'student'::public.app_role;
BEGIN
  v_email := LOWER(TRIM(NEW.email));

  -- Check if email is verified by OAuth provider
  v_email_verified := COALESCE(
    (NEW.raw_user_meta_data->>'email_verified')::BOOLEAN,
    NEW.email_confirmed_at IS NOT NULL,
    false
  );

  -- Check if user is pre-registered administrator in user_roles or in admin_whitelist
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.id AND role = 'administrator'
  ) OR EXISTS (
    SELECT 1 FROM public.admin_whitelist
    WHERE LOWER(TRIM(email)) = v_email
  ) OR v_email LIKE 'dean.%@cet.ac.in' OR v_email LIKE 'principal%@cet.ac.in' THEN
    v_is_admin := true;
    v_target_role := 'administrator'::public.app_role;
  END IF;

  -- ENFORCE ON SERVER: Allow login only if email_verified is true AND email belongs to allowed college domain
  IF NOT v_is_admin THEN
    IF NOT v_email_verified THEN
      RAISE EXCEPTION 'Access rejected: OAuth email address is not verified by identity provider.'
        USING ERRCODE = '28000';
    END IF;

    -- Normalize and check full domain (e.g. @cet.ac.in or @dept.cet.ac.in)
    IF NOT (v_email LIKE '%@' || v_allowed_domain OR v_email LIKE '%.' || v_allowed_domain) THEN
      RAISE EXCEPTION 'Access rejected: Email % does not belong to authorized college domain %', v_email, v_allowed_domain
        USING ERRCODE = '28000';
    END IF;
  END IF;

  -- Extract user profile attributes
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(v_email, '@', 1)
  );

  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    ''
  );

  v_student_id := COALESCE(
    NEW.raw_user_meta_data->>'student_id',
    CASE WHEN v_is_admin THEN 'FAC-' || FLOOR(100 + RANDOM() * 900)::TEXT
         ELSE 'STU-' || FLOOR(1000 + RANDOM() * 9000)::TEXT
    END
  );

  -- Insert profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    student_id,
    avatar_url,
    department,
    course_programme,
    is_active
  )
  VALUES (
    NEW.id,
    v_email,
    v_full_name,
    v_student_id,
    v_avatar_url,
    CASE WHEN v_is_admin THEN 'Central Grievance Redressal Cell' ELSE 'General Studies' END,
    CASE WHEN v_is_admin THEN 'Administration' ELSE 'Undergraduate' END,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), public.profiles.avatar_url),
    updated_at = NOW();

  -- Assign target role (administrator if whitelisted, otherwise student)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_target_role)
  ON CONFLICT (user_id) DO UPDATE SET
    role = CASE WHEN public.user_roles.role = 'administrator' THEN 'administrator'::public.app_role ELSE EXCLUDED.role END;

  RETURN NEW;
END;
$$;
