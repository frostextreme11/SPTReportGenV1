import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText, Plus, LogOut, Coins, Lock, Unlock,
    Calendar, Building2, CreditCard, Loader2, Sparkles,
    ChevronRight, ShoppingCart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, MOCK_MODE, mockReports, withTimeout } from '../lib/supabaseClient';
import PaymentModal from '../components/payment/PaymentModal';

import { useFormData } from '../context/FormContext'; // Import hook

export default function DashboardPage() {
    const { user, profile, signOut, refreshProfile } = useAuth();
    const { setFormData, setCurrentReportId, setIsDownloadUnlocked, resetForm } = useFormData(); // Use hook
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Detect refresh parameter from payment success redirect
    useEffect(() => {
        const refreshType = searchParams.get('refresh');
        if (refreshType === 'quota') {
            console.log('[Dashboard] Detected refresh=quota, refreshing profile...');
            refreshProfile();
            // Clear the URL parameter after refresh
            searchParams.delete('refresh');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, refreshProfile, setSearchParams]);

    useEffect(() => {
        fetchReports();
    }, [user]);

    const fetchReports = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        // MOCK MODE
        if (MOCK_MODE) {
            console.log('[Dashboard] MOCK_MODE enabled - skipping Supabase');
            setReports(mockReports);
            setLoading(false);
            return;
        }

        // Optimization: If we already have reports, don't show full loading spinner, just background refresh
        // Fix: Use a ref or simple check. For now, checking length is fine.
        const isBackgroundRefresh = reports.length > 0;
        if (!isBackgroundRefresh) {
            setLoading(true);
        }

        try {
            const { data, error } = await withTimeout(
                supabase
                    .from('tax_reports')
                    .select('id, nama_wajib_pajak, npwp, tahun_pajak, is_download_unlocked, updated_at')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false }),
                10000,
                'Gagal memuat laporan'
            );

            if (!error && data) {
                setReports(data);
                console.log('[Dashboard] Loaded', data.length, 'reports');
            } else {
                console.log('[Dashboard] Error fetching reports:', error);
                if (!isBackgroundRefresh) setReports([]);
            }
        } catch (err) {
            console.error('[Dashboard] Fetch error:', err.message);
            if (!isBackgroundRefresh) setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const handleCreateNew = () => {
        // Use context to reset form state and properly clear localStorage via effect
        resetForm();
        navigate('/generator');
    };

    const handleOpenReport = async (report) => {
        // Use context to set state directly
        if (report.form_data) {
            setFormData(report.form_data);
            setCurrentReportId(report.id);
            // Check if this report corresponds to current context's isDownloadUnlocked?
            // Actually context loads it from DB based on ID. 
            // But we should set it optimistically if available or let context effect fetch it.
            // Provide data.is_download_unlocked if available on report object
            if (report.is_download_unlocked !== undefined) {
                setIsDownloadUnlocked(report.is_download_unlocked);
            }
            navigate('/generator');
            return;
        }

        // Otherwise fetch full data
        setLoading(true);
        try {
            if (MOCK_MODE) {
                const fullReport = mockReports.find(r => r.id === report.id);
                if (fullReport) {
                    setFormData(fullReport.form_data);
                    setCurrentReportId(fullReport.id);
                    navigate('/generator');
                }
                return;
            }

            const { data, error } = await withTimeout(
                supabase
                    .from('tax_reports')
                    .select('form_data, id, is_download_unlocked') // Fetch is_download_unlocked too
                    .eq('id', report.id)
                    .single(),
                15000, // Increased timeout for large reports
                'Gagal memuat detail laporan (Timeout)'
            );

            if (error) throw error;

            if (data && data.form_data) {
                setFormData(data.form_data);
                setCurrentReportId(data.id);
                setIsDownloadUnlocked(data.is_download_unlocked);
                navigate('/generator');
            } else {
                console.error('[Dashboard] Data invalid:', data);
                alert('Data laporan kosong atau rusak.');
            }

        } catch (err) {
            console.error('[Dashboard] Error opening report:', err);
            alert(`Gagal membuka laporan: ${err.message || 'Silakan coba lagi'}`);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-800 dark:text-white">BuatSPT</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                                {user?.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Keluar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Welcome & Quota Section */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Welcome Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white"
                    >
                        <h1 className="text-2xl font-bold mb-2">
                            Selamat Datang, {profile?.full_name || 'User'}! 👋
                        </h1>
                        <p className="text-emerald-100">
                            Kelola laporan SPT Tahunan Anda dengan mudah dan cepat.
                        </p>
                    </motion.div>

                    {/* Quota Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Saldo Kuota</p>
                                <div className="flex items-center gap-2">
                                    <Coins className="w-8 h-8 text-amber-500" />
                                    <span className="text-4xl font-bold text-slate-800 dark:text-white">
                                        {profile?.quota_balance || 0}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">kuota tersedia untuk download</p>
                            </div>
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                <span>Beli Kuota</span>
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Reports Section */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        Laporan Pajak Anda
                    </h2>
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Buat Laporan Baru</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                ) : reports.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700"
                    >
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">
                            Belum Ada Laporan
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Mulai buat laporan SPT pertama Anda sekarang!
                        </p>
                        <button
                            onClick={handleCreateNew}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Buat Laporan Pertama</span>
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid gap-4">
                        {reports.map((report, index) => (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleOpenReport(report)}
                                className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg cursor-pointer transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Lock/Unlock Status */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${report.is_download_unlocked
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                            : 'bg-slate-100 dark:bg-slate-700'
                                            }`}>
                                            {report.is_download_unlocked ? (
                                                <Unlock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                            ) : (
                                                <Lock className="w-6 h-6 text-slate-400" />
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                {report.nama_wajib_pajak}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <CreditCard className="w-4 h-4" />
                                                    NPWP: {report.npwp}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    Tahun: {report.tahun_pajak}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {report.is_download_unlocked && (
                                            <span className="hidden sm:flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-full">
                                                <Sparkles className="w-3 h-3" />
                                                Download Aktif
                                            </span>
                                        )}
                                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                </div>

                                <p className="text-xs text-slate-400 mt-3">
                                    Terakhir diubah: {formatDate(report.updated_at)}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={() => {
                    refreshProfile();
                    setShowPaymentModal(false);
                }}
            />
        </div>
    );
}
