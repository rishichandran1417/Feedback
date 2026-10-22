-- Migration 10: Seed Website Maintenance Mode Setting in system_settings
INSERT INTO public.system_settings (key, value, description)
VALUES (
  'maintenance_mode',
  '{"enabled": false, "message": "This website is currently under maintenance. We are performing scheduled updates and will be back shortly.", "estimated_end": ""}'::jsonb,
  'Public portal maintenance mode toggle, announcement notice, and estimated completion'
)
ON CONFLICT (key) DO NOTHING;
