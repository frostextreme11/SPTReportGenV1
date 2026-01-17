import { useState } from 'react';
import { CreditCard, Plus, Trash2, Calendar, Hash, Info, AlertCircle, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CurrencyInput from '../ui/CurrencyInput';
import { useFormData } from '../../context/FormContext';
import { formatRupiah } from '../../utils/currency';
import { FadeIn, StaggerContainer, StaggerItem } from '../ui/AnimatedStep';

export default function Step6SSP() {
    const { formData, updateField } = useFormData();
    const taxPayments = formData.taxPayments || [];

    const addPayment = () => {
        const newPayment = {
            id: Date.now(),
            tanggalSetor: '',
            jumlahPembayaran: 0,
            ntpn: '', // NTPN atau Nomor PBK (16 digit)
        };
        updateField('taxPayments', [...taxPayments, newPayment]);
    };

    const updatePayment = (id, field, value) => {
        const updatedPayments = taxPayments.map(payment => {
            if (payment.id === id) {
                return { ...payment, [field]: value };
            }
            return payment;
        });
        updateField('taxPayments', updatedPayments);
    };

    const removePayment = (id) => {
        updateField('taxPayments', taxPayments.filter(payment => payment.id !== id));
    };

    // Validate NTPN (16 alphanumeric characters)
    const validateNTPN = (ntpn) => {
        if (!ntpn) return true; // Empty is allowed
        const cleaned = ntpn.replace(/[^A-Za-z0-9]/g, '');
        return cleaned.length === 16;
    };

    // Format NTPN (auto-capitalize, alphanumeric only, max 16)
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
                        <p className="font-medium mb-1">Aturan SPT 1771:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                            <li>KD-MAP: 411126 (PPh Badan) - Otomatis</li>
                            <li>KD JNS STR: 200 (Tahunan) - Otomatis</li>
                            <li>NTPN atau Nomor PBK: 16 digit</li>
                            <li>Jumlah Bayar tanpa titik atau koma</li>
                        </ul>
                    </div>
                </div>
            </FadeIn>

            {/* Fixed Values Info */}
            <FadeIn delay={0.15}>
                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">KD-MAP (Otomatis)</p>
                        <p className="font-mono font-bold text-slate-800 dark:text-white">411126</p>
                        <p className="text-xs text-slate-500">PPh Pasal 25/29 Badan</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">KD JNS STR (Otomatis)</p>
                        <p className="font-mono font-bold text-slate-800 dark:text-white">200</p>
                        <p className="text-xs text-slate-500">Tahunan</p>
                    </div>
                </div>
            </FadeIn>

            {/* Summary Card */}
            <FadeIn delay={0.2}>
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
                        const isNTPNValid = validateNTPN(payment.ntpn);

                        return (
                            <StaggerItem key={payment.id}>
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    transition={{ type: 'spring', damping: 25 }}
                                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
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
                                        {/* Tanggal Setor */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                <Calendar className="w-4 h-4 inline mr-1" />
                                                TGL SSP (Tanggal Setor)
                                            </label>
                                            <input
                                                type="date"
                                                value={payment.tanggalSetor}
                                                onChange={(e) => updatePayment(payment.id, 'tanggalSetor', e.target.value)}
                                                className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            />
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                Format CSV: dd/mm/yyyy
                                            </p>
                                        </div>

                                        {/* Jumlah Bayar */}
                                        <CurrencyInput
                                            label="Jumlah Bayar"
                                            id={`jumlah-${payment.id}`}
                                            value={payment.jumlahPembayaran}
                                            onChange={(value) => updatePayment(payment.id, 'jumlahPembayaran', value)}
                                            helpTitle="Jumlah Bayar"
                                            helpContent="Jumlah pembayaran yang dilakukan atas SSP (tanpa titik atau koma)."
                                        />

                                        {/* NTPN atau Nomor PBK */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                <Hash className="w-4 h-4 inline mr-1" />
                                                NTPN atau Nomor PBK (16 Digit)
                                            </label>
                                            <input
                                                type="text"
                                                value={payment.ntpn || ''}
                                                onChange={(e) => updatePayment(payment.id, 'ntpn', formatNTPN(e.target.value))}
                                                placeholder="16 digit alfanumerik"
                                                maxLength={16}
                                                className={`w-full h-12 px-4 rounded-lg border bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-mono tracking-wider uppercase ${payment.ntpn && !isNTPNValid
                                                        ? 'border-red-500 focus:ring-red-500'
                                                        : 'border-slate-300 dark:border-slate-600'
                                                    }`}
                                            />
                                            <div className="flex items-center justify-between mt-1">
                                                {payment.ntpn && !isNTPNValid ? (
                                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Harus tepat 16 digit
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
