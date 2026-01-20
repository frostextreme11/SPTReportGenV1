import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { signIn, signUp, resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (activeTab === 'login') {
                const { error } = await signIn(email, password);
                if (error) throw error;
                onClose();
            } else if (activeTab === 'signup') {
                if (!fullName.trim()) {
                    throw new Error('Nama lengkap wajib diisi');
                }
                if (!phone.trim()) {
                    throw new Error('Nomor HP wajib diisi');
                }
                const { error } = await signUp(email, password, fullName, phone, companyName);
                if (error) throw error;
                setSuccess('Akun berhasil dibuat! Anda sekarang sudah login.');
                setTimeout(() => onClose(), 1500);
            } else if (activeTab === 'reset') {
                const { error } = await resetPassword(email);
                if (error) throw error;
                setSuccess('Link reset password telah dikirim ke email Anda.');
            }
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setFullName('');
        setPhone('');
        setCompanyName('');
        setError('');
        setSuccess('');
    };

    const switchTab = (tab) => {
        resetForm();
        setActiveTab(tab);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-bold">
                            {activeTab === 'login' && 'Masuk ke Akun'}
                            {activeTab === 'signup' && 'Buat Akun Baru'}
                            {activeTab === 'reset' && 'Reset Password'}
                        </h2>
                        <p className="text-emerald-100 mt-1">
                            {activeTab === 'login' && 'Akses dashboard dan laporan Anda'}
                            {activeTab === 'signup' && 'Daftar untuk menyimpan laporan'}
                            {activeTab === 'reset' && 'Kirim link reset ke email Anda'}
                        </p>
                    </div>

                    {/* Tabs - only show for login and signup */}
                    <div className="flex border-b border-slate-200 dark:border-slate-700">
                        {activeTab === 'reset' ? (
                            <div className="flex-1 py-3 text-center text-sm font-medium text-emerald-600">
                                Reset Password
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => switchTab('login')}
                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'login'
                                        ? 'text-emerald-600 border-b-2 border-emerald-500'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Masuk
                                </button>
                                <button
                                    onClick={() => switchTab('signup')}
                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'signup'
                                        ? 'text-emerald-600 border-b-2 border-emerald-500'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Daftar
                                </button>
                            </>
                        )}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400"
                            >
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </motion.div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-600 dark:text-emerald-400"
                            >
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                <p className="text-sm">{success}</p>
                            </motion.div>
                        )}

                        {/* Full Name (Signup only) */}
                        {activeTab === 'signup' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Nama Lengkap
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Nama lengkap Anda"
                                            className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Nomor HP (WhatsApp)
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Contoh: 081234567890"
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Digunakan untuk konfirmasi pembayaran</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Nama Perusahaan (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="PT / CV ..."
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@contoh.com"
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password (Not for reset) */}
                        {activeTab !== 'reset' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                {activeTab === 'signup' && (
                                    <p className="text-xs text-slate-500 mt-1">Minimal 6 karakter</p>
                                )}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <span>
                                    {activeTab === 'login' && 'Masuk'}
                                    {activeTab === 'signup' && 'Daftar'}
                                    {activeTab === 'reset' && 'Kirim Link Reset'}
                                </span>
                            )}
                        </button>

                        {/* Footer Links */}
                        <div className="text-center text-sm">
                            {activeTab === 'login' && (
                                <button
                                    type="button"
                                    onClick={() => switchTab('reset')}
                                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                                >
                                    Lupa password?
                                </button>
                            )}
                            {activeTab === 'reset' && (
                                <button
                                    type="button"
                                    onClick={() => switchTab('login')}
                                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                                >
                                    ← Kembali ke login
                                </button>
                            )}
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
