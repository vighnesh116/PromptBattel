import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url_here') {
  console.warn(
    '[RESQ-AI] Supabase URL not configured. Using demo mode. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = (): boolean => {
  return !!(
    supabaseUrl &&
    supabaseUrl !== 'your_supabase_project_url_here' &&
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'your_supabase_anon_key_here' &&
    supabaseAnonKey !== 'placeholder_anon_key' &&
    supabaseAnonKey !== 'placeholder'
  );
};

