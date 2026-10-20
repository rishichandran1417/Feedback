import { createClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://uikhtcvqjfodbfnqqlak.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpa2h0Y3ZxamZvZGJmbnFxbGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NDcyNDQsImV4cCI6MjEwODAyMzI0NH0.CMZ4TnJ3sEEfr6nABtwf67JkTPX0IGfOmMVl9lDBo6k';

export function getSupabaseCredentials() {
  const envUrl = (
    (typeof import.meta !== 'undefined' && (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL)) ||
    ''
  ).trim();

  const envKey = (
    (typeof import.meta !== 'undefined' && (
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env.SUPABASE_ANON_KEY
    )) ||
    ''
  ).trim();

  let localUrl = '';
  let localKey = '';
  if (typeof window !== 'undefined') {
    localUrl = (localStorage.getItem('VITE_SUPABASE_URL') || '').trim();
    localKey = (
      localStorage.getItem('VITE_SUPABASE_ANON_KEY') ||
      localStorage.getItem('VITE_SUPABASE_PUBLISHABLE_KEY') ||
      ''
    ).trim();
  }

  const url = localUrl || envUrl || DEFAULT_SUPABASE_URL;
  const key = localKey || envKey || DEFAULT_SUPABASE_ANON_KEY;

  const isValid = Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    !url.includes('your-project') &&
    !url.includes('placeholder')
  );

  return { url, key, isValid };
}

const creds = getSupabaseCredentials();
export const supabaseUrl = creds.url;
export const supabasePublishableKey = creds.key;
export const isUsingRealSupabase = creds.isValid;

export const supabase = isUsingRealSupabase
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('VITE_SUPABASE_URL', url.trim());
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', key.trim());
    window.location.reload();
  }
}

export function clearSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('VITE_SUPABASE_URL');
    localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
    localStorage.removeItem('VITE_SUPABASE_PUBLISHABLE_KEY');
    window.location.reload();
  }
}

/**
 * Storage Helpers for private 'submission-evidence' bucket
 */
export async function uploadSubmissionEvidence(
  file: File,
  studentId: string,
  submissionId: string
): Promise<{ storage_path: string; error?: string }> {
  if (!isUsingRealSupabase || !supabase) {
    return { storage_path: '', error: 'Storage service is unavailable.' };
  }

  const fileExt = file.name.split('.').pop();
  const filePath = `${studentId}/${submissionId}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('submission-evidence')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Evidence upload error:', error);
    return { storage_path: '', error: error.message };
  }

  return { storage_path: data.path };
}

/**
 * Generate short-lived signed URL for private evidence download (expires in 60 seconds)
 */
export async function getSignedEvidenceUrl(storagePath: string): Promise<string | null> {
  if (!isUsingRealSupabase || !supabase) {
    return null;
  }

  const cleanPath = storagePath.replace(/^submission-evidence\//, '');
  const { data, error } = await supabase.storage
    .from('submission-evidence')
    .createSignedUrl(cleanPath, 60);

  if (error || !data?.signedUrl) {
    console.error('Failed to create signed URL:', error);
    return null;
  }

  return data.signedUrl;
}
