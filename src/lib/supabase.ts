import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

export const isUsingRealSupabase = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isUsingRealSupabase
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Storage Helpers for private 'submission-evidence' bucket
 */
export async function uploadSubmissionEvidence(
  file: File,
  studentId: string,
  submissionId: string
): Promise<{ storage_path: string; error?: string }> {
  if (!isUsingRealSupabase || !supabase) {
    // Return simulated path if local fallback
    return { storage_path: `submission-evidence/${studentId}/${Date.now()}_${file.name}` };
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
