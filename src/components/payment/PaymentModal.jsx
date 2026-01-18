import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Sparkles, Check, Loader2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

const PACKAGES = [
    {
        id: '1_quota',
        name: '1 Kuota',
        price: 100000,
        quotaAmount: 1,
        description: 'Download 1 laporan wajib pajak',
        popular: false
    },
    {
        id: '5_quota',
        name: '5 Kuota',
        price: 350000,
        quotaAmount: 5,
        description: 'Download 5 laporan wajib pajak',
        popular: true,
        savings: 150000
    }
];

export default function PaymentModal({ isOpen, onClose, onSuccess }) {
    const { user } = useAuth();
    const [selectedPackage, setSelectedPackage] = useState(PACKAGES[1]); // Default to popular
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    const handlePayment = async () => {
        setLoading(true);
        setError('');

        try {
            // Call Supabase Edge Function to create DOKU payment
            const { data, error: fnError } = await supabase.functions.invoke('create-payment', {
                body: {
                    package_type: selectedPackage.id,
                    amount: selectedPackage.price,
                    quota_amount: selectedPackage.quotaAmount
                }
            });

            if (fnError) throw fnError;

            if (data?.payment_url) {
                // Redirect to DOKU Checkout
                window.location.href = data.payment_url;
            } else {
                throw new Error('Gagal mendapatkan URL pembayaran');
            }
        } catch (err) {
            console.error('Payment error:', err);
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
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Coins className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Beli Kuota</h2>
                                <p className="text-amber-100">Pilih paket yang sesuai kebutuhan Anda</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        {/* Error */}
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Package Selection */}
                        <div className="space-y-3">
                            {PACKAGES.map((pkg) => (
                                <motion.div
                                    key={pkg.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedPackage(pkg)}
                                    className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPackage.id === pkg.id
                                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'
                                        }`}
                                >
                                    {pkg.popular && (
                                        <div className="absolute -top-2 left-4 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            Paling Populer
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPackage.id === pkg.id
                                                    ? 'border-amber-500 bg-amber-500'
                                                    : 'border-slate-300 dark:border-slate-600'
                                                }`}>
                                                {selectedPackage.id === pkg.id && (
                                                    <Check className="w-3 h-3 text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-800 dark:text-white">
                                                    {pkg.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {pkg.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-slate-800 dark:text-white">
                                                {formatRupiah(pkg.price)}
                                            </p>
                                            {pkg.savings && (
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                                    Hemat {formatRupiah(pkg.savings)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Payment Info */}
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                <strong>Info:</strong> Pembayaran diproses melalui DOKU.
                                Tersedia berbagai metode pembayaran: QRIS, Virtual Account, E-Wallet, dan Kartu Kredit.
                            </p>
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <ExternalLink className="w-5 h-5" />
                                    <span>Bayar {formatRupiah(selectedPackage.price)}</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
