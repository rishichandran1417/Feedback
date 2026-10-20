-- Migration 06: Auto-provision profiles and student roles on OAuth registration
-- Database: PostgreSQL (Supabase)

-- 1. Ensure RLS policies allow authenticated users to self-provision their own profile and student role
DO $$
BEGIN
    -- Allow authenticated users to insert their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile"
        ON public.profiles FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = id);
    END IF;

    -- Allow authenticated users to insert their own student role
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' AND policyname = 'Users can insert own student role'
    ) THEN
        CREATE POLICY "Users can insert own student role"
        ON public.user_roles FOR INSERT
        TO authenticated
        WITH CHECK (user_id = auth.uid() AND role = 'student');
    END IF;
END
$$;

-- 2. Trigger Function to automatically create profile and assign student role for new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_avatar_url TEXT;
  v_student_id TEXT;
BEGIN
  -- Extract full name from Google metadata or email prefix
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Extract avatar URL from Google OAuth
  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    ''
  );

  -- Generate default student ID
  v_student_id := COALESCE(
    NEW.raw_user_meta_data->>'student_id',
    'STU-' || FLOOR(1000 + RANDOM() * 9000)::TEXT
  );

  -- Insert or update profile
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
    LOWER(NEW.email),
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

  -- Insert student role if not already assigned an administrative role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student'::public.app_role)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Recreate trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
