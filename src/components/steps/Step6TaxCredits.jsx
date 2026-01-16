import { useState } from 'react';
import { Receipt, Plus, Trash2, Calendar, Building, Hash, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CurrencyInput from '../ui/CurrencyInput';
import { useFormData } from '../../context/FormContext';
import { formatRupiah } from '../../utils/currency';
import { FadeIn, StaggerContainer, StaggerItem } from '../ui/AnimatedStep';

// PPh Pasal options
const PPH_PASAL_OPTIONS = [
    { value: '21', label: 'PPh 21 - Penghasilan Karyawan' },
    { value: '22', label: 'PPh 22 - Impor/Bendaharawan' },
    { value: '23', label: 'PPh 23 - Jasa, Royalti, dll' },
    { value: '4(2)', label: 'PPh 4(2) - Final' },
];

export default function Step6TaxCredits() {
    const { formData, updateField } = useFormData();
    const taxCredits = formData.taxCredits || [];

    const addTaxCredit = () => {
        const newCredit = {
            id: Date.now(),
            namaPemotong: '',
            npwpPemotong: '',
            pasal: '23',
            jenis: 'Jasa',
            nilaiObjek: 0,
            jumlahDipotong: 0,
            nomorBukti: '',
            tanggal: '',
            alamat: '',
            ntpn: '',
        };
        updateField('taxCredits', [...taxCredits, newCredit]);
    };

    const updateCredit = (id, field, value) => {
        const updatedCredits = taxCredits.map(credit => {
            if (credit.id === id) {
                return { ...credit, [field]: value };
            }
            return credit;
        });
        updateField('taxCredits', updatedCredits);
    };

    const removeCredit = (id) => {
        updateField('taxCredits', taxCredits.filter(credit => credit.id !== id));
    };

    const getTotalNilaiObjek = () => {
        return taxCredits.reduce((sum, credit) => sum + (credit.nilaiObjek || 0), 0);
    };

    const getTotalDipotong = () => {
        return taxCredits.reduce((sum, credit) => sum + (credit.jumlahDipotong || 0), 0);
    };

    // Validate NPWP (15-16 digits)
    const validateNPWP = (npwp) => {
        const digits = npwp.replace(/\D/g, '');
        return digits.length >= 15 && digits.length <= 16;
    };

    // Format NPWP display
    const formatNPWPDisplay = (npwp) => {
        const digits = npwp.replace(/\D/g, '');
        if (digits.length <= 2) return digits;
        if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
        if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
        if (digits.length <= 9) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8)}`;
        if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8, 9)}-${digits.slice(9)}`;
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8, 9)}-${digits.slice(9, 12)}.${digits.slice(12)}`;
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
                        className="inline-flex p-4 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl shadow-lg shadow-cyan-500/30 mb-4"
                    >
                        <Receipt className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Bukti Potong PPh
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Lampiran III - Kredit Pajak Dalam Negeri (PPh 22/23)
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
                            <li>Masukkan bukti potong PPh 22/23 yang diterima dari pemotong</li>
                            <li>NPWP Pemotong harus 15-16 digit</li>
                            <li>Nomor bukti sesuai dengan yang tertera di bukti potong</li>
                        </ul>
                    </div>
                </div>
            </FadeIn>

            {/* Summary Cards */}
            <FadeIn delay={0.2}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl p-4 text-white">
                        <p className="text-sm text-cyan-100">Total Nilai Objek</p>
                        <p className="text-xl font-bold mt-1">{formatRupiah(getTotalNilaiObjek())}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-4 text-white">
                        <p className="text-sm text-emerald-100">Total PPh Dipotong</p>
                        <p className="text-xl font-bold mt-1">{formatRupiah(getTotalDipotong())}</p>
                    </div>
                </div>
            </FadeIn>

            {/* Tax Credits List */}
            <StaggerContainer className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {taxCredits.map((credit, index) => (
                        <StaggerItem key={credit.id}>
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
                                        <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                                            <Receipt className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                        </div>
                                        <span className="font-medium text-slate-800 dark:text-white">
                                            Bukti Potong #{index + 1}
                                        </span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => removeCredit(credit.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                </div>

                                {/* Form - Mobile Card View */}
                                <div className="space-y-4">
                                    {/* Nama Pemotong */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            <Building className="w-4 h-4 inline mr-1" />
                                            Nama Pemotong
                                        </label>
                                        <input
                                            type="text"
                                            value={credit.namaPemotong}
                                            onChange={(e) => updateCredit(credit.id, 'namaPemotong', e.target.value)}
                                            placeholder="Nama perusahaan pemotong"
                                            className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    {/* NPWP Pemotong */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            <Hash className="w-4 h-4 inline mr-1" />
                                            NPWP Pemotong
                                        </label>
                                        <input
                                            type="text"
                                            value={formatNPWPDisplay(credit.npwpPemotong)}
                                            onChange={(e) => {
                                                const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                                                updateCredit(credit.id, 'npwpPemotong', digits);
                                            }}
                                            placeholder="XX.XXX.XXX.X-XXX.XXX"
                                            className={`w-full h-12 px-4 rounded-lg border bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${credit.npwpPemotong && !validateNPWP(credit.npwpPemotong)
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : 'border-slate-300 dark:border-slate-600'
                                                }`}
                                        />
                                        {credit.npwpPemotong && !validateNPWP(credit.npwpPemotong) && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                NPWP harus 15-16 digit
                                            </p>
                                        )}
                                    </div>

                                    {/* Row: Pasal & Jenis */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Pasal PPh
                                            </label>
                                            <select
                                                value={credit.pasal}
                                                onChange={(e) => updateCredit(credit.id, 'pasal', e.target.value)}
                                                className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            >
                                                {PPH_PASAL_OPTIONS.map(p => (
                                                    <option key={p.value} value={p.value}>{p.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Jenis Penghasilan
                                            </label>
                                            <input
                                                type="text"
                                                value={credit.jenis}
                                                onChange={(e) => updateCredit(credit.id, 'jenis', e.target.value)}
                                                placeholder="Jasa, Royalti, dll"
                                                className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Row: Nomor Bukti & Tanggal */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                <Hash className="w-4 h-4 inline mr-1" />
                                                Nomor Bukti Potong
                                            </label>
                                            <input
                                                type="text"
                                                value={credit.nomorBukti}
                                                onChange={(e) => updateCredit(credit.id, 'nomorBukti', e.target.value)}
                                                placeholder="XX-XXXXXXXX"
                                                className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                <Calendar className="w-4 h-4 inline mr-1" />
                                                Tanggal Bukti Potong
                                            </label>
                                            <input
                                                type="date"
                                                value={credit.tanggal}
                                                onChange={(e) => updateCredit(credit.id, 'tanggal', e.target.value)}
                                                className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Nilai Objek */}
                                    <CurrencyInput
                                        label="Nilai Objek Pemotongan"
                                        id={`nilai-objek-${credit.id}`}
                                        value={credit.nilaiObjek}
                                        onChange={(value) => updateCredit(credit.id, 'nilaiObjek', value)}
                                        helpTitle="Nilai Objek Pemotongan"
                                        helpContent="Dasar Pengenaan Pajak atau nilai bruto sebelum dipotong PPh."
                                    />

                                    {/* Jumlah Dipotong */}
                                    <CurrencyInput
                                        label="Jumlah PPh Dipotong"
                                        id={`jumlah-dipotong-${credit.id}`}
                                        value={credit.jumlahDipotong}
                                        onChange={(value) => updateCredit(credit.id, 'jumlahDipotong', value)}
                                        helpTitle="Jumlah PPh Dipotong"
                                        helpContent="Jumlah pajak yang sudah dipotong oleh pemotong."
                                    />
                                </div>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </AnimatePresence>
            </StaggerContainer>

            {/* Add Button */}
            <FadeIn delay={0.3}>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addTaxCredit}
                    className="w-full h-14 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-500 text-slate-500 hover:text-primary-500 dark:text-slate-400 dark:hover:text-primary-400 flex items-center justify-center gap-2 transition-all bg-slate-50 dark:bg-slate-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/10"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Tambah Bukti Potong</span>
                </motion.button>
            </FadeIn>

            {/* Empty State */}
            {taxCredits.length === 0 && (
                <FadeIn delay={0.4}>
                    <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                        <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Belum ada bukti potong yang ditambahkan</p>
                        <p className="text-sm">Klik tombol "Tambah Bukti Potong" untuk memulai</p>
                    </div>
                </FadeIn>
            )}
        </div>
    );
}
