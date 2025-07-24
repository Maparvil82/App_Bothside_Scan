import { createClient } from '@supabase/supabase-js';

// Reemplaza estos valores con los de tu proyecto Supabase
const SUPABASE_URL = 'https://jbzafvoavdbcwfgoyrzl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiemFmdm9hdmRiY3dmZ295cnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjAwNDcsImV4cCI6MjA1ODA5NjA0N30.NJbOMzab6whafcIRiMru6O7zyABwKkD6UL9_8ENOfqY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 