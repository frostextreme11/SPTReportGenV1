import { motion } from 'framer-motion';
import { ArrowRight, Play, FileSpreadsheet, FileCheck, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
    const floatingVariants = {
        animate: {
            y: [0, -10, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        }
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-4 overflow-hidden">
            {/* Hero Content */}
            <div className="max-w-7xl mx-auto w-full">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="text-center lg:text-left"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
                        >
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-emerald-300 font-medium">
                                Dipercaya 5000+ UMKM Indonesia
                            </span>
                        </motion.div>

                        {/* Main Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                            <span className="text-white">Kelarin SPT Badan</span>
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400">
                                1771 Cuma 10 Menit
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0">
                            <span className="text-white font-semibold">Hemat biaya konsultan.</span> Input data simpel, langsung jadi
                            <span className="text-emerald-400 font-medium"> PDF Laporan Keuangan</span> &
                            <span className="text-cyan-400 font-medium"> CSV siap upload</span> ke DJP Online.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <Link
                                    to="/generator"
                                    className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg text-white overflow-hidden shadow-2xl shadow-emerald-500/25"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_60%)]" />
                                    <span className="relative">Buat Laporan - Rp 99rb</span>
                                    <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>

                            <motion.button
                                onClick={() => scrollToSection('demo')}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white transition-all duration-300"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                                    <Play className="w-4 h-4 ml-0.5" />
                                </div>
                                <span>Lihat Demo</span>
                            </motion.button>
                        </div>

                        {/* Trust Indicators */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-10 text-sm text-slate-500"
                        >
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-emerald-500" />
                                <span>Data Terenkripsi</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileCheck className="w-4 h-4 text-emerald-500" />
                                <span>Format DJP Resmi</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative hidden lg:block"
                    >
                        {/* Main Visual Container */}
                        <div className="relative">
                            {/* Glowing Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-3xl scale-110" />

                            {/* Visual Cards Stack */}
                            <div className="relative">
                                {/* Messy Excel Card (Background) */}
                                <motion.div
                                    initial={{ rotate: -5, x: -20 }}
                                    animate={{ rotate: -8, x: -30 }}
                                    whileHover={{ rotate: -5, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute -left-8 top-10 w-72 h-48 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-4 shadow-xl"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileSpreadsheet className="w-5 h-5 text-red-400" />
                                        <span className="text-sm text-slate-400">Data_Keuangan.xlsx</span>
                                    </div>
                                    <div className="space-y-2">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="flex gap-2">
                                                {[1, 2, 3].map((j) => (
                                                    <div
                                                        key={j}
                                                        className={`h-4 rounded ${Math.random() > 0.5
                                                            ? 'bg-red-500/30 w-16'
                                                            : 'bg-slate-600/50 w-20'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                        !
                                    </div>
                                </motion.div>

                                {/* Arrow Animation */}
                                <motion.div
                                    variants={floatingVariants}
                                    animate="animate"
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
                                        <ArrowRight className="w-8 h-8 text-white" />
                                    </div>
                                </motion.div>

                                {/* Clean PDF Card (Foreground) */}
                                <motion.div
                                    initial={{ rotate: 5, x: 20 }}
                                    animate={{ rotate: 5, x: 30 }}
                                    whileHover={{ rotate: 3, x: 20, scale: 1.02 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative ml-auto w-80 h-56 bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm rounded-2xl border border-emerald-500/30 p-5 shadow-2xl shadow-emerald-500/10"
                                >
                                    {/* Success Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl" />

                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                                <FileCheck className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-white">Laporan_Keuangan.pdf</span>
                                                <span className="block text-xs text-emerald-400">✓ Siap Upload</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Neraca</span>
                                                <span className="text-emerald-400">✓</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Laba Rugi</span>
                                                <span className="text-emerald-400">✓</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Peredaran Usaha</span>
                                                <span className="text-emerald-400">✓</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex gap-2">
                                            <div className="flex-1 h-8 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center justify-center">
                                                <span className="text-xs text-emerald-400">PDF</span>
                                            </div>
                                            <div className="flex-1 h-8 bg-cyan-500/10 rounded-lg border border-cyan-500/20 flex items-center justify-center">
                                                <span className="text-xs text-cyan-400">CSV</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Success Badge */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 1, type: 'spring' }}
                                        className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/50 rotate-12"
                                    >
                                        <Shield className="w-5 h-5 text-white" />
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-6 h-10 rounded-full border-2 border-slate-600 flex justify-center pt-2"
                >
                    <div className="w-1.5 h-3 bg-slate-500 rounded-full" />
                </motion.div>
            </motion.div>
        </section>
    );
}
