import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Sparkles, Check, Loader2, ExternalLink, CreditCard, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, MOCK_MODE, mockProfile, withTimeout, supabaseUrl, supabaseAnonKey } from '../../lib/supabaseClient';

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

const PAYMENT_METHODS = [
    // {
    //     id: 'mayar',
    //     name: 'QRIS / E-Wallet / VA',
    //     description: 'Pembayaran instan via Mayar',
    //     icon: Wallet,
    //     recommended: true
    // },
    {
        id: 'mayar_sandbox',
        name: 'QRIS / E-Wallet / VA (Mayar V2)',
        description: 'Pembayaran dengan redirect verification',
        icon: CreditCard,
        recommended: false
    }
];

export default function PaymentModal({ isOpen, onClose, onSuccess }) {
    const { user, refreshProfile } = useAuth();
    const [selectedPackage, setSelectedPackage] = useState(PACKAGES[1]);
    const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
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
            // MOCK MODE - directly add quota without payment
            if (MOCK_MODE) {
                console.log('[PaymentModal] MOCK_MODE - simulating payment success');
                mockProfile.quota_balance += selectedPackage.quotaAmount;

                await new Promise(resolve => setTimeout(resolve, 500));

                if (onSuccess) onSuccess();
                alert(`✅ Berhasil! ${selectedPackage.quotaAmount} kuota telah ditambahkan.`);
                onClose();
                setLoading(false);
                return;
            }

            // REAL MODE - Call Edge Function
            console.log(`[PaymentModal] Initiating payment via ${paymentMethod.name}...`);

            // Force refresh session to ensure we have a valid, non-stale token
            console.log('[PaymentModal] Refreshing session...');
            const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError || !newSession) {
                console.error('[PaymentModal] Session refresh failed:', refreshError);
                throw new Error('Gagal memperbarui sesi login. Silakan logout dan login kembali.');
            }

            console.log('[PaymentModal] Valid token obtained (prefix):', newSession.access_token.substring(0, 10) + '...');
            console.log('[PaymentModal] Using Project URL:', supabaseUrl);

            // Direct fetch with Hybrid Auth to bypass Gateway 401
            // We authorize with ANON key (allowed by Gateway)
            // But verify user with x-user-token inside the function
            // Determine which Edge Function to call based on payment method
            const edgeFunctionName = paymentMethod.id === 'mayar_sandbox' ? 'create-payment-v2' : 'create-payment';
            console.log(`[PaymentModal] Calling Edge Function: ${edgeFunctionName}`);

            const response = await fetch(`${supabaseUrl}/functions/v1/${edgeFunctionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseAnonKey}`, // PASS GATEWAY
                    'apikey': supabaseAnonKey,
                    'x-user-token': newSession.access_token // VERIFY IN FUNCTION
                },
                body: JSON.stringify({
                    package_type: selectedPackage.id,
                    amount: selectedPackage.price,
                    name: selectedPackage.name,
                    quota_amount: selectedPackage.quotaAmount,
                    provider: paymentMethod.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('[PaymentModal] Payment failed:', response.status, errorData);
                console.log('[PaymentModal] Server Version:', errorData.version || 'UNKNOWN');
                if (errorData.debug_info) {
                    console.log('[PaymentModal] Debug Info:', errorData.debug_info);
                }
                throw new Error(errorData.error || 'Gagal membuat pembayaran');
            }

            const data = await response.json();

            if (data?.payment_url || data?.paymentUrl) {
                // Redirect user to payment page
                window.location.href = data.payment_url || data.paymentUrl;
            } else {
                throw new Error('Gagal mendapatkan link pembayaran dari server.');
            }

            // Note: execution stops here as page redirects. 
            // Webhook will handle quota update upon successful payment.

        } catch (err) {
            console.error('[PaymentModal] Error:', err);
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

                        {/* Payment Method Selection */}
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
                                2. Metode Pembayaran
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {PAYMENT_METHODS.map((method) => {
                                    const Icon = method.icon;
                                    return (
                                        <motion.div
                                            key={method.id}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between ${paymentMethod.id === method.id
                                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${paymentMethod.id === method.id ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-800 dark:text-white">
                                                        {method.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {method.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod.id === method.id
                                                ? 'border-amber-500 bg-amber-500'
                                                : 'border-slate-300 dark:border-slate-600'
                                                }`}>
                                                {paymentMethod.id === method.id && (
                                                    <Check className="w-3 h-3 text-white" />
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 flex justify-between items-center border border-slate-200 dark:border-slate-700">
                            <div>
                                <p className="text-sm text-slate-500">Total Pembayaran</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{formatRupiah(selectedPackage.price)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">via {paymentMethod.name}</p>
                            </div>
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
                                    <Coins className="w-5 h-5" />
                                    <span>Bayar Sekarang</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
