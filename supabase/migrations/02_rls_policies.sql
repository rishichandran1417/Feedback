-- Migration 02: Row Level Security (RLS) Policies & Authorization Functions
-- Security First Architecture

-- Enable RLS on all sensitive tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if the current executing user has the 'administrator' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'administrator'
  );
$$;

-- Helper Function: Check if user is active
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
  );
$$;

-- 1. Profiles Policies
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- 2. User Roles Policies (Students cannot modify their roles)
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin());

-- Safeguard: Prevent deleting the last active administrator
CREATE OR REPLACE FUNCTION public.prevent_last_admin_removal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.role = 'administrator' AND (TG_OP = 'DELETE' OR NEW.role != 'administrator') THEN
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'administrator' AND user_id != OLD.user_id) < 1 THEN
      RAISE EXCEPTION 'Cannot remove the last active administrator in the system.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_last_admin_removal
BEFORE UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.prevent_last_admin_removal();

-- 3. Departments Policies
CREATE POLICY "Authenticated users can view active departments"
  ON public.departments FOR SELECT
  USING (auth.role() = 'authenticated' AND (is_active = true OR public.is_admin()));

CREATE POLICY "Admins can insert/update departments"
  ON public.departments FOR ALL
  USING (public.is_admin());

-- 4. Categories Policies
CREATE POLICY "Authenticated users can view active categories"
  ON public.categories FOR SELECT
  USING (auth.role() = 'authenticated' AND (is_active = true OR public.is_admin()));

CREATE POLICY "Admins can insert/update categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- 5. Submissions Policies
CREATE POLICY "Students can view own submissions"
  ON public.submissions FOR SELECT
  USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Students can create submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (
    student_id = auth.uid() AND
    public.is_active_user() AND
    status = 'submitted' AND
    assigned_to IS NULL AND
    resolution_date IS NULL AND
    resolution_summary IS NULL
  );

CREATE POLICY "Admins can update submissions"
  ON public.submissions FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. Attachments Policies
CREATE POLICY "Students can view attachments of own submissions"
  ON public.submission_attachments FOR SELECT
  USING (
    uploaded_by = auth.uid() OR
    public.is_admin() OR
    submission_id IN (SELECT id FROM public.submissions WHERE student_id = auth.uid())
  );

CREATE POLICY "Students can upload attachments to own submissions"
  ON public.submission_attachments FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid() AND
    submission_id IN (SELECT id FROM public.submissions WHERE student_id = auth.uid())
  );

CREATE POLICY "Admins can manage attachments"
  ON public.submission_attachments FOR ALL
  USING (public.is_admin());

-- 7. Submission Messages Policies (CRITICAL: Internal notes hidden from students!)
CREATE POLICY "Students can read non-internal messages of own submissions"
  ON public.submission_messages FOR SELECT
  USING (
    public.is_admin() OR
    (
      is_internal = false AND
      submission_id IN (SELECT id FROM public.submissions WHERE student_id = auth.uid())
    )
  );

CREATE POLICY "Students can post replies to own submissions"
  ON public.submission_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    is_internal = false AND
    message_type = 'student_reply' AND
    submission_id IN (SELECT id FROM public.submissions WHERE student_id = auth.uid())
  );

CREATE POLICY "Admins can post and view all messages"
  ON public.submission_messages FOR ALL
  USING (public.is_admin());

-- 8. Status History Policies
CREATE POLICY "Users can view status history of own submissions"
  ON public.submission_status_history FOR SELECT
  USING (
    public.is_admin() OR
    submission_id IN (SELECT id FROM public.submissions WHERE student_id = auth.uid())
  );

CREATE POLICY "Admins can insert status history"
  ON public.submission_status_history FOR INSERT
  WITH CHECK (public.is_admin());

-- 9. Notifications Policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can mark own notifications as read"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can dispatch notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- 10. System Settings Policies
CREATE POLICY "Authenticated users can read system settings"
  ON public.system_settings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update system settings"
  ON public.system_settings FOR ALL
  USING (public.is_admin());
