import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
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
            </Routes>
        </Router>
    );
}

// Simple payment callback component
function PaymentCallback({ status }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md">
                {status === 'success' ? (
                    <>
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Pembayaran Berhasil!</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Kuota Anda telah ditambahkan.</p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Pembayaran Dibatalkan</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Silakan coba lagi jika diperlukan.</p>
                    </>
                )}
                <a
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                >
                    Kembali ke Dashboard
                </a>
            </div>
        </div>
    );
}
