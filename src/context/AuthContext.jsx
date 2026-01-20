import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, MOCK_MODE, mockUser, mockProfile, withTimeout } from '../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        // MOCK MODE - immediately set mock user without Supabase
        if (MOCK_MODE) {
            console.log('[AuthContext] MOCK_MODE enabled - using mock user');
            setUser(mockUser);
            setSession({ user: mockUser });
            setProfile(mockProfile);
            setLoading(false);
            return;
        }

        // REAL MODE - Get initial session from Supabase
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
            } catch (error) {
                console.error('[AuthContext] Init error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log('[AuthContext] Auth state changed:', event);
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    // Fetch profile in background - don't await/block
                    fetchProfile(session.user.id);

                    // On sign in, sync localStorage data to Supabase in background
                    // DISABLED: Causing duplicate reports on refresh due to race conditions/matching issues
                    // if (event === 'SIGNED_IN') {
                    //     syncLocalDataToSupabase(session.user.id).catch(err =>
                    //         console.log('[AuthContext] Background sync warning:', err)
                    //     );
                    // }
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        if (MOCK_MODE) {
            setProfile(mockProfile);
            return;
        }

        // Optimization: If profile is already loaded for this user, skip fetch
        if (profile && profile.id === userId) {
            console.log('[AuthContext] Profile already loaded for', userId);
            return;
        }

        try {
            console.log('[AuthContext] Fetching profile for', userId);
            const { data, error } = await withTimeout(
                supabase
                    .from('profiles')
                    .select('id, full_name, email, quota_balance')
                    .eq('id', userId)
                    .single(),
                3000, // Reduced to 3s
                'Profile fetch slow'
            );

            if (!error && data) {
                setProfile(data);
                console.log('[AuthContext] Profile loaded');
            } else if (error) {
                console.log('[AuthContext] Profile fetch warning:', error.message);
            }
        } catch (err) {
            console.log('[AuthContext] Profile fetch info:', err.message);
            // Non-critical, just continue
        }
    };

    const refreshProfile = async () => {
        if (MOCK_MODE) {
            setProfile({ ...mockProfile });
            return;
        }

        if (user) {
            // Force fetch even if loaded
            setProfile(prev => prev ? { ...prev } : null); // Trigger duplicate check skip? No, we probably want to force it.
            // Actually, for refreshProfile we DO want to ignoring the cache check.
            // But since fetchProfile has the check, we need to bypass it or reset.
            // Let's simpler: just call the internal fetch logic directly or make fetchProfile take a 'force' arg.
            // For now, let's just clear profile temporarily to force fetch, or duplicate logic.
            // Cleaner: separate the actual fetch logic.

            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (data) setProfile(data);
            } catch (e) {
                console.error('Refresh profile failed', e);
            }
        }
    };

    const syncLocalDataToSupabase = async (userId) => {
        if (MOCK_MODE) return;

        const STORAGE_KEY = 'siaplapor1771_formdata';
        const REPORT_ID_KEY = 'siaplapor1771_currentReportId';
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
            try {
                const formData = JSON.parse(stored);
                if (!formData.namaPerusahaan || !formData.npwp) return;

                // Check if report exists for this user with same NPWP and tahunPajak
                const { data: existingReport } = await withTimeout(
                    supabase
                        .from('tax_reports')
                        .select('id')
                        .eq('user_id', userId)
                        .eq('npwp', formData.npwp)
                        .eq('tahun_pajak', formData.tahunPajak)
                        .maybeSingle(),
                    8000
                );

                if (existingReport) {
                    // Update existing report
                    await supabase
                        .from('tax_reports')
                        .update({
                            nama_wajib_pajak: formData.namaPerusahaan,
                            form_data: formData,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existingReport.id);

                    localStorage.setItem(REPORT_ID_KEY, existingReport.id);
                } else {
                    // Insert new report
                    const { data: newReport } = await supabase
                        .from('tax_reports')
                        .insert({
                            user_id: userId,
                            nama_wajib_pajak: formData.namaPerusahaan,
                            npwp: formData.npwp,
                            tahun_pajak: formData.tahunPajak,
                            form_data: formData,
                            is_download_unlocked: false
                        })
                        .select()
                        .single();

                    if (newReport) {
                        localStorage.setItem(REPORT_ID_KEY, newReport.id);
                    }
                }
            } catch (error) {
                console.error('[AuthContext] Error syncing data:', error);
            }
        }
    };

    const signUp = async (email, password, fullName, phone, companyName) => {
        if (MOCK_MODE) {
            setUser(mockUser);
            setSession({ user: mockUser });
            setProfile({ ...mockProfile, full_name: fullName, email, phone, company_name: companyName });
            return { data: { user: mockUser }, error: null };
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                    company_name: companyName,
                    // Additional metadata for Mayar/Billing
                    billing_name: fullName,
                    billing_phone: phone
                }
            }
        });
        return { data, error };
    };

    const signIn = async (email, password) => {
        if (MOCK_MODE) {
            setUser(mockUser);
            setSession({ user: mockUser });
            setProfile({ ...mockProfile, email });
            return { data: { user: mockUser }, error: null };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    };

    const signOut = async () => {
        if (MOCK_MODE) {
            setUser(null);
            setSession(null);
            setProfile(null);
            return;
        }

        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setProfile(null);
    };

    const resetPassword = async (email) => {
        if (MOCK_MODE) {
            return { data: {}, error: null };
        }

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });
        return { data, error };
    };

    const value = {
        user,
        session,
        loading,
        profile,
        signUp,
        signIn,
        signOut,
        resetPassword,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
