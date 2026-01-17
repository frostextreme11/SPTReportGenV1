import { useState } from 'react';
import { Receipt, Plus, Trash2, Calendar, Building, Hash, Info, AlertCircle, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CurrencyInput from '../ui/CurrencyInput';
import { useFormData } from '../../context/FormContext';
import { formatRupiah } from '../../utils/currency';
import { FadeIn, StaggerContainer, StaggerItem } from '../ui/AnimatedStep';

// Jenis Penghasilan options based on Pasal
const JENIS_PENGHASILAN = {
    '22': [
        { kode: '01', label: 'Badan Usaha Industri Semen' },
        { kode: '02', label: 'Badan Usaha Industri Farmasi' },
        { kode: '03', label: 'Badan Usaha Industri Kertas' },
        { kode: '04', label: 'Badan Usaha Industri Baja' },
        { kode: '05', label: 'Badan Usaha Industri Otomotif' },
        { kode: '06', label: 'Pembelian Barang Oleh Bendaharawan' },
        { kode: '07', label: 'Nilai Impor Bank Devisa / Ditjen Bea dan Cukai' },
        { kode: '08', label: 'Hasil Lelang' },
        { kode: '09', label: 'Penjualan BBM, BBG dan Pelumas' },
        { kode: '10', label: 'Pembelian Barang Keperluan Industri dlm Sektor Perhutanan' },
        { kode: '11', label: 'Pembelian Barang Keperluan dlm Sektor Perkebunan' },
        { kode: '12', label: 'Pembelian Barang Keperluan dlm Sektor Pertanian' },
        { kode: '13', label: 'Pembelian Barang Keperluan dlm Sektor Perikanan' },
        { kode: '14', label: 'Penjualan Emas Batangan oleh Badan Usaha' },
        { kode: '15', label: 'Ekspor Komoditas Tambang, Minerba dan Mineral Bukan Logam' },
        { kode: '16', label: 'Pembelian Barang oleh Badan Tertentu' },
        { kode: '17', label: 'Penjualan Kendaraan Bermotor DN' },
    ],
    '23': [
        { kode: '18', label: 'Pembelian Minerba dan Mineral Bukan Logam dari Pemegang IUP' },
        { kode: '19', label: 'Dividen' },
        { kode: '20', label: 'Bunga' },
        { kode: '21', label: 'Royalti' },
        { kode: '22', label: 'Hadiah dan Penghargaan' },
        { kode: '23', label: 'Bunga Simpanan yang Dibayarkan oleh Koperasi' },
        { kode: '24', label: 'Imbalan / Jasa Lainnya' },
        { kode: '25', label: 'Sewa dan Penghasilan Lain Sehubungan dgn Penggunaan Harta' },
    ],
    '26': [
        { kode: '19', label: 'Dividen' },
        { kode: '20', label: 'Bunga' },
        { kode: '21', label: 'Royalti' },
        { kode: '22', label: 'Hadiah dan Penghargaan' },
        { kode: '23', label: 'Bunga Simpanan yang Dibayarkan oleh Koperasi' },
        { kode: '24', label: 'Imbalan / Jasa Lainnya' },
        { kode: '25', label: 'Sewa dan Penghasilan Lain Sehubungan dgn Penggunaan Harta' },
    ],
};

// PPh Pasal options
const PPH_PASAL_OPTIONS = [
    { value: '22', label: 'Pasal 22' },
    { value: '23', label: 'Pasal 23' },
    { value: '26', label: 'Pasal 26' },
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
            kodeJenis: '24', // Default to Imbalan/Jasa Lainnya
            nilaiObjek: 0,
            jumlahDipotong: 0,
            nomorBukti: '',
            tanggal: '',
            alamatPemotong: '',
            ntpn: '',
        };
        updateField('taxCredits', [...taxCredits, newCredit]);
    };

    const updateCredit = (id, field, value) => {
        const updatedCredits = taxCredits.map(credit => {
            if (credit.id === id) {
                const updated = { ...credit, [field]: value };

                // If Pasal changes, reset kodeJenis to first available option
                if (field === 'pasal') {
                    const jenisOptions = JENIS_PENGHASILAN[value] || [];
                    if (jenisOptions.length > 0) {
                        updated.kodeJenis = jenisOptions[0].kode;
                    }
                }

                return updated;
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

    // Validate NPWP (exactly 15 digits for this form)
    const validateNPWP = (npwp) => {
        const digits = npwp.replace(/\D/g, '');
        return digits.length === 15;
    };

    // Format NPWP display (15 digits: XX.XXX.XXX.X-XXX.XXX)
    const formatNPWPDisplay = (npwp) => {
        const digits = npwp.replace(/\D/g, '');
        if (digits.length <= 2) return digits;
        if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
        if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
        if (digits.length <= 9) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8)}`;
        if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8, 9)}-${digits.slice(9)}`;
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8, 9)}-${digits.slice(9, 12)}.${digits.slice(12)}`;
    };

    // Validate NTPN (16 alphanumeric characters)
    const validateNTPN = (ntpn) => {
        if (!ntpn) return true; // Empty is valid
        const cleaned = ntpn.replace(/[^A-Za-z0-9]/g, '');
        return cleaned.length === 16;
    };

    // Format NTPN (auto-capitalize, alphanumeric only)
    const formatNTPN = (value) => {
        return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 16);
    };

    // Get Jenis Penghasilan options based on Pasal
    const getJenisOptions = (pasal) => {
        return JENIS_PENGHASILAN[pasal] || JENIS_PENGHASILAN['23'];
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
                        Lampiran III - Kredit Pajak Dalam Negeri (PPh 22/23/26)
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
                            <li>Masukkan bukti potong PPh 22/23/26 yang diterima dari pemotong</li>
                            <li>NPWP Pemotong harus tepat 15 digit</li>
                            <li>NTPN harus 16 karakter alfanumerik sesuai bukti bank</li>
                            <li>Jumlah PPh Dipotong tidak boleh melebihi Nilai Objek</li>
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
                    {taxCredits.map((credit, index) => {
                        const jenisOptions = getJenisOptions(credit.pasal);
                        const isNPWPValid = !credit.npwpPemotong || validateNPWP(credit.npwpPemotong);
                        const isNTPNValid = validateNTPN(credit.ntpn);
                        const isPPhValid = (credit.jumlahDipotong || 0) <= (credit.nilaiObjek || 0);

                        return (
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
                                                Nama Pemotong/Pemungut
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
                                                NPWP Pemotong (15 digit)
                                            </label>
                                            <input
                                                type="text"
                                                value={formatNPWPDisplay(credit.npwpPemotong)}
                                                onChange={(e) => {
                                                    const digits = e.target.value.replace(/\D/g, '').slice(0, 15);
                                                    updateCredit(credit.id, 'npwpPemotong', digits);
                                                }}
                                                placeholder="XX.XXX.XXX.X-XXX.XXX"
                                                className={`w-full h-12 px-4 rounded-lg border bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${!isNPWPValid
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : 'border-slate-300 dark:border-slate-600'
                                                    }`}
                                            />
                                            <div className="flex items-center justify-between mt-1">
                                                {!isNPWPValid && (
                                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        NPWP harus tepat 15 digit
                                                    </p>
                                                )}
                                                <span className={`text-xs ml-auto ${credit.npwpPemotong?.length === 15 ? 'text-green-500' : 'text-slate-400'}`}>
                                                    {credit.npwpPemotong?.length || 0}/15
                                                </span>
                                            </div>
                                        </div>

                                        {/* Row: Pasal & Jenis Penghasilan */}
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
                                                    Jenis Penghasilan (Kode)
                                                </label>
                                                <select
                                                    value={credit.kodeJenis}
                                                    onChange={(e) => updateCredit(credit.id, 'kodeJenis', e.target.value)}
                                                    className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                >
                                                    {jenisOptions.map(j => (
                                                        <option key={j.kode} value={j.kode}>
                                                            {j.kode} - {j.label}
                                                        </option>
                                                    ))}
                                                </select>
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

                                        {/* Alamat Pemotong */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                <MapPin className="w-4 h-4 inline mr-1" />
                                                Alamat Pemotong/Pemungut
                                            </label>
                                            <input
                                                type="text"
                                                value={credit.alamatPemotong}
                                                onChange={(e) => updateCredit(credit.id, 'alamatPemotong', e.target.value)}
                                                placeholder="Alamat lengkap pemotong/pemungut"
                                                className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            />
                                        </div>

                                        {/* NTPN */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                <Hash className="w-4 h-4 inline mr-1" />
                                                NTPN / Nomor PBK (16 digit)
                                            </label>
                                            <input
                                                type="text"
                                                value={credit.ntpn}
                                                onChange={(e) => updateCredit(credit.id, 'ntpn', formatNTPN(e.target.value))}
                                                placeholder="16 karakter alfanumerik"
                                                maxLength={16}
                                                className={`w-full h-12 px-4 rounded-lg border bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-mono tracking-wider uppercase ${credit.ntpn && !isNTPNValid
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : 'border-slate-300 dark:border-slate-600'
                                                    }`}
                                            />
                                            <div className="flex items-center justify-between mt-1">
                                                {credit.ntpn && !isNTPNValid ? (
                                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        NTPN harus 16 digit sesuai bukti bank
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Contoh: A1B2C3D4E5F6G7H8
                                                    </p>
                                                )}
                                                <span className={`text-xs ${credit.ntpn?.length === 16 ? 'text-green-500' : 'text-slate-400'}`}>
                                                    {credit.ntpn?.length || 0}/16
                                                </span>
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
                                        <div>
                                            <CurrencyInput
                                                label="Jumlah PPh Dipotong"
                                                id={`jumlah-dipotong-${credit.id}`}
                                                value={credit.jumlahDipotong}
                                                onChange={(value) => updateCredit(credit.id, 'jumlahDipotong', value)}
                                                helpTitle="Jumlah PPh Dipotong"
                                                helpContent="Jumlah pajak yang sudah dipotong oleh pemotong."
                                                error={!isPPhValid}
                                            />
                                            {!isPPhValid && (
                                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Jumlah PPh tidak boleh melebihi Nilai Objek Pemotongan
                                                </p>
                                            )}
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
