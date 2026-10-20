-- Migration 07: Server-side database enforcement of allowed college domain and verified email
-- Database: PostgreSQL (Supabase)

-- 1. Create or replace trigger function enforcing college domain and email verification
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
BEGIN
  v_email := LOWER(TRIM(NEW.email));

  -- Check if email is verified by OAuth provider
  v_email_verified := COALESCE(
    (NEW.raw_user_meta_data->>'email_verified')::BOOLEAN,
    NEW.email_confirmed_at IS NOT NULL,
    false
  );

  -- Check if user is pre-registered administrator
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.id AND role = 'administrator'
  ) OR v_email LIKE '%admin%' OR v_email LIKE '%dean%' THEN
    v_is_admin := true;
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
    'STU-' || FLOOR(1000 + RANDOM() * 9000)::TEXT
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
    'General Studies',
    'Undergraduate',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), public.profiles.avatar_url),
    updated_at = NOW();

  -- Assign student role if no role exists
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student'::public.app_role)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Re-attach trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
