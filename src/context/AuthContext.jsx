import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);

                    // On sign in, sync localStorage data to Supabase
                    if (event === 'SIGNED_IN') {
                        await syncLocalDataToSupabase(session.user.id);
                    }
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (!error && data) {
            setProfile(data);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    const syncLocalDataToSupabase = async (userId) => {
        const STORAGE_KEY = 'siaplapor1771_formdata';
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
            try {
                const formData = JSON.parse(stored);

                // Only sync if there's meaningful data (has company name and NPWP)
                if (formData.namaPerusahaan && formData.npwp) {
                    // Check if this report already exists for this user
                    const { data: existing } = await supabase
                        .from('tax_reports')
                        .select('id')
                        .eq('user_id', userId)
                        .eq('npwp', formData.npwp)
                        .eq('tahun_pajak', formData.tahunPajak)
                        .single();

                    if (!existing) {
                        // Insert new report
                        await supabase.from('tax_reports').insert({
                            user_id: userId,
                            nama_wajib_pajak: formData.namaPerusahaan,
                            npwp: formData.npwp,
                            tahun_pajak: formData.tahunPajak || new Date().getFullYear().toString(),
                            form_data: formData,
                            is_download_unlocked: false
                        });
                    }
                }
            } catch (e) {
                console.error('Error syncing local data:', e);
            }
        }
    };

    const signUp = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });
        return { data, error };
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            setProfile(null);
        }
        return { error };
    };

    const resetPassword = async (email) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });
        return { data, error };
    };

    const value = {
        user,
        session,
        profile,
        loading,
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
