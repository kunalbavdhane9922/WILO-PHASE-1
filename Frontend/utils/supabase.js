import { createClient } from '@supabase/supabase-js';

// Get the URL and Anon Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;