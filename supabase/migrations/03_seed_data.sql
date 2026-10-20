-- Migration 03: Seed Data for Demonstration Departments, Categories, and Settings

-- 1. Insert Initial System Settings
INSERT INTO public.system_settings (key, value, description)
VALUES 
  ('college_info', '{"name": "Apex Institute of Technology", "code": "AIT", "support_email": "grievance@college.edu", "portal_url": "https://feedback.college.edu"}'::jsonb, 'College metadata and portal configuration'),
  ('auth_config', '{"allowed_email_domain": "@college.edu", "require_email_verification": true}'::jsonb, 'Configurable student college email domain validation'),
  ('file_upload_limits', '{"max_file_size_mb": 10, "allowed_extensions": [".jpg", ".jpeg", ".png", ".pdf", ".docx"]}'::jsonb, 'Attachment upload security limits'),
  ('workflow_rules', '{"allow_anonymous": true, "enable_reopening": true, "reopen_window_days": 14}'::jsonb, 'Grievance lifecycle configuration'),
  ('email_provider_config', '{"provider": "resend", "sender_name": "Apex College Grievance Cell", "sender_email": "notifications@college.edu", "enabled_events": ["submission_acknowledgement", "status_update", "issue_resolved", "issue_reopened", "admin_reply", "info_request"]}'::jsonb, 'Transactional email dispatch rules')
ON CONFLICT (key) DO NOTHING;

-- 2. Insert Core Academic & Campus Departments
INSERT INTO public.departments (id, name, code, contact_email, head_of_department, is_active)
VALUES
  ('d1111111-1111-1111-1111-111111111111', 'Academic Affairs', 'ACAD', 'dean.academics@college.edu', 'Dr. Alistair Vance', true),
  ('d2222222-2222-2222-2222-222222222222', 'Facilities & Campus Infrastructure', 'FACIL', 'estate.manager@college.edu', 'Eng. Marcus Brody', true),
  ('d3333333-3333-3333-3333-333333333333', 'IT Services & Campus Network', 'IT-SYS', 'helpdesk@college.edu', 'Sarah Lin, Chief IT Officer', true),
  ('d4444444-4444-4444-4444-444444444444', 'Hostel & Residential Life', 'HOSTEL', 'warden.office@college.edu', 'Dr. Kavita Menon', true),
  ('d5555555-5555-5555-5555-555555555555', 'Financial Aid & Student Accounts', 'FIN-AID', 'accounts@college.edu', 'Robert Sterling, Bursar', true),
  ('d6666666-6666-6666-6666-666666666666', 'Examination & Records Cell', 'EXAM', 'coe@college.edu', 'Prof. Eleanor Wright', true)
ON CONFLICT (code) DO NOTHING;

-- 3. Insert Demonstration Categories with SLA Targets
INSERT INTO public.categories (id, name, description, department_id, target_resolution_days, is_active)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Course Registration & Timetables', 'Issues with course enrollments, class conflicts, syllabus updates, or faculty scheduling.', 'd1111111-1111-1111-1111-111111111111', 3, true),
  ('c2222222-2222-2222-2222-222222222222', 'Classroom & Laboratory Equipment', 'Faulty AV projectors, broken laboratory apparatus, malfunctioning air conditioning.', 'd2222222-2222-2222-2222-222222222222', 2, true),
  ('c3333333-3333-3333-3333-333333333333', 'Campus WiFi & LMS Access', 'Campus Wi-Fi connectivity degradation, student portal login failures, or online test access.', 'd3333333-3333-3333-3333-333333333333', 1, true),
  ('c4444444-4444-4444-4444-444444444444', 'Hostel Maintenance & Mess Food', 'Hostel room repairs, plumbing/water availability, cleanliness, or cafeteria/mess dietary standards.', 'd4444444-4444-4444-4444-444444444444', 2, true),
  ('c5555555-5555-5555-5555-555555555555', 'Scholarship & Fee Disbursements', 'Tuition receipt discrepancies, delayed scholarship credit, refund processing.', 'd5555555-5555-5555-5555-555555555555', 7, true),
  ('c6666666-6666-6666-6666-666666666666', 'Grade Discrepancies & Transcripts', 'Delays in grade cards, re-evaluation submissions, or official degree transcript requests.', 'd6666666-6666-6666-6666-666666666666', 5, true)
ON CONFLICT (name, department_id) DO NOTHING;
