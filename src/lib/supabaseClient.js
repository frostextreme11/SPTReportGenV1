import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://khqihmvrmsezeuqmawtu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocWlobXZybXNlemV1cW1hd3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDkyMDksImV4cCI6MjA4MzUyNTIwOX0.3MzAVZhTPtKwK-S3TKj295LxCfwf1V0_LgjHiZ225lA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
