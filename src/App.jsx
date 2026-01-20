import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BlogPostPage from './pages/BlogPostPage';
import BlogListPage from './pages/BlogListPage';
import ReportGenerator from './ReportGenerator';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Wrapper for landing page that redirects to dashboard if logged in
function HomeRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // If logged in, redirect to dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <LandingPage />;
}

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/" element={<HomeRoute />} />
                <Route path="/generator" element={<ReportGenerator />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/payment/success" element={<PaymentCallback status="success" />} />
                <Route path="/payment/cancel" element={<PaymentCallback status="cancel" />} />
                <Route path="/blog" element={<BlogListPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
            </Routes>
        </Router>
    );
}

// Simple payment callback component
function PaymentCallback({ status }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => {
                navigate('/dashboard');
            }, 3000); // 3 seconds to let them see the animation
            return () => clearTimeout(timer);
        }
    }, [status, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4"
            >
                {status === 'success' ? (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                            className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <Check className="w-10 h-10 text-emerald-500" strokeWidth={3} />
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-2xl font-bold text-slate-800 dark:text-white mb-2"
                        >
                            Pembayaran Berhasil!
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-slate-500 dark:text-slate-400 mb-8"
                        >
                            Kuota Anda telah ditambahkan.
                            <br />
                            <span className="text-sm text-slate-400">Mengalihkan ke dashboard...</span>
                        </motion.p>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 3 }}
                            className="h-1 bg-emerald-500 rounded-full mx-auto max-w-[200px]"
                        />
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <X className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Pembayaran Dibatalkan</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Silakan coba lagi jika diperlukan.</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                        >
                            Kembali ke Dashboard
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    );
}
