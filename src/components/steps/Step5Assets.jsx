import { useState } from 'react';
import { Package, Plus, Trash2, Calendar, DollarSign, Building2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CurrencyInput from '../ui/CurrencyInput';
import { useFormData } from '../../context/FormContext';
import { formatRupiah } from '../../utils/currency';
import { FadeIn, StaggerContainer, StaggerItem } from '../ui/AnimatedStep';

// Jenis Harta (1-2)
const JENIS_HARTA = [
    { value: '1', label: '1 - Harta Berwujud' },
    { value: '2', label: '2 - Kelompok Bangunan' },
];

// Kelompok Harta (1-6)
const KELOMPOK_HARTA = [
    { value: '1', label: '1 - Kelompok 1 (4 thn)', rate: 25 },
    { value: '2', label: '2 - Kelompok 2 (8 thn)', rate: 12.5 },
    { value: '3', label: '3 - Kelompok 3 (16 thn)', rate: 6.25 },
    { value: '4', label: '4 - Kelompok 4 (20 thn)', rate: 5 },
    { value: '5', label: '5 - Permanen (20 thn)', rate: 5 },
    { value: '6', label: '6 - Tidak Permanen (10 thn)', rate: 10 },
];

// Jenis Penyusutan Komersial (1-7)
const JENIS_PENYUSUTAN_KOMERSIAL = [
    { value: '1', label: '1 - GL (Garis Lurus)' },
    { value: '2', label: '2 - JAT (Jumlah Angka Tahun)' },
    { value: '3', label: '3 - SM (Saldo Menurun)' },
    { value: '4', label: '4 - SMG (Saldo Menurun Ganda)' },
    { value: '5', label: '5 - JJJ (Jumlah Jam Jasa)' },
    { value: '6', label: '6 - JSP (Jumlah Satuan Produksi)' },
    { value: '7', label: '7 - ML (Metode Lainnya)' },
];

// Jenis Penyusutan Fiskal (1-2)
const JENIS_PENYUSUTAN_FISKAL = [
    { value: '1', label: '1 - GL (Garis Lurus)' },
    { value: '2', label: '2 - SM (Saldo Menurun)' },
];

// Bulan Perolehan (1-12)
const BULAN_OPTIONS = [
    { value: '1', label: '1 - Januari' },
    { value: '2', label: '2 - Februari' },
    { value: '3', label: '3 - Maret' },
    { value: '4', label: '4 - April' },
    { value: '5', label: '5 - Mei' },
    { value: '6', label: '6 - Juni' },
    { value: '7', label: '7 - Juli' },
    { value: '8', label: '8 - Agustus' },
    { value: '9', label: '9 - September' },
    { value: '10', label: '10 - Oktober' },
    { value: '11', label: '11 - November' },
    { value: '12', label: '12 - Desember' },
];

export default function Step5Assets() {
    const { formData, updateField } = useFormData();
    const assets = formData.assets || [];

    const addAsset = () => {
        const newAsset = {
            id: Date.now(),
            jenisHarta: '1', // Kode Jenis Harta (1-6)
            kelompokHarta: '1', // Kode Kelompok Harta (1-5)
            jenisUsaha: '111', // Jenis Usaha (user can edit)
            namaHarta: '',
            bulanPerolehan: '1', // 1-12
            tahunPerolehan: formData.tahunPajak,
            jenisPenyusutanKomersial: '1', // 1-7
            jenisPenyusutanFiskal: '1', // 1-2
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

                // Auto-update jenisUsaha when jenisHarta or kelompokHarta changes
                if (field === 'jenisHarta' || field === 'kelompokHarta') {
                    const jh = field === 'jenisHarta' ? value : updated.jenisHarta;
                    const kh = field === 'kelompokHarta' ? value : updated.kelompokHarta;
                    updated.jenisUsaha = `${jh}${kh}1`;
                }

                // Auto-calculate depreciation when hargaPerolehan or kelompokHarta changes
                if (field === 'hargaPerolehan' || field === 'kelompokHarta') {
                    const kelompok = KELOMPOK_HARTA.find(k => k.value === (field === 'kelompokHarta' ? value : updated.kelompokHarta));
                    if (kelompok && kelompok.rate) {
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
                            <li>Jenis Usaha = gabungan kode (cth: 111, 211, 311)</li>
                            <li>Bulan Perolehan diisi angka 1-12</li>
                            <li>Nilai tanpa titik atau koma (cth: 250000)</li>
                            <li>Penyusutan dihitung otomatis berdasarkan Jenis Harta</li>
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
                                        <div>
                                            <span className="font-medium text-slate-800 dark:text-white">
                                                Aset #{index + 1}
                                            </span>
                                        </div>
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

                                {/* Form Grid */}
                                <div className="space-y-4">
                                    {/* Row: Jenis Harta & Kelompok Harta */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Jenis Harta
                                            </label>
                                            <select
                                                value={asset.jenisHarta}
                                                onChange={(e) => updateAsset(asset.id, 'jenisHarta', e.target.value)}
                                                className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            >
                                                {JENIS_HARTA.map(j => (
                                                    <option key={j.value} value={j.value}>{j.label}</option>
                                                ))}
                                            </select>
                                        </div>

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
                                    </div>

                                    {/* Jenis Usaha */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Jenis Usaha (Kode)
                                        </label>
                                        <input
                                            type="text"
                                            value={asset.jenisUsaha}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                                                updateAsset(asset.id, 'jenisUsaha', value);
                                            }}
                                            placeholder="Contoh: 111, 211, 311"
                                            maxLength={3}
                                            className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Gabungan kode Jenis Harta + kode lainnya
                                        </p>
                                    </div>

                                    {/* Nama Harta */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Nama Harta
                                        </label>
                                        <input
                                            type="text"
                                            value={asset.namaHarta}
                                            onChange={(e) => updateAsset(asset.id, 'namaHarta', e.target.value)}
                                            placeholder="Contoh: Mobil, Motor, Traktor"
                                            className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    {/* Row: Bulan & Tahun Perolehan */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Bln Perolehan (1-12)
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

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                <Calendar className="w-4 h-4 inline mr-1" />
                                                Thn Perolehan
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
                                    </div>

                                    {/* Row: Jenis Penyusutan Komersial & Fiskal */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Jenis Penyusutan Komersial
                                            </label>
                                            <select
                                                value={asset.jenisPenyusutanKomersial}
                                                onChange={(e) => updateAsset(asset.id, 'jenisPenyusutanKomersial', e.target.value)}
                                                className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            >
                                                {JENIS_PENYUSUTAN_KOMERSIAL.map(m => (
                                                    <option key={m.value} value={m.value}>{m.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Jenis Penyusutan Fiskal
                                            </label>
                                            <select
                                                value={asset.jenisPenyusutanFiskal}
                                                onChange={(e) => updateAsset(asset.id, 'jenisPenyusutanFiskal', e.target.value)}
                                                className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            >
                                                {JENIS_PENYUSUTAN_FISKAL.map(m => (
                                                    <option key={m.value} value={m.value}>{m.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Harga Perolehan */}
                                    <CurrencyInput
                                        label="Harga Perolehan"
                                        id={`harga-${asset.id}`}
                                        value={asset.hargaPerolehan}
                                        onChange={(value) => updateAsset(asset.id, 'hargaPerolehan', value)}
                                        helpTitle="Harga Perolehan"
                                        helpContent="Nilai perolehan aset termasuk biaya-biaya yang dikeluarkan."
                                    />

                                    {/* Nilai Sisa Buku */}
                                    <CurrencyInput
                                        label="Nilai Sisa Buku"
                                        id={`sisa-buku-${asset.id}`}
                                        value={asset.nilaiSisaBuku}
                                        onChange={(value) => updateAsset(asset.id, 'nilaiSisaBuku', value)}
                                        helpTitle="Nilai Sisa Buku"
                                        helpContent="Nilai buku aset setelah dikurangi akumulasi penyusutan."
                                    />

                                    {/* Auto-calculated Depreciation */}
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                <DollarSign className="w-4 h-4 inline mr-1" />
                                                Penyusutan Fiskal Tahun Ini
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
                                            *Dihitung otomatis berdasarkan Harga Perolehan × Rate Jenis Harta
                                        </p>
                                    </div>

                                    {/* Keterangan */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Keterangan Nama Harta
                                        </label>
                                        <input
                                            type="text"
                                            value={asset.keterangan}
                                            onChange={(e) => updateAsset(asset.id, 'keterangan', e.target.value)}
                                            placeholder="Contoh: Honda, Avanza, Merk ABC"
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
