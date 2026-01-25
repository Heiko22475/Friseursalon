import { createClient } from '@supabase/supabase-js';

// WICHTIG: Diese Werte musst du durch deine Supabase-Projekt-Daten ersetzen!
// Gehe zu: Supabase Dashboard → Project Settings → API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
