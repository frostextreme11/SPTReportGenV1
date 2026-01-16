import { useState } from 'react';
import { CreditCard, Plus, Trash2, Calendar, Hash, Info, AlertTriangle, Banknote, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CurrencyInput from '../ui/CurrencyInput';
import { useFormData } from '../../context/FormContext';
import { formatRupiah } from '../../utils/currency';
import { FadeIn, StaggerContainer, StaggerItem } from '../ui/AnimatedStep';

// KAP (Kode Akun Pajak) Options
const KAP_OPTIONS = [
    { value: '411126', label: 'PPh Badan (411126)', description: 'PPh Pasal 25/29 Badan' },
    { value: '411121', label: 'PPh 21 (411121)', description: 'PPh Pasal 21' },
    { value: '411122', label: 'PPh 22 (411122)', description: 'PPh Pasal 22' },
    { value: '411124', label: 'PPh 23 (411124)', description: 'PPh Pasal 23' },
    { value: '411128', label: 'PPh Final/UMKM (411128)', description: 'PPh Final PP 23/55', isWarning: true },
];

// KJS (Kode Jenis Setoran) Options - Dependent on KAP
const KJS_OPTIONS = {
    default: [
        { value: '200', label: '200 - Tahunan', primary: true },
        { value: '100', label: '100 - Masa' },
        { value: '300', label: '300 - STP' },
        { value: '310', label: '310 - SKPKB' },
        { value: '320', label: '320 - SKPKBT' },
    ],
    '411128': [
        { value: '420', label: '420 - Final UMKM' },
        { value: '100', label: '100 - Masa' },
        { value: '300', label: '300 - STP' },
    ],
};

// Cara Pelunasan Options
const CARA_PELUNASAN_OPTIONS = [
    { value: '1', label: 'Via Bank/Persepsi' },
    { value: '2', label: 'Via Pos' },
    { value: '3', label: 'Pemindahbukuan (Pbk)' },
];

export default function Step6SSP() {
    const { formData, updateField } = useFormData();
    const taxPayments = formData.taxPayments || [];
    const [showWarning, setShowWarning] = useState(null); // Track which payment shows warning

    const addPayment = () => {
        const newPayment = {
            id: Date.now(),
            kap: '411126', // Default to PPh Badan
            kjs: '200', // Default to Tahunan
            caraPelunasan: '1', // Default to Via Bank
            ntpn: '',
            jumlahPembayaran: 0,
            tanggalSetor: '',
        };
        updateField('taxPayments', [...taxPayments, newPayment]);
    };

    const updatePayment = (id, field, value) => {
        const updatedPayments = taxPayments.map(payment => {
            if (payment.id === id) {
                const updated = { ...payment, [field]: value };

                // If KAP changes, reset KJS to appropriate default
                if (field === 'kap') {
                    if (value === '411128') {
                        updated.kjs = '420'; // Default to Final UMKM
                        setShowWarning(id); // Show warning
                    } else {
                        updated.kjs = '200'; // Default to Tahunan
                        if (showWarning === id) setShowWarning(null);
                    }
                }

                return updated;
            }
            return payment;
        });
        updateField('taxPayments', updatedPayments);
    };

    const removePayment = (id) => {
        updateField('taxPayments', taxPayments.filter(payment => payment.id !== id));
        if (showWarning === id) setShowWarning(null);
    };

    const dismissWarning = (id) => {
        setShowWarning(null);
    };

    // Get KJS options based on KAP
    const getKJSOptions = (kap) => {
        return KJS_OPTIONS[kap] || KJS_OPTIONS.default;
    };

    // Validate NTPN (16 alphanumeric characters)
    const validateNTPN = (ntpn) => {
        if (!ntpn) return true; // Empty is valid (not required)
        const cleaned = ntpn.replace(/[^A-Za-z0-9]/g, '');
        return cleaned.length === 16;
    };

    // Format NTPN (auto-capitalize, alphanumeric only)
    const formatNTPN = (value) => {
        return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 16);
    };

    // Calculate total payments
    const getTotalPayments = () => {
        return taxPayments.reduce((sum, payment) => sum + (payment.jumlahPembayaran || 0), 0);
    };

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <FadeIn>
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/30 mb-4"
                    >
                        <CreditCard className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Smart SSP Recorder
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Bukti Setor Pajak (Surat Setoran Pajak)
                    </p>
                </div>
            </FadeIn>

            {/* Info Card */}
            <FadeIn delay={0.1}>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-medium mb-1">Petunjuk Pengisian:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                            <li>Masukkan bukti setor pajak yang telah dibayar</li>
                            <li>NTPN harus 16 karakter sesuai bukti bank</li>
                            <li>Untuk SPT 1771, umumnya gunakan KAP 411126 (PPh Badan)</li>
                        </ul>
                    </div>
                </div>
            </FadeIn>

            {/* Summary Card */}
            <FadeIn delay={0.15}>
                <motion.div
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <Banknote className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-purple-100 text-sm">Total Pajak Disetor</p>
                                <motion.p
                                    key={getTotalPayments()}
                                    initial={{ scale: 1.1 }}
                                    animate={{ scale: 1 }}
                                    className="text-2xl font-bold"
                                >
                                    {formatRupiah(getTotalPayments())}
                                </motion.p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold">{taxPayments.length}</p>
                            <p className="text-purple-100 text-sm">Bukti Setor</p>
                        </div>
                    </div>
                </motion.div>
            </FadeIn>

            {/* Payments List */}
            <StaggerContainer className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {taxPayments.map((payment, index) => {
                        const kjsOptions = getKJSOptions(payment.kap);
                        const isNTPNValid = validateNTPN(payment.ntpn);
                        const isWarningKAP = payment.kap === '411128';

                        return (
                            <StaggerItem key={payment.id}>
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    transition={{ type: 'spring', damping: 25 }}
                                    className={`bg-white dark:bg-slate-800 rounded-xl border overflow-hidden ${isWarningKAP
                                            ? 'border-amber-300 dark:border-amber-700'
                                            : 'border-slate-200 dark:border-slate-700'
                                        }`}
                                >
                                    {/* Warning Banner for PPh Final */}
                                    <AnimatePresence>
                                        {showWarning === payment.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 p-3"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                                            Perhatian: PPh Final dipilih
                                                        </p>
                                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                                            Anda sedang mengisi SPT 1771 (Non-Final). Apakah Anda yakin ini bukan PPh 29 (KAP 411126)?
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => dismissWarning(payment.id)}
                                                        className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded"
                                                    >
                                                        <X className="w-4 h-4 text-amber-500" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="p-4 sm:p-5">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isWarningKAP
                                                        ? 'bg-amber-100 dark:bg-amber-900/30'
                                                        : 'bg-purple-100 dark:bg-purple-900/30'
                                                    }`}>
                                                    <CreditCard className={`w-4 h-4 ${isWarningKAP
                                                            ? 'text-amber-600 dark:text-amber-400'
                                                            : 'text-purple-600 dark:text-purple-400'
                                                        }`} />
                                                </div>
                                                <span className="font-medium text-slate-800 dark:text-white">
                                                    SSP #{index + 1}
                                                </span>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => removePayment(payment.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </motion.button>
                                        </div>

                                        {/* Form */}
                                        <div className="space-y-4">
                                            {/* Row: KAP & KJS */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* KAP Dropdown */}
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        KAP (Kode Akun Pajak)
                                                    </label>
                                                    <select
                                                        value={payment.kap}
                                                        onChange={(e) => updatePayment(payment.id, 'kap', e.target.value)}
                                                        className={`w-full h-12 px-4 rounded-lg border bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${isWarningKAP
                                                                ? 'border-amber-300 dark:border-amber-600'
                                                                : 'border-slate-300 dark:border-slate-600'
                                                            }`}
                                                    >
                                                        {KAP_OPTIONS.map(opt => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        {KAP_OPTIONS.find(k => k.value === payment.kap)?.description}
                                                    </p>
                                                </div>

                                                {/* KJS Dropdown - Dependent on KAP */}
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        KJS (Kode Jenis Setoran)
                                                    </label>
                                                    <select
                                                        value={payment.kjs}
                                                        onChange={(e) => updatePayment(payment.id, 'kjs', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                    >
                                                        {kjsOptions.map(opt => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label} {opt.primary ? '★' : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Row: Cara Pelunasan & Tanggal */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Cara Pelunasan */}
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        Cara Pelunasan
                                                    </label>
                                                    <select
                                                        value={payment.caraPelunasan}
                                                        onChange={(e) => updatePayment(payment.id, 'caraPelunasan', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                    >
                                                        {CARA_PELUNASAN_OPTIONS.map(opt => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Tanggal Setor */}
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        <Calendar className="w-4 h-4 inline mr-1" />
                                                        Tanggal Setor
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={payment.tanggalSetor}
                                                        onChange={(e) => updatePayment(payment.id, 'tanggalSetor', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* NTPN */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    <Hash className="w-4 h-4 inline mr-1" />
                                                    NTPN / Nomor Bukti Setor
                                                </label>
                                                <input
                                                    type="text"
                                                    value={payment.ntpn}
                                                    onChange={(e) => updatePayment(payment.id, 'ntpn', formatNTPN(e.target.value))}
                                                    placeholder="16 karakter alfanumerik"
                                                    maxLength={16}
                                                    className={`w-full h-12 px-4 rounded-lg border bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-mono tracking-wider uppercase ${payment.ntpn && !isNTPNValid
                                                            ? 'border-red-500 focus:ring-red-500'
                                                            : 'border-slate-300 dark:border-slate-600'
                                                        }`}
                                                />
                                                <div className="flex items-center justify-between mt-1">
                                                    {payment.ntpn && !isNTPNValid ? (
                                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            NTPN harus 16 digit sesuai bukti bank.
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            Contoh: A1B2C3D4E5F6G7H8
                                                        </p>
                                                    )}
                                                    <span className={`text-xs ${payment.ntpn?.length === 16 ? 'text-green-500' : 'text-slate-400'}`}>
                                                        {payment.ntpn?.length || 0}/16
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Jumlah Pembayaran */}
                                            <CurrencyInput
                                                label="Jumlah Pembayaran"
                                                id={`jumlah-${payment.id}`}
                                                value={payment.jumlahPembayaran}
                                                onChange={(value) => updatePayment(payment.id, 'jumlahPembayaran', value)}
                                                helpTitle="Jumlah Pembayaran"
                                                helpContent="Jumlah pajak yang disetorkan sesuai bukti NTPN."
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            </StaggerItem>
                        );
                    })}
                </AnimatePresence>
            </StaggerContainer>

            {/* Add Button */}
            <FadeIn delay={0.3}>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addPayment}
                    className="w-full h-14 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-500 text-slate-500 hover:text-primary-500 dark:text-slate-400 dark:hover:text-primary-400 flex items-center justify-center gap-2 transition-all bg-slate-50 dark:bg-slate-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/10"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Tambah Bukti Setor (SSP)</span>
                </motion.button>
            </FadeIn>

            {/* Empty State */}
            {taxPayments.length === 0 && (
                <FadeIn delay={0.4}>
                    <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                        <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Belum ada bukti setor pajak</p>
                        <p className="text-sm">Klik tombol "Tambah Bukti Setor" untuk memulai</p>
                    </div>
                </FadeIn>
            )}
        </div>
    );
}
