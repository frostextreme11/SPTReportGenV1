import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://khqihmvrmsezeuqmawtu.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocWlobXZybXNlemV1cW1hd3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDkyMDksImV4cCI6MjA4MzUyNTIwOX0.3MzAVZhTPtKwK-S3TKj295LxCfwf1V0_LgjHiZ225lA';

// PRODUCTION MODE - Set to false for real Supabase calls
export const MOCK_MODE = false;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Utility: Wrap promise with timeout
export const withTimeout = (promise, timeoutMs = 10000, errorMessage = 'Request timeout') => {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    });
    return Promise.race([promise, timeout]);
};

// Mock data (only used when MOCK_MODE = true)
export const mockUser = {
    id: 'mock-user-123',
    email: 'demo@buatspt.com',
    email_confirmed_at: new Date().toISOString()
};

export const mockProfile = {
    id: 'mock-user-123',
    email: 'demo@buatspt.com',
    full_name: 'Demo User',
    quota_balance: 5
};

export const mockReports = [];
