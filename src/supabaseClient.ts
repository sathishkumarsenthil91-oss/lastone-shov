import { createClient } from "@supabase/supabase-js";

// ============================================================================
// PASTE YOUR SUPABASE URL AND PUBLIC KEY HERE:
// ============================================================================
export const SUPABASE_URL = "https://ikrmewchmenwnsfxssmp.supabase.co";
export const SUPABASE_PUBLIC_KEY = "sb_publishable_nz1fBclKnt7Vx8lG60VBVg_Wv9r9uyY";

// Normalize URL in case user pasted the REST endpoint URL
const projectUrl = SUPABASE_URL.endsWith("/rest/v1/") 
  ? SUPABASE_URL.replace("/rest/v1/", "") 
  : SUPABASE_URL;

// Create and export one Supabase client
export const supabase = createClient(projectUrl, SUPABASE_PUBLIC_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

/**
 * Google OAuth Login Function using Supabase Client
 */
export async function signInWithGoogle(redirectTo?: string) {
  const targetRedirect = redirectTo || (typeof window !== 'undefined' ? window.location.origin : '');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: targetRedirect,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  return { data, error };
}
