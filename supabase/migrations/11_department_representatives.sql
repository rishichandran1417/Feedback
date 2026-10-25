-- Migration 11: Transition all departments from officer/faculty titles to student Department Representatives

UPDATE public.departments
SET head_of_department = 'Department Representative',
    contact_email = CASE 
      WHEN code = 'ACAD' THEN 'acad.rep@cet.ac.in'
      WHEN code = 'FACIL' THEN 'facilities.rep@cet.ac.in'
      WHEN code = 'IT-SYS' THEN 'it.rep@cet.ac.in'
      WHEN code = 'HOSTEL' THEN 'hostel.rep@cet.ac.in'
      WHEN code = 'FIN-AID' THEN 'accounts.rep@cet.ac.in'
      WHEN code = 'EXAM' THEN 'exam.rep@cet.ac.in'
      ELSE contact_email
    END
WHERE head_of_department ILIKE '%Dr.%'
   OR head_of_department ILIKE '%Prof.%'
   OR head_of_department ILIKE '%Eng.%'
   OR head_of_department ILIKE '%Officer%'
   OR head_of_department ILIKE '%Bursar%'
   OR head_of_department ILIKE '%Vance%'
   OR head_of_department ILIKE '%Brody%'
   OR head_of_department ILIKE '%Wright%'
   OR head_of_department ILIKE '%Menon%'
   OR head_of_department ILIKE '%Sterling%'
   OR head_of_department ILIKE '%Lin%'
   OR head_of_department IS NULL;

-- Ensure student representative emails are allowed administrative access if needed
INSERT INTO public.admin_whitelist (email)
VALUES 
  ('acad.rep@cet.ac.in'),
  ('facilities.rep@cet.ac.in'),
  ('it.rep@cet.ac.in'),
  ('hostel.rep@cet.ac.in'),
  ('accounts.rep@cet.ac.in'),
  ('exam.rep@cet.ac.in')
ON CONFLICT (email) DO NOTHING;

