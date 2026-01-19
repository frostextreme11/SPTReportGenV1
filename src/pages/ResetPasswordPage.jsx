import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase, withTimeout } from '../lib/supabaseClient';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        // Check if we have a session (user clicked the email link)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            console.log('[ResetPassword] Session check:', session ? 'Found' : 'Not Found');
            if (!session) {
                setStatus({
                    type: 'error',
                    message: 'Link reset password tidak valid atau sudah kadaluarsa. Silakan minta link baru.'
                });
            }
        };
        checkSession();
    }, []);

    const handleReset = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Password tidak sama' });
            return;
        }

        if (password.length < 6) {
            setStatus({ type: 'error', message: 'Password minimal 6 karakter' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            console.log('[ResetPassword] Attempting update...');

            // Double check session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Sesi kadaluarsa. Silakan ulangi proses reset password.');

            const { error } = await withTimeout(
                supabase.auth.updateUser({
                    password: password
                }),
                10000,
                'Koneksi timeout. Silakan coba lagi.'
            );

            if (error) throw error;

            console.log('[ResetPassword] Update success');
            setStatus({
                type: 'success',
                message: 'Password berhasil diubah! Mengalihkan ke dashboard...'
            });

            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (error) {
            console.error('[ResetPassword] Error:', error);
            setStatus({
                type: 'error',
                message: error.message || 'Gagal mengubah password'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Reset Password</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Masukkan password baru untuk akun Anda
                        </p>
                    </div>

                    {status.message && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${status.type === 'success'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                }`}
                        >
                            {status.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            )}
                            <p className="text-sm font-medium">{status.message}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleReset} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Password Baru
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                                    placeholder="Minimal 6 karakter"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Konfirmasi Password
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                                placeholder="Ulangi password baru"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || (status.type === 'error' && !password)}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-slate-500 hover:text-emerald-500 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Halaman Utama
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
