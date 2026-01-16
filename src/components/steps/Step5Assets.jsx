import { useState } from 'react';
import { Package, Plus, Trash2, Calendar, DollarSign, Building2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CurrencyInput from '../ui/CurrencyInput';
import { useFormData } from '../../context/FormContext';
import { formatRupiah } from '../../utils/currency';
import { FadeIn, StaggerContainer, StaggerItem } from '../ui/AnimatedStep';

// Asset group options for depreciation
const KELOMPOK_HARTA = [
    { value: '1', label: 'Kelompok 1 (4 tahun)', rate: 25 },
    { value: '2', label: 'Kelompok 2 (8 tahun)', rate: 12.5 },
    { value: '3', label: 'Kelompok 3 (16 tahun)', rate: 6.25 },
    { value: '4', label: 'Kelompok 4 (20 tahun)', rate: 5 },
    { value: 'bangunan_permanen', label: 'Bangunan Permanen (20 tahun)', rate: 5 },
    { value: 'bangunan_tidak_permanen', label: 'Bangunan Tidak Permanen (10 tahun)', rate: 10 },
];

const BULAN_OPTIONS = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
];

export default function Step5Assets() {
    const { formData, updateField } = useFormData();
    const assets = formData.assets || [];

    const addAsset = () => {
        const newAsset = {
            id: Date.now(),
            namaHarta: '',
            kelompokHarta: '1',
            bulanPerolehan: '01',
            tahunPerolehan: formData.tahunPajak,
            hargaPerolehan: 0,
            nilaiSisaBuku: 0,
            penyusutanTahunIni: 0,
            keterangan: '',
        };
        updateField('assets', [...assets, newAsset]);
    };

    const updateAsset = (id, field, value) => {
        const updatedAssets = assets.map(asset => {
            if (asset.id === id) {
                const updated = { ...asset, [field]: value };

                // Auto-calculate depreciation when harga perolehan or kelompok changes
                if (field === 'hargaPerolehan' || field === 'kelompokHarta') {
                    const kelompok = KELOMPOK_HARTA.find(k => k.value === (field === 'kelompokHarta' ? value : updated.kelompokHarta));
                    if (kelompok) {
                        const harga = field === 'hargaPerolehan' ? value : updated.hargaPerolehan;
                        updated.penyusutanTahunIni = Math.round(harga * (kelompok.rate / 100));
                    }
                }

                return updated;
            }
            return asset;
        });
        updateField('assets', updatedAssets);
    };

    const removeAsset = (id) => {
        updateField('assets', assets.filter(asset => asset.id !== id));
    };

    const getTotalHargaPerolehan = () => {
        return assets.reduce((sum, asset) => sum + (asset.hargaPerolehan || 0), 0);
    };

    const getTotalPenyusutan = () => {
        return assets.reduce((sum, asset) => sum + (asset.penyusutanTahunIni || 0), 0);
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
                        className="inline-flex p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/30 mb-4"
                    >
                        <Package className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Daftar Harta & Penyusutan
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Lampiran 1A - Daftar Penyusutan dan Amortisasi Fiskal
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
                            <li>Masukkan semua aset tetap yang dimiliki perusahaan</li>
                            <li>Penyusutan akan dihitung otomatis berdasarkan kelompok harta</li>
                            <li>Format sesuai dengan DJP e-Form Lampiran 1A</li>
                        </ul>
                    </div>
                </div>
            </FadeIn>

            {/* Summary Cards */}
            <FadeIn delay={0.2}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white">
                        <p className="text-sm text-amber-100">Total Harga Perolehan</p>
                        <p className="text-xl font-bold mt-1">{formatRupiah(getTotalHargaPerolehan())}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 text-white">
                        <p className="text-sm text-purple-100">Total Penyusutan Tahun Ini</p>
                        <p className="text-xl font-bold mt-1">{formatRupiah(getTotalPenyusutan())}</p>
                    </div>
                </div>
            </FadeIn>

            {/* Assets List */}
            <StaggerContainer className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {assets.map((asset, index) => (
                        <StaggerItem key={asset.id}>
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
                                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                            <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <span className="font-medium text-slate-800 dark:text-white">
                                            Aset #{index + 1}
                                        </span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => removeAsset(asset.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                </div>

                                {/* Form Grid - Card View on Mobile */}
                                <div className="space-y-4">
                                    {/* Nama Harta */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Nama Harta
                                        </label>
                                        <input
                                            type="text"
                                            value={asset.namaHarta}
                                            onChange={(e) => updateAsset(asset.id, 'namaHarta', e.target.value)}
                                            placeholder="Contoh: Mobil Toyota Avanza"
                                            className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    {/* Row: Kelompok & Bulan Perolehan */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Kelompok Harta
                                            </label>
                                            <select
                                                value={asset.kelompokHarta}
                                                onChange={(e) => updateAsset(asset.id, 'kelompokHarta', e.target.value)}
                                                className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            >
                                                {KELOMPOK_HARTA.map(k => (
                                                    <option key={k.value} value={k.value}>{k.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Bulan Perolehan
                                            </label>
                                            <select
                                                value={asset.bulanPerolehan}
                                                onChange={(e) => updateAsset(asset.id, 'bulanPerolehan', e.target.value)}
                                                className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            >
                                                {BULAN_OPTIONS.map(b => (
                                                    <option key={b.value} value={b.value}>{b.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Row: Tahun Perolehan */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Tahun Perolehan (YYYY)
                                        </label>
                                        <input
                                            type="text"
                                            value={asset.tahunPerolehan}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                updateAsset(asset.id, 'tahunPerolehan', value);
                                            }}
                                            placeholder="2024"
                                            maxLength={4}
                                            className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    {/* Harga Perolehan */}
                                    <CurrencyInput
                                        label="Harga Perolehan (IDR)"
                                        id={`harga-${asset.id}`}
                                        value={asset.hargaPerolehan}
                                        onChange={(value) => updateAsset(asset.id, 'hargaPerolehan', value)}
                                        helpTitle="Harga Perolehan"
                                        helpContent="Nilai perolehan aset termasuk biaya-biaya yang dikeluarkan untuk mendapatkan aset tersebut."
                                    />

                                    {/* Auto-calculated Depreciation */}
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                <DollarSign className="w-4 h-4 inline mr-1" />
                                                Penyusutan Tahun Ini
                                            </span>
                                            <motion.span
                                                key={asset.penyusutanTahunIni}
                                                initial={{ scale: 1.1 }}
                                                animate={{ scale: 1 }}
                                                className="font-bold text-purple-600 dark:text-purple-400"
                                            >
                                                {formatRupiah(asset.penyusutanTahunIni)}
                                            </motion.span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            *Dihitung otomatis berdasarkan kelompok harta
                                        </p>
                                    </div>

                                    {/* Keterangan */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Keterangan (Opsional)
                                        </label>
                                        <input
                                            type="text"
                                            value={asset.keterangan}
                                            onChange={(e) => updateAsset(asset.id, 'keterangan', e.target.value)}
                                            placeholder="Keterangan tambahan..."
                                            className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>
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
                    onClick={addAsset}
                    className="w-full h-14 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-500 text-slate-500 hover:text-primary-500 dark:text-slate-400 dark:hover:text-primary-400 flex items-center justify-center gap-2 transition-all bg-slate-50 dark:bg-slate-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/10"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Tambah Aset</span>
                </motion.button>
            </FadeIn>

            {/* Empty State */}
            {assets.length === 0 && (
                <FadeIn delay={0.4}>
                    <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Belum ada aset yang ditambahkan</p>
                        <p className="text-sm">Klik tombol "Tambah Aset" untuk memulai</p>
                    </div>
                </FadeIn>
            )}
        </div>
    );
}
