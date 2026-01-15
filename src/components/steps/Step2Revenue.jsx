import { TrendingUp, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import CurrencyInput from '../ui/CurrencyInput';
import { useFormData } from '../../context/FormContext';
import { formatRupiah } from '../../utils/currency';
import { FadeIn, StaggerContainer, StaggerItem } from '../ui/AnimatedStep';

export default function Step2Revenue() {
    const { formData, updatePeredaran, getTotalPeredaran, getTotalPphFinal } = useFormData();

    const totalPeredaran = getTotalPeredaran();
    const totalPphFinal = getTotalPphFinal();

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
                        <TrendingUp className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Daftar Peredaran Usaha
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Masukkan pendapatan per bulan selama satu tahun
                    </p>
                </div>
            </FadeIn>

            {/* Info Card */}
            <FadeIn delay={0.1}>
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <Calculator className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-primary-800 dark:text-primary-300">
                                PPh Final Otomatis
                            </p>
                            <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
                                PPh Final dihitung otomatis 0.5% dari peredaran usaha. Anda dapat mengubahnya secara manual jika diperlukan.
                            </p>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* Revenue Table - Desktop */}
            <FadeIn delay={0.2}>
                <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Bulan
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Peredaran Usaha
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    PPh Final (0.5%)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {formData.peredaran.map((item, index) => (
                                <motion.tr
                                    key={item.bulan}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-white">
                                        {item.bulan}
                                    </td>
                                    <td className="px-4 py-2">
                                        <CurrencyInput
                                            value={item.pendapatan}
                                            onChange={(value) => updatePeredaran(index, 'pendapatan', value)}
                                            className="mb-0"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <CurrencyInput
                                            value={item.pphFinal}
                                            onChange={(value) => updatePeredaran(index, 'pphFinal', value)}
                                            className="mb-0"
                                        />
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-900/20">
                                <td className="px-4 py-4 text-sm font-bold text-slate-800 dark:text-white">
                                    Total
                                </td>
                                <td className="px-4 py-4 text-right text-base font-bold text-primary-600 dark:text-primary-400">
                                    {formatRupiah(totalPeredaran)}
                                </td>
                                <td className="px-4 py-4 text-right text-base font-bold text-primary-600 dark:text-primary-400">
                                    {formatRupiah(totalPphFinal)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </FadeIn>

            {/* Revenue Cards - Mobile */}
            <StaggerContainer className="sm:hidden space-y-3">
                {formData.peredaran.map((item, index) => (
                    <StaggerItem key={item.bulan}>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-slate-800 dark:text-white">
                                    {item.bulan}
                                </span>
                                <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">
                                    #{index + 1}
                                </span>
                            </div>
                            <div className="space-y-3">
                                <CurrencyInput
                                    label="Peredaran Usaha"
                                    value={item.pendapatan}
                                    onChange={(value) => updatePeredaran(index, 'pendapatan', value)}
                                />
                                <CurrencyInput
                                    label="PPh Final (0.5%)"
                                    value={item.pphFinal}
                                    onChange={(value) => updatePeredaran(index, 'pphFinal', value)}
                                />
                            </div>
                        </div>
                    </StaggerItem>
                ))}

                {/* Total Card - Mobile */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 text-white"
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium opacity-90">Total Peredaran</span>
                        <span className="text-xl font-bold">{formatRupiah(totalPeredaran)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium opacity-90">Total PPh Final</span>
                        <span className="text-xl font-bold">{formatRupiah(totalPphFinal)}</span>
                    </div>
                </motion.div>
            </StaggerContainer>
        </div>
    );
}
