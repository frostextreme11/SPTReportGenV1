import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertCircle, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function DokuPaymentSuccess() {
    console.log("[DokuPaymentSuccess] Component initializing");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshProfile, user, loading: authLoading } = useAuth();

    // Status state: 'initializing', 'verifying', 'success', 'error', 'timeout', 'guest'
    const [status, setStatus] = useState('initializing'); // Start with safe loading state
    const [message, setMessage] = useState('Memverifikasi pembayaran...');
    const [countdown, setCountdown] = useState(5);
    const hasSuccessHandled = useRef(false); // Ref to prevent double execution
    const isVerifying = useRef(false); // Ref to prevent parallel verification calls
    const [retries, setRetries] = useState(0); // Changed retries to state

    // Extract DOKU params
    const invoiceNumber = searchParams.get('invoice_number');
    const paymentId = searchParams.get('order_id'); // This was in original, but not used in new useEffect logic. Keeping for now.

    // Load Confetti Script safely
    useEffect(() => {
        try {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
            script.async = true;
            document.body.appendChild(script);

            return () => {
                if (document.body.contains(script)) {
                    document.body.removeChild(script);
                }
            };
        } catch (e) {
            console.error("Confetti script error", e);
        }
    }, []);

    const handleSuccess = async () => {
        if (hasSuccessHandled.current) {
            console.log("[DokuSuccess] Success already handled, skipping.");
            return;
        }
        hasSuccessHandled.current = true;

        // SUCCESS!
        setStatus('success');
        setMessage('Pembayaran berhasil! Saldo kuota Anda telah diperbarui.');

        // Trigger Confetti
        try {
            if (window.confetti) {
                window.confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10b981', '#34d399', '#059669', '#fbbf24']
                });
            }
        } catch (e) {
            console.warn("Confetti error:", e);
        }

        // Refresh Quota (Non-blocking or Safe)
        try {
            console.log("[DokuSuccess] Refreshing profile...");
            await refreshProfile();
            console.log("[DokuSuccess] Profile refreshed.");
        } catch (error) {
            console.error("[DokuSuccess] Failed to refresh profile:", error);
        }

        // Start countdown for redirect
        let isMounted = true; // Local flag for this specific timer
        const timer = setInterval(() => {
            if (!isMounted) return clearInterval(timer);
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/dashboard?refresh=true');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            isMounted = false;
            clearInterval(timer);
        };
    }

    // Main Verification Logic
    useEffect(() => {
        console.log("[DokuPaymentSuccess] Effect triggered", { authLoading, userId: user?.id, successHandled: hasSuccessHandled.current });

        if (authLoading) return; // Wait for auth to be ready

        // Stop if we've already finished
        if (hasSuccessHandled.current) return;

        if (!user) {
            console.log("[DokuPaymentSuccess] No user logged in.");
            setStatus('guest');
            return;
        }

        // Parse query params
        // Parse query params
        const currentSearchParams = new URLSearchParams(location.search);

        // Log all params for debugging
        const paramsObj = {};
        for (const [key, value] of currentSearchParams.entries()) {
            paramsObj[key] = value;
        }
        console.log("[DokuPaymentSuccess] URL Parameters:", paramsObj);

        // Try multiple field names for invoice number
        // DOKU often sends TRANSIDMERCHANT or order_id
        const currentInvoiceNumber =
            currentSearchParams.get('invoice_number') ||
            currentSearchParams.get('TRANSIDMERCHANT') ||
            currentSearchParams.get('order_id');

        if (!currentInvoiceNumber) {
            console.error("Invoice number missing. Available params:", paramsObj);
            setStatus('error');
            setMessage('Invoice number tidak ditemukan URL.');
            return;
        }

        let isMounted = true;

        const checkStatus = async () => {
            if (!isMounted) return;
            if (hasSuccessHandled.current) return;
            if (isVerifying.current) return; // Prevent parallel checks

            isVerifying.current = true;

            try {
                console.log(`[DokuSuccess] Verifying attempt ${retries + 1}...`);

                const { data: payment, error } = await supabase
                    .from('payments')
                    .select('*')
                    .eq('invoice_number', currentInvoiceNumber)
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                    console.error("Database error:", error);
                }

                if (payment) {
                    console.log("[DokuSuccess] Found payment:", payment);
                }

                // Check Local Status
                if (payment && payment.status === 'success') {
                    await handleSuccess();
                    isVerifying.current = false;
                    return;
                }

                // If Payment exists but is PENDING, force check via Server Function (DOKU API Pull)
                if (payment && payment.status === 'pending' && payment.invoice_number) {
                    console.log("[DokuSuccess] Payment pending. Calling verify-payment-v2 to force check DOKU...");

                    const { data: { session } } = await supabase.auth.getSession();

                    // Handle potential trailing slash in supabaseUrl
                    const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;
                    const verifyUrl = `${baseUrl}/functions/v1/verify-payment-v2`;

                    console.log("[DokuSuccess] Fetching:", verifyUrl);

                    const verifyResponse = await fetch(verifyUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${supabaseAnonKey}`,
                            'x-user-token': session?.access_token || ''
                        },
                        body: JSON.stringify({
                            invoice_number: payment.invoice_number
                        })
                    });

                    if (verifyResponse.ok) {
                        const verifyData = await verifyResponse.json();
                        console.log("[DokuSuccess] verify-payment-v2 response:", verifyData);

                        if (verifyData.success) {
                            await handleSuccess();
                            isVerifying.current = false;
                            return;
                        }
                    } else {
                        console.warn("[DokuSuccess] verify-payment-v2 failed or returned 4xx", verifyResponse.status);
                    }
                }

                // Retry Logic
                if (retries < 10) {
                    setTimeout(() => {
                        if (isMounted) {
                            setRetries(r => r + 1);
                            isVerifying.current = false; // Release lock for next retry
                        }
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage('Pembayaran belum terkonfirmasi. Silakan cek status di Dashboard atau hubungi support.');
                    isVerifying.current = false;
                }

            } catch (err) {
                console.error("Verification error:", err);
                setStatus('error');
                setMessage('Terjadi kesalahan saat verifikasi.');
                isVerifying.current = false;
            }
        };

        checkStatus();

        return () => {
            isMounted = false;
        };

    }, [user, authLoading, location.search, navigate, refreshProfile, retries]);


    // Loading State (Auth)
    if (authLoading || status === 'initializing') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                {/* Simplified Loading UI to prevent crashes */}
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
                {/* Header Section with Dynamic Gradient */}
                <div className={`
                    h-40 flex flex-col items-center justify-center relative
                    ${status === 'success' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                        status === 'error' ? 'bg-gradient-to-br from-rose-500 to-red-600' :
                            status === 'timeout' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                                status === 'guest' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                    'bg-gradient-to-br from-slate-700 to-slate-800'}
                    transition-colors duration-500
                `}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />

                    <AnimatePresence mode="wait">
                        {status === 'success' && (
                            <motion.div
                                key="success-icon"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg"
                            >
                                <Check className="w-10 h-10 text-white" strokeWidth={4} />
                            </motion.div>
                        )}
                        {status === 'verifying' && (
                            <motion.div
                                key="verifying-icon"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg"
                            >
                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                            </motion.div>
                        )}
                        {status === 'error' && (
                            <motion.div
                                key="error-icon"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg"
                            >
                                <AlertCircle className="w-10 h-10 text-white" />
                            </motion.div>
                        )}
                        {status === 'timeout' && (
                            <motion.div
                                key="timeout-icon"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg"
                            >
                                <ShieldCheck className="w-10 h-10 text-white" />
                            </motion.div>
                        )}
                        {status === 'guest' && (
                            <motion.div
                                key="guest-icon"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg"
                            >
                                <CreditCard className="w-10 h-10 text-white" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content Section */}
                <div className="p-8 text-center space-y-6">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl font-bold text-slate-900 dark:text-white mb-2"
                        >
                            {status === 'success' ? 'Pembayaran Berhasil' :
                                status === 'verifying' ? 'Memverifikasi...' :
                                    status === 'error' ? 'Verifikasi Gagal' :
                                        status === 'guest' ? 'Login Diperlukan' :
                                            'Status Pending'}
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-slate-500 dark:text-slate-400 font-medium"
                        >
                            {status === 'success'
                                ? 'Pembayaran Anda telah dikonfirmasi dan kuota berhasil ditambahkan ke akun Anda.'
                                : status === 'timeout'
                                    ? 'Kami belum menerima konfirmasi instan dari bank, tetapi jangan khawatir. Sistem akan terus mengecek secara berkala.'
                                    : status === 'guest'
                                        ? 'Silakan login terlebih dahulu untuk memverifikasi pembayaran Anda.'
                                        : message}
                        </motion.p>
                    </div>

                    {/* Transaction Details Card */}
                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Metode</span>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                                    <CreditCard className="w-3 h-3" /> DOKU
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Invoice</span>
                                <span className="text-sm font-mono text-slate-700 dark:text-slate-200">{invoiceNumber || 'NEW-ORDER'}</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Actions / Progress */}
                    <div className="pt-2">
                        {status === 'success' ? (
                            <div className="space-y-4">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    <span>Ke Dashboard ({countdown})</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                                <p className="text-xs text-slate-400">
                                    Otomatis mengalihkan dalam {countdown} detik...
                                </p>
                            </div>
                        ) : status === 'error' ? (
                            <button
                                onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
                                className="w-full py-3 px-4 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Hubungi Bantuan
                            </button>
                        ) : status === 'timeout' ? (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full py-3 px-4 bg-emerald-500 text-white font-semibold rounded-xl hover:opacity-90 transition-colors shadow-lg shadow-emerald-500/25"
                            >
                                Cek Dashboard Saya
                            </button>
                        ) : status === 'guest' ? (
                            <button
                                onClick={() => navigate('/?login=true')}
                                className="w-full py-3 px-4 bg-slate-900 text-white font-semibold rounded-xl hover:opacity-90 transition-colors shadow-lg"
                            >
                                Login Sekarang
                            </button>
                        ) : null}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
