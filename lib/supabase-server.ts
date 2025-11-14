/**
 * Server-side Supabase client with service role key
 * Bypasses RLS for backend operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validate environment variables (only on server, not in browser)
if (typeof window === 'undefined') {
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    throw new Error(
      '❌ NEXT_PUBLIC_SUPABASE_URL is not set! Please add it to your .env file.'
    );
  }

  if (!supabaseServiceKey || supabaseServiceKey.includes('placeholder') || supabaseServiceKey.length < 100) {
    throw new Error(
      '❌ SUPABASE_SERVICE_ROLE_KEY is not set or invalid! Please add the service_role key (not anon key) from your Supabase dashboard.'
    );
  }
}

// Create a server-side client with service role key (bypasses RLS)
// Fallback values allow safe module loading in browser (where it's never used)
export const supabaseServer = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
