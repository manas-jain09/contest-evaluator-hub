
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nohnpvajrckxgvbotyex.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vaG5wdmFqcmNreGd2Ym90eWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3Njk2MTIsImV4cCI6MjA1NzM0NTYxMn0.WFs88RPgY3F_k54EIksz_ih9VoKPGuSNUXtBEwpOFqY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Configure realtime subscription for the practice_contest_results table
const configureRealtime = async () => {
  // Enable realtime for test tables
  const { error } = await supabase
    .from('practice_contest_results')
    .select('id')
    .limit(1);

  if (error) {
    console.error("Error configuring realtime:", error);
  }
};

// Initialize realtime subscriptions
configureRealtime();
