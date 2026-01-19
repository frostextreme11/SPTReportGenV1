import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Unlock, Coins, AlertCircle, Loader2, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, MOCK_MODE, mockProfile, withTimeout } from '../../lib/supabaseClient';
import { useFormData } from '../../context/FormContext';

export default function UnlockDownloadModal({ isOpen, onClose, onUnlocked, onBuyQuota }) {
    const { user, profile, refreshProfile } = useAuth();
    const { currentReportId, setDownloadUnlocked } = useFormData();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const quotaBalance = profile?.quota_balance || 0;
    const hasQuota = quotaBalance > 0;

    const handleUnlock = async () => {
        if (!hasQuota) return;

        setLoading(true);
        setError('');

        try {
            // MOCK MODE - directly unlock without database
            if (MOCK_MODE) {
                console.log('[UnlockDownloadModal] MOCK_MODE - simulating unlock');
                mockProfile.quota_balance -= 1;
                await new Promise(resolve => setTimeout(resolve, 500));
                await setDownloadUnlocked();
                await refreshProfile();
                onUnlocked();
                onClose();
                setLoading(false);
                return;
            }

            // REAL MODE - Deduct quota and unlock report
            console.log('[UnlockDownloadModal] Unlocking report:', currentReportId);

            // 1. Deduct 1 quota from user profile
            const newBalance = quotaBalance - 1;
            const { error: updateProfileError } = await withTimeout(
                supabase
                    .from('profiles')
                    .update({ quota_balance: newBalance })
                    .eq('id', user.id),
                8000,
                'Gagal mengurangi kuota'
            );

            if (updateProfileError) throw updateProfileError;

            // 2. Mark report as download unlocked (if we have a report ID)
            if (currentReportId) {
                const { error: updateReportError } = await withTimeout(
                    supabase
                        .from('tax_reports')
                        .update({ is_download_unlocked: true })
                        .eq('id', currentReportId),
                    8000,
                    'Gagal membuka akses download'
                );

                if (updateReportError) {
                    // Rollback quota deduction
                    await supabase
                        .from('profiles')
                        .update({ quota_balance: quotaBalance })
                        .eq('id', user.id);
                    throw updateReportError;
                }

                // 3. Log the transaction
                await supabase.from('quota_transactions').insert({
                    user_id: user.id,
                    transaction_type: 'usage',
                    amount: -1,
                    report_id: currentReportId,
                });
            }

            // 4. Update local state
            await setDownloadUnlocked();
            await refreshProfile();

            console.log('[UnlockDownloadModal] Unlock successful');
            onUnlocked();
            onClose();

        } catch (err) {
            console.error('[UnlockDownloadModal] Error:', err);
            setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
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
                    <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Unlock className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Buka Akses Download</h2>
                                <p className="text-purple-100">Gunakan kuota untuk download</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Quota Balance */}
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Saldo Kuota Anda</span>
                                <div className="flex items-center gap-2">
                                    <Coins className="w-5 h-5 text-amber-500" />
                                    <span className="text-2xl font-bold text-slate-800 dark:text-white">
                                        {quotaBalance}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {hasQuota ? (
                            <>
                                <div className="text-center py-2">
                                    <p className="text-slate-600 dark:text-slate-300">
                                        Gunakan <strong>1 kuota</strong> untuk membuka akses download
                                        <br />
                                        <span className="text-sm text-slate-500">
                                            (Download sepuasnya untuk laporan ini)
                                        </span>
                                    </p>
                                </div>

                                <button
                                    onClick={handleUnlock}
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Unlock className="w-5 h-5" />
                                            <span>Gunakan 1 Kuota & Buka Akses</span>
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Coins className="w-8 h-8 text-amber-500" />
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 mb-1">
                                        Kuota Anda habis
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Beli kuota untuk membuka akses download
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        onClose();
                                        onBuyQuota();
                                    }}
                                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    <span>Beli Kuota</span>
                                </button>
                            </>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
