import { Scale, Wallet, Building, PiggyBank, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import CurrencyInput from '../ui/CurrencyInput';
import { useFormData } from '../../context/FormContext';
import { formatRupiah } from '../../utils/currency';
import { FadeIn, StaggerContainer, StaggerItem } from '../ui/AnimatedStep';

export default function Step4Balance() {
    const {
        formData,
        updateField,
        getLabaBersih,
        getTotalAktivaLancar,
        getTotalAktivaTetap,
        getTotalAktiva,
        getTotalKewajiban,
        getTotalModal,
        isBalanced,
    } = useFormData();

    const labaBersih = getLabaBersih();
    const totalAktivaLancar = getTotalAktivaLancar();
    const totalAktivaTetap = getTotalAktivaTetap();
    const totalAktiva = getTotalAktiva();
    const totalKewajiban = getTotalKewajiban();
    const totalModal = getTotalModal();
    const balanced = isBalanced();
    const difference = totalAktiva - (totalKewajiban + totalModal);

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
                        <Scale className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Neraca
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Posisi keuangan per 31 Desember {formData.tahunPajak}
                    </p>
                </div>
            </FadeIn>

            {/* Balance Status */}
            <FadeIn delay={0.1}>
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
            rounded-xl p-4 flex items-center gap-3
            ${balanced
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                        }
          `}
                >
                    {balanced ? (
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    ) : (
                        <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    )}
                    <div>
                        <p className={`font-medium ${balanced ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                            {balanced ? 'Neraca Seimbang ✓' : 'Neraca Tidak Seimbang'}
                        </p>
                        {!balanced && (
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                Selisih: {formatRupiah(Math.abs(difference))}
                                ({difference > 0 ? 'Aktiva lebih besar' : 'Pasiva lebih besar'})
                            </p>
                        )}
                    </div>
                </motion.div>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Assets */}
                <StaggerContainer className="space-y-4">
                    {/* Current Assets */}
                    <StaggerItem>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Wallet className="w-5 h-5 text-blue-500" />
                                <h3 className="font-semibold text-slate-800 dark:text-white">Aktiva Lancar</h3>
                            </div>
                            <div className="space-y-4">
                                <CurrencyInput
                                    label="Kas & Setara Kas"
                                    id="kas"
                                    value={formData.kas}
                                    onChange={(value) => updateField('kas', value)}
                                    helpTitle="Kas & Setara Kas"
                                    helpContent="Uang tunai dan saldo rekening bank yang dapat segera digunakan."
                                />
                                <CurrencyInput
                                    label="Piutang Usaha"
                                    id="piutang"
                                    value={formData.piutang}
                                    onChange={(value) => updateField('piutang', value)}
                                    helpTitle="Piutang Usaha"
                                    helpContent="Tagihan kepada pelanggan yang belum dibayar."
                                />
                                <CurrencyInput
                                    label="Persediaan"
                                    id="persediaan"
                                    value={formData.persediaan}
                                    onChange={(value) => updateField('persediaan', value)}
                                    helpTitle="Persediaan"
                                    helpContent="Nilai barang dagangan atau bahan baku yang dimiliki."
                                />
                                <CurrencyInput
                                    label="Biaya Dibayar Dimuka"
                                    id="biayaDibayarDimuka"
                                    value={formData.biayaDibayarDimuka}
                                    onChange={(value) => updateField('biayaDibayarDimuka', value)}
                                    helpTitle="Biaya Dibayar Dimuka"
                                    helpContent="Pembayaran di muka untuk asuransi, sewa, dll yang belum jatuh tempo."
                                />
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                                <span className="font-medium text-slate-600 dark:text-slate-400">Subtotal Aktiva Lancar</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">{formatRupiah(totalAktivaLancar)}</span>
                            </div>
                        </div>
                    </StaggerItem>

                    {/* Fixed Assets */}
                    <StaggerItem>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Building className="w-5 h-5 text-purple-500" />
                                <h3 className="font-semibold text-slate-800 dark:text-white">Aktiva Tetap</h3>
                            </div>
                            <div className="space-y-4">
                                <CurrencyInput
                                    label="Kendaraan"
                                    id="kendaraan"
                                    value={formData.kendaraan}
                                    onChange={(value) => updateField('kendaraan', value)}
                                    helpTitle="Kendaraan"
                                    helpContent="Nilai perolehan kendaraan milik perusahaan."
                                />
                                <CurrencyInput
                                    label="Peralatan"
                                    id="peralatan"
                                    value={formData.peralatan}
                                    onChange={(value) => updateField('peralatan', value)}
                                    helpTitle="Peralatan"
                                    helpContent="Nilai perolehan peralatan dan mesin."
                                />
                                <CurrencyInput
                                    label="Inventaris"
                                    id="inventaris"
                                    value={formData.inventaris}
                                    onChange={(value) => updateField('inventaris', value)}
                                    helpTitle="Inventaris"
                                    helpContent="Nilai perolehan perlengkapan kantor dan inventaris lainnya."
                                />
                                <CurrencyInput
                                    label="Akumulasi Penyusutan"
                                    id="akumulasiPenyusutan"
                                    value={Math.abs(formData.akumulasiPenyusutan)}
                                    onChange={(value) => updateField('akumulasiPenyusutan', -Math.abs(value))}
                                    negative
                                    helpTitle="Akumulasi Penyusutan"
                                    helpContent="Total penyusutan yang telah dibebankan atas aktiva tetap. Nilai ini mengurangi total aktiva tetap."
                                />
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                                <span className="font-medium text-slate-600 dark:text-slate-400">Subtotal Aktiva Tetap</span>
                                <span className="font-bold text-purple-600 dark:text-purple-400">{formatRupiah(totalAktivaTetap)}</span>
                            </div>
                        </div>
                    </StaggerItem>

                    {/* Total Assets */}
                    <StaggerItem>
                        <motion.div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-5 text-white shadow-lg"
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-medium">TOTAL AKTIVA</span>
                                <motion.span
                                    key={totalAktiva}
                                    initial={{ scale: 1.1 }}
                                    animate={{ scale: 1 }}
                                    className="text-2xl font-bold"
                                >
                                    {formatRupiah(totalAktiva)}
                                </motion.span>
                            </div>
                        </motion.div>
                    </StaggerItem>
                </StaggerContainer>

                {/* Right Column - Liabilities & Equity */}
                <StaggerContainer className="space-y-4">
                    {/* Liabilities */}
                    <StaggerItem>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Scale className="w-5 h-5 text-red-500" />
                                <h3 className="font-semibold text-slate-800 dark:text-white">Kewajiban</h3>
                            </div>
                            <div className="space-y-4">
                                <CurrencyInput
                                    label="Utang Usaha"
                                    id="utangUsaha"
                                    value={formData.utangUsaha}
                                    onChange={(value) => updateField('utangUsaha', value)}
                                    helpTitle="Utang Usaha"
                                    helpContent="Utang kepada pemasok/vendor yang belum dibayar."
                                />
                                <CurrencyInput
                                    label="Utang Lain-lain"
                                    id="utangLain"
                                    value={formData.utangLain}
                                    onChange={(value) => updateField('utangLain', value)}
                                    helpTitle="Utang Lain-lain"
                                    helpContent="Utang lainnya seperti pinjaman bank, utang pajak, dll."
                                />
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                                <span className="font-medium text-slate-600 dark:text-slate-400">Total Kewajiban</span>
                                <span className="font-bold text-red-600 dark:text-red-400">{formatRupiah(totalKewajiban)}</span>
                            </div>
                        </div>
                    </StaggerItem>

                    {/* Equity */}
                    <StaggerItem>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <PiggyBank className="w-5 h-5 text-primary-500" />
                                <h3 className="font-semibold text-slate-800 dark:text-white">Modal</h3>
                            </div>
                            <div className="space-y-4">
                                <CurrencyInput
                                    label="Modal Saham"
                                    id="modalSaham"
                                    value={formData.modalSaham}
                                    onChange={(value) => updateField('modalSaham', value)}
                                    helpTitle="Modal Saham"
                                    helpContent="Modal yang disetor oleh pemilik/pemegang saham."
                                />
                                <CurrencyInput
                                    label="Laba Ditahan"
                                    id="labaDitahan"
                                    value={formData.labaDitahan}
                                    onChange={(value) => updateField('labaDitahan', value)}
                                    helpTitle="Laba Ditahan"
                                    helpContent="Akumulasi laba dari tahun-tahun sebelumnya yang tidak dibagikan."
                                />

                                {/* Auto-calculated from P&L */}
                                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Laba Tahun Berjalan
                                        </span>
                                        <motion.span
                                            key={labaBersih}
                                            initial={{ scale: 1.1 }}
                                            animate={{ scale: 1 }}
                                            className={`font-bold ${labaBersih >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                        >
                                            {formatRupiah(labaBersih)}
                                        </motion.span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        *Otomatis dari Laporan Laba Rugi
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                                <span className="font-medium text-slate-600 dark:text-slate-400">Total Modal</span>
                                <span className="font-bold text-primary-600 dark:text-primary-400">{formatRupiah(totalModal)}</span>
                            </div>
                        </div>
                    </StaggerItem>

                    {/* Total Liabilities + Equity */}
                    <StaggerItem>
                        <motion.div
                            className="bg-gradient-to-r from-red-500 to-primary-500 rounded-xl p-5 text-white shadow-lg"
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-medium">TOTAL KEWAJIBAN + MODAL</span>
                                <motion.span
                                    key={totalKewajiban + totalModal}
                                    initial={{ scale: 1.1 }}
                                    animate={{ scale: 1 }}
                                    className="text-2xl font-bold"
                                >
                                    {formatRupiah(totalKewajiban + totalModal)}
                                </motion.span>
                            </div>
                        </motion.div>
                    </StaggerItem>
                </StaggerContainer>
            </div>
        </div>
    );
}
