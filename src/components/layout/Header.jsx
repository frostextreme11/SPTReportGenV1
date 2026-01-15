import { Moon, Sun, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function Header() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700"
        >
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo & Title */}
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/25"
                    >
                        <FileText className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                            SiapLapor 1771
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                            Generator Laporan Keuangan SPT
                        </p>
                    </div>
                </div>

                {/* Dark Mode Toggle */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
                >
                    <motion.div
                        initial={false}
                        animate={{ rotate: isDark ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isDark ? (
                            <Sun className="w-5 h-5 text-amber-400" />
                        ) : (
                            <Moon className="w-5 h-5 text-slate-600" />
                        )}
                    </motion.div>
                </motion.button>
            </div>
        </motion.header>
    );
}
