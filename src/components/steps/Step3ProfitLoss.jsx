import { useEffect } from 'react';
import { Receipt, TrendingDown, ArrowRight, Minus, Plus, Equal } from 'lucide-react';
import { motion } from 'framer-motion';
import CurrencyInput from '../ui/CurrencyInput';
import { useFormData } from '../../context/FormContext';
import { formatRupiah } from '../../utils/currency';
import { FadeIn, StaggerContainer, StaggerItem } from '../ui/AnimatedStep';

export default function Step3ProfitLoss() {
    const {
        formData,
        updateField,
        getTotalPeredaran,
        getLabaKotor,
        getLabaBersih
    } = useFormData();

    const totalPeredaran = getTotalPeredaran();
    const labaKotor = getLabaKotor();
    const labaBersih = getLabaBersih();

    // Auto-sync pendapatan with total peredaran from Step 2
    // This runs whenever the component mounts or totalPeredaran changes
    useEffect(() => {
        // Always sync pendapatan with totalPeredaran when totalPeredaran changes
        // This ensures that when user goes back to Step 2, changes values, and returns,
        // the pendapatan field is updated accordingly
        if (totalPeredaran > 0) {
            updateField('pendapatan', totalPeredaran);
        }
    }, [totalPeredaran]);

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <FadeIn>
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="inline-flex p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30 mb-4"
                    >
                        <Receipt className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Laporan Laba Rugi
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Hitung laba bersih perusahaan Anda
                    </p>
                </div>
            </FadeIn>

            <div className="max-w-xl mx-auto space-y-6">
                {/* Revenue Section */}
                <StaggerContainer>
                    <StaggerItem>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingDown className="w-5 h-5 text-green-500 rotate-180" />
                                <h3 className="font-semibold text-slate-800 dark:text-white">Pendapatan</h3>
                            </div>
                            <CurrencyInput
                                label="Pendapatan Usaha"
                                id="pendapatan"
                                value={formData.pendapatan}
                                onChange={(value) => updateField('pendapatan', value)}
                                helpTitle="Pendapatan Usaha"
                                helpContent={`Total pendapatan dari kegiatan usaha utama. Nilai ini otomatis terisi dari total peredaran usaha (${formatRupiah(totalPeredaran)}) tapi dapat diubah manual.`}
                            />
                        </div>
                    </StaggerItem>

                    {/* Calculation Visual */}
                    <StaggerItem>
                        <div className="flex justify-center py-2">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
                            >
                                <Minus className="w-5 h-5 text-red-500" />
                            </motion.div>
                        </div>
                    </StaggerItem>

                    {/* COGS Section */}
                    <StaggerItem>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                            <CurrencyInput
                                label="Harga Pokok Penjualan (HPP)"
                                id="hpp"
                                value={formData.hpp}
                                onChange={(value) => updateField('hpp', value)}
                                helpTitle="Harga Pokok Penjualan (HPP)"
                                helpContent="Biaya langsung yang dikeluarkan untuk memproduksi atau membeli barang/jasa yang dijual. Termasuk bahan baku, tenaga kerja langsung, dan overhead produksi."
                            />
                        </div>
                    </StaggerItem>

                    {/* Calculation Visual */}
                    <StaggerItem>
                        <div className="flex justify-center py-2">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"
                            >
                                <Equal className="w-5 h-5 text-primary-500" />
                            </motion.div>
                        </div>
                    </StaggerItem>

                    {/* Gross Profit Result */}
                    <StaggerItem>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`
                rounded-xl p-5 text-center
                ${labaKotor >= 0
                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800'
                                    : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800'
                                }
              `}
                        >
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Laba Kotor</span>
                            <motion.p
                                key={labaKotor}
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                className={`text-2xl font-bold mt-1 ${labaKotor >= 0
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                    }`}
                            >
                                {formatRupiah(labaKotor)}
                            </motion.p>
                        </motion.div>
                    </StaggerItem>
                </StaggerContainer>

                {/* Operating Expenses Section */}
                <StaggerContainer className="space-y-4">
                    <StaggerItem>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-5 h-5 text-red-500" />
                                <h3 className="font-semibold text-slate-800 dark:text-white">Beban Operasional</h3>
                            </div>
                            <CurrencyInput
                                label="Biaya Operasional"
                                id="biayaOperasional"
                                value={formData.biayaOperasional}
                                onChange={(value) => updateField('biayaOperasional', value)}
                                helpTitle="Biaya Operasional"
                                helpContent="Total biaya operasional seperti gaji karyawan, sewa, listrik, telepon, transportasi, pemasaran, dll."
                            />
                        </div>
                    </StaggerItem>

                    {/* Other Income/Expenses */}
                    <StaggerItem>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Pendapatan & Beban Lain-lain</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <CurrencyInput
                                    label="Pendapatan Lain"
                                    id="pendapatanLain"
                                    value={formData.pendapatanLain}
                                    onChange={(value) => updateField('pendapatanLain', value)}
                                    helpTitle="Pendapatan Lain-lain"
                                    helpContent="Pendapatan di luar kegiatan usaha utama, seperti bunga deposito, keuntungan penjualan aset, dll."
                                />
                                <CurrencyInput
                                    label="Beban Lain"
                                    id="bebanLain"
                                    value={formData.bebanLain}
                                    onChange={(value) => updateField('bebanLain', value)}
                                    helpTitle="Beban Lain-lain"
                                    helpContent="Beban di luar kegiatan usaha utama, seperti bunga pinjaman, kerugian selisih kurs, dll."
                                />
                            </div>
                        </div>
                    </StaggerItem>
                </StaggerContainer>

                {/* Net Profit Result */}
                <FadeIn delay={0.3}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`
              rounded-xl p-6 text-center shadow-lg
              ${labaBersih >= 0
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-primary-500/30'
                                : 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/30'
                            }
            `}
                    >
                        <span className="text-sm font-medium text-white/80">Laba Bersih</span>
                        <motion.p
                            key={labaBersih}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className="text-3xl font-bold text-white mt-1"
                        >
                            {formatRupiah(labaBersih)}
                        </motion.p>
                        <p className="text-xs text-white/70 mt-2">
                            Laba Kotor − Biaya Operasional + Pendapatan Lain − Beban Lain
                        </p>
                    </motion.div>
                </FadeIn>

                {/* Calculation Breakdown */}
                <FadeIn delay={0.4}>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-sm">
                        <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Rincian Perhitungan:</h4>
                        <div className="space-y-2 text-slate-600 dark:text-slate-400">
                            <div className="flex justify-between">
                                <span>Pendapatan</span>
                                <span>{formatRupiah(formData.pendapatan)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center gap-1"><Minus className="w-3 h-3" /> HPP</span>
                                <span>{formatRupiah(formData.hpp)}</span>
                            </div>
                            <div className="flex justify-between font-medium border-t border-slate-200 dark:border-slate-700 pt-2">
                                <span>Laba Kotor</span>
                                <span>{formatRupiah(labaKotor)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center gap-1"><Minus className="w-3 h-3" /> Biaya Operasional</span>
                                <span>{formatRupiah(formData.biayaOperasional)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center gap-1"><Plus className="w-3 h-3" /> Pendapatan Lain</span>
                                <span>{formatRupiah(formData.pendapatanLain)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center gap-1"><Minus className="w-3 h-3" /> Beban Lain</span>
                                <span>{formatRupiah(formData.bebanLain)}</span>
                            </div>
                            <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-700 pt-2 text-primary-600 dark:text-primary-400">
                                <span>Laba Bersih</span>
                                <span>{formatRupiah(labaBersih)}</span>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
