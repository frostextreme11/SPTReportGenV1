import { useState } from 'react';
import { Download, CheckCircle, Loader2, Package, Receipt, CreditCard, FileSpreadsheet, AlertCircle, Sparkles, FileText, Eye, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormData } from '../../context/FormContext';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah } from '../../utils/currency';
import { FadeIn, StaggerContainer, StaggerItem } from '../ui/AnimatedStep';
import {
    downloadCSV,
    generateDepreciationCSV,
    generateTaxCreditCSV,
    generateTaxPaymentCSV,
} from '../../utils/csvGenerator';
import AuthModal from '../auth/AuthModal';
import UnlockDownloadModal from '../payment/UnlockDownloadModal';
import PaymentModal from '../payment/PaymentModal';

// Download card status enum
const STATUS = {
    READY: 'ready',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
};

export default function Step7DownloadCenter() {
    const {
        formData,
        getTotalPeredaran,
        getTotalPphFinal,
        getLabaBersih,
        getTotalAktiva,
        currentReportId,
        isDownloadUnlocked,
        setDownloadUnlocked,
        saveToSupabase
    } = useFormData();
    const { user, profile, refreshProfile } = useAuth();

    const [downloadStatus, setDownloadStatus] = useState({});
    const [loadingProgress, setLoadingProgress] = useState({});
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [pendingDownload, setPendingDownload] = useState(null);

    const assets = formData.assets || [];
    const taxCredits = formData.taxCredits || [];
    const taxPayments = formData.taxPayments || [];

    // Check if user can download
    const canDownload = () => {
        return user && isDownloadUnlocked;
    };

    // Handle download gate
    const handleDownloadGate = async (downloadKey, downloadFn) => {
        console.log('[DownloadGate] Called with key:', downloadKey);
        console.log('[DownloadGate] User:', user);
        console.log('[DownloadGate] isDownloadUnlocked:', isDownloadUnlocked);

        // 1. Check if user is logged in
        if (!user) {
            console.log('[DownloadGate] No user - showing auth modal');
            setPendingDownload({ key: downloadKey, fn: downloadFn });
            setShowAuthModal(true);
            return;
        }

        // 2. Save report to Supabase if not already saved
        // WORKAROUND: Skip save for now due to RLS issue causing INSERT to hang
        // TODO: Fix RLS policy on tax_reports table
        console.log('[DownloadGate] currentReportId:', currentReportId);
        if (!currentReportId) {
            console.log('[DownloadGate] No reportId - skipping save (RLS issue workaround)');
            // Temporarily skip save and just show unlock modal
            // The save will happen when user actually unlocks
        }

        // 3. Check if download is unlocked
        console.log('[DownloadGate] About to show UnlockModal');
        console.log('[DownloadGate] showUnlockModal state will be set to true');
        if (!isDownloadUnlocked) {
            setPendingDownload({ key: downloadKey, fn: downloadFn });
            setShowUnlockModal(true);
            console.log('[DownloadGate] setShowUnlockModal(true) called');
            return;
        }

        // 4. Proceed with download
        executeDownload(downloadKey, downloadFn);
    };

    // Execute the actual download
    const executeDownload = async (key, downloadFn) => {
        setDownloadStatus(prev => ({ ...prev, [key]: STATUS.LOADING }));
        setLoadingProgress(prev => ({ ...prev, [key]: 0 }));

        // Simulate progress
        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
                const current = prev[key] || 0;
                if (current >= 90) {
                    clearInterval(progressInterval);
                    return prev;
                }
                return { ...prev, [key]: current + 15 };
            });
        }, 200);

        try {
            // Wait 1.5 seconds as per requirement
            await new Promise(resolve => setTimeout(resolve, 1500));

            clearInterval(progressInterval);
            setLoadingProgress(prev => ({ ...prev, [key]: 100 }));

            // Execute the actual download
            downloadFn();

            setDownloadStatus(prev => ({ ...prev, [key]: STATUS.SUCCESS }));

            // Reset after 3 seconds
            setTimeout(() => {
                setDownloadStatus(prev => ({ ...prev, [key]: STATUS.READY }));
            }, 3000);
        } catch (error) {
            clearInterval(progressInterval);
            console.error('Download error:', error);
            setDownloadStatus(prev => ({ ...prev, [key]: STATUS.ERROR }));

            setTimeout(() => {
                setDownloadStatus(prev => ({ ...prev, [key]: STATUS.READY }));
            }, 3000);
        }
    };

    // After unlock, execute pending download
    const handleUnlockSuccess = async () => {
        await setDownloadUnlocked();
        if (pendingDownload) {
            executeDownload(pendingDownload.key, pendingDownload.fn);
            setPendingDownload(null);
        }
    };

    // After auth, check and proceed
    const handleAuthSuccess = async () => {
        setShowAuthModal(false);
        if (pendingDownload) {
            // Re-trigger the gate check
            handleDownloadGate(pendingDownload.key, pendingDownload.fn);
        }
    };

    // Download handlers
    const handleDownloadAssets = () => {
        handleDownloadGate('assets', () => {
            const { content, filename } = generateDepreciationCSV(assets, formData.npwp);
            downloadCSV(content, filename);
        });
    };

    const handleDownloadTaxCredits = () => {
        handleDownloadGate('taxCredits', () => {
            const { content, filename } = generateTaxCreditCSV(taxCredits, formData.npwp);
            downloadCSV(content, filename);
        });
    };

    const handleDownloadTaxPayments = () => {
        handleDownloadGate('taxPayments', () => {
            const { content, filename } = generateTaxPaymentCSV(taxPayments, formData.npwp);
            downloadCSV(content, filename);
        });
    };

    // Financial Report Download (triggers PDF modal)
    const handleDownloadFinancialReport = () => {
        handleDownloadGate('financialReport', () => {
            window.dispatchEvent(new CustomEvent('openPDFPreview'));
        });
    };

    // Calculate total depreciation
    const getTotalPenyusutan = () => {
        return assets.reduce((sum, asset) => sum + (asset.penyusutanTahunIni || 0), 0);
    };

    // Calculate total tax credit
    const getTotalTaxCredit = () => {
        return taxCredits.reduce((sum, credit) => sum + (credit.jumlahDipotong || 0), 0);
    };

    // Calculate total SSP payments
    const getTotalSSP = () => {
        return taxPayments.reduce((sum, p) => sum + (p.jumlahPembayaran || 0), 0);
    };

    // Download cards configuration - Financial Report first, then CSVs
    const downloadCards = [
        {
            key: 'financialReport',
            title: 'Laporan Keuangan',
            subtitle: 'Neraca, Laba Rugi, Peredaran Usaha',
            icon: FileText,
            color: 'from-emerald-500 to-green-600',
            shadowColor: 'shadow-emerald-500/30',
            count: 3,
            countLabel: 'Laporan',
            total: getLabaBersih(),
            totalLabel: 'Laba Bersih',
            isEmpty: false, // Always available
            emptyMessage: '',
            onDownload: handleDownloadFinancialReport,
            filename: `Laporan_Keuangan_${formData.tahunPajak}.pdf`,
            isPDF: true,
        },
        {
            key: 'assets',
            title: 'Daftar Aset & Penyusutan',
            subtitle: 'Lampiran 1A - Penyusutan Fiskal',
            icon: Package,
            color: 'from-amber-500 to-orange-600',
            shadowColor: 'shadow-amber-500/20',
            count: assets.length,
            countLabel: 'Aset',
            total: getTotalPenyusutan(),
            totalLabel: 'Total Penyusutan',
            isEmpty: assets.length === 0,
            emptyMessage: 'Belum ada data aset. Silakan isi di langkah Aset.',
            onDownload: handleDownloadAssets,
            filename: `LAMPIRAN-1A-1771-ASET_${formData.npwp?.replace(/\D/g, '') || 'NPWP'}.csv`,
        },
        {
            key: 'taxCredits',
            title: 'Kredit Pajak PPh 22/23',
            subtitle: 'Lampiran III - Bukti Potong',
            icon: Receipt,
            color: 'from-cyan-500 to-teal-600',
            shadowColor: 'shadow-cyan-500/20',
            count: taxCredits.length,
            countLabel: 'Bukti Potong',
            total: getTotalTaxCredit(),
            totalLabel: 'Total Kredit Pajak',
            isEmpty: taxCredits.length === 0,
            emptyMessage: 'Belum ada bukti potong. Silakan isi di langkah Kredit Pajak.',
            onDownload: handleDownloadTaxCredits,
            filename: `LAMPIRAN-III-1771-KREDIT_${formData.npwp?.replace(/\D/g, '') || 'NPWP'}.csv`,
        },
        {
            key: 'taxPayments',
            title: 'Bukti Setor Pajak (SSP)',
            subtitle: 'Daftar Pembayaran Pajak',
            icon: CreditCard,
            color: 'from-purple-500 to-indigo-600',
            shadowColor: 'shadow-purple-500/20',
            count: taxPayments.length,
            countLabel: 'SSP',
            total: getTotalSSP(),
            totalLabel: 'Total Setoran',
            isEmpty: taxPayments.length === 0,
            emptyMessage: 'Belum ada data SSP. Silakan isi di langkah SSP.',
            onDownload: handleDownloadTaxPayments,
            filename: '1771-PEMBAYARAN SSP.csv',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <FadeIn>
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="inline-flex p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg shadow-emerald-500/30 mb-4"
                    >
                        <FileSpreadsheet className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Download Center
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Unduh file untuk DJP e-Form SPT 1771
                    </p>
                </div>
            </FadeIn>

            {/* Download Access Status */}
            <FadeIn delay={0.05}>
                <div className={`rounded-xl p-4 border ${canDownload()
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    }`}>
                    <div className="flex items-center gap-3">
                        {canDownload() ? (
                            <>
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-emerald-700 dark:text-emerald-300">
                                        Download Aktif
                                    </p>
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                        Anda dapat mendownload semua file untuk laporan ini
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
                                    {user ? (
                                        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    ) : (
                                        <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-amber-700 dark:text-amber-300">
                                        {user ? 'Download Terkunci' : 'Login Diperlukan'}
                                    </p>
                                    <p className="text-sm text-amber-600 dark:text-amber-400">
                                        {user
                                            ? 'Gunakan kuota untuk membuka akses download'
                                            : 'Silakan login untuk mendownload file'
                                        }
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </FadeIn>

            {/* Company Info Summary */}
            <FadeIn delay={0.1}>
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 rounded-xl p-5 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{formData.namaPerusahaan || 'Nama Perusahaan'}</h3>
                            <p className="text-sm text-slate-400">NPWP: {formData.npwp || '-'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                        <div>
                            <p className="text-xs text-slate-400">Tahun Pajak</p>
                            <p className="font-bold text-lg">{formData.tahunPajak}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Total Peredaran</p>
                            <p className="font-bold text-lg text-emerald-400">{formatRupiah(getTotalPeredaran())}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">PPh Final</p>
                            <p className="font-bold text-lg text-amber-400">{formatRupiah(getTotalPphFinal())}</p>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* Download Cards */}
            <StaggerContainer className="space-y-4">
                {downloadCards.map((card, index) => {
                    const status = downloadStatus[card.key] || STATUS.READY;
                    const progress = loadingProgress[card.key] || 0;
                    const Icon = card.icon;
                    const isFirst = index === 0;
                    const isLocked = !canDownload();

                    return (
                        <StaggerItem key={card.key}>
                            <motion.div
                                layout
                                className={`
                                    bg-white dark:bg-slate-800 rounded-xl border overflow-hidden transition-all
                                    ${status === STATUS.SUCCESS ? 'ring-2 ring-emerald-500' : ''}
                                    ${isFirst ? 'border-emerald-300 dark:border-emerald-700' : 'border-slate-200 dark:border-slate-700'}
                                `}
                            >
                                {/* Featured badge for Financial Report */}
                                {isFirst && (
                                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-1.5 flex items-center justify-center gap-2">
                                        <Sparkles className="w-4 h-4 text-white" />
                                        <span className="text-xs font-medium text-white">Laporan Utama</span>
                                    </div>
                                )}

                                {/* Header with gradient */}
                                <div className={`bg-gradient-to-r ${card.color} p-4 text-white`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{card.title}</h3>
                                                <p className="text-sm opacity-80">{card.subtitle}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold">{card.count}</p>
                                            <p className="text-xs opacity-80">{card.countLabel}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    {/* Stats */}
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">{card.totalLabel}</span>
                                        <span className={`font-bold ${card.total >= 0 ? 'text-slate-800 dark:text-white' : 'text-red-500'}`}>
                                            {formatRupiah(card.total)}
                                        </span>
                                    </div>

                                    {/* Filename Preview */}
                                    <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <p className="text-xs text-slate-400 mb-1">Nama File:</p>
                                        <code className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                                            {card.filename}
                                        </code>
                                    </div>

                                    {/* Loading Progress Bar */}
                                    <AnimatePresence>
                                        {status === STATUS.LOADING && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mb-4"
                                            >
                                                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                    <span className="flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        {card.isPDF ? 'Generating PDF...' : 'Formatting for DJP...'}
                                                    </span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        className={`h-full bg-gradient-to-r ${card.color} rounded-full`}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Empty State Warning */}
                                    {card.isEmpty && (
                                        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                                {card.emptyMessage}
                                            </p>
                                        </div>
                                    )}

                                    {/* Download Button */}
                                    <motion.button
                                        whileHover={{ scale: card.isEmpty ? 1 : 1.02 }}
                                        whileTap={{ scale: card.isEmpty ? 1 : 0.98 }}
                                        onClick={card.onDownload}
                                        disabled={card.isEmpty || status === STATUS.LOADING}
                                        className={`
                                            w-full h-12 rounded-xl font-medium flex items-center justify-center gap-2 transition-all
                                            ${status === STATUS.SUCCESS
                                                ? 'bg-emerald-500 text-white'
                                                : status === STATUS.LOADING
                                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                                                    : card.isEmpty
                                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                                        : `bg-gradient-to-r ${card.color} text-white ${card.shadowColor} shadow-lg hover:shadow-xl`
                                            }
                                        `}
                                    >
                                        <AnimatePresence mode="wait">
                                            {status === STATUS.SUCCESS ? (
                                                <motion.div
                                                    key="success"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span>Berhasil!</span>
                                                </motion.div>
                                            ) : status === STATUS.LOADING ? (
                                                <motion.div
                                                    key="loading"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Memproses...</span>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="ready"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    {isLocked && <Lock className="w-4 h-4" />}
                                                    {card.isPDF ? (
                                                        <>
                                                            <Eye className="w-5 h-5" />
                                                            <span>{isLocked ? 'Buka Akses & Lihat PDF' : 'Lihat & Download PDF'}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Download className="w-5 h-5" />
                                                            <span>{isLocked ? 'Buka Akses & Download' : 'Download CSV'}</span>
                                                        </>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                </div>
                            </motion.div>
                        </StaggerItem>
                    );
                })}
            </StaggerContainer>

            {/* DJP Format Info */}
            <FadeIn delay={0.5}>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                        File CSV menggunakan format resmi DJP dengan delimiter <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">;</code> (semicolon) dan encoding UTF-8 BOM
                    </p>
                </div>
            </FadeIn>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => {
                    setShowAuthModal(false);
                    setPendingDownload(null);
                }}
            />

            {/* Unlock Download Modal */}
            <UnlockDownloadModal
                isOpen={showUnlockModal}
                onClose={() => {
                    setShowUnlockModal(false);
                    setPendingDownload(null);
                }}
                reportId={currentReportId}
                onUnlocked={handleUnlockSuccess}
                onBuyQuota={() => {
                    setShowUnlockModal(false);
                    setShowPaymentModal(true);
                }}
            />

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
