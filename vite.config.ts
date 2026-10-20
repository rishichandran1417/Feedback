import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5174,
      strictPort: true,
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
        env.VITE_SUPABASE_URL || 'https://uikhtcvqjfodbfnqqlak.supabase.co'
      ),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
        env.VITE_SUPABASE_ANON_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpa2h0Y3ZxamZvZGJmbnFxbGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NDcyNDQsImV4cCI6MjEwODAyMzI0NH0.CMZ4TnJ3sEEfr6nABtwf67JkTPX0IGfOmMVl9lDBo6k'
      ),
      'import.meta.env.VITE_COLLEGE_EMAIL_DOMAIN': JSON.stringify(
        env.VITE_COLLEGE_EMAIL_DOMAIN || 'cet.ac.in'
      ),
      'import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN': JSON.stringify(
        env.VITE_ALLOWED_EMAIL_DOMAIN || '@cet.ac.in'
      ),
    },
  };
});

