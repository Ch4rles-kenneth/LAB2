/**
 * Supabase Client — Phase 8: History Persistence
 *
 * Initializes the Supabase JS client for use across the app.
 * 
 * react-native-url-polyfill must be imported FIRST (before supabase-js)
 * because the Supabase client uses the standard URL API internally which is
 * not available in the Hermes/JSC JavaScript engines used by React Native.
 */
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn(
    'WARNING: EXPO_PUBLIC_SUPABASE_URL is not set. ' +
    'History saving will not work until you add a valid Supabase project URL to .env.'
  );
}

if (!supabaseKey || supabaseKey === 'your_supabase_publishable_key_here') {
  console.warn(
    'WARNING: EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set. ' +
    'History saving will not work until you add a valid publishable key to .env.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
