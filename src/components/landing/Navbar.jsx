import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                        ? 'bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-lg shadow-slate-950/50'
                        : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <motion.div
                            className="flex items-center gap-2"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div className="absolute -inset-1 bg-emerald-500/20 rounded-xl blur-sm -z-10" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">
                                <span className="text-white">SPT</span>
                                <span className="text-emerald-400">Instan</span>
                            </span>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <button
                                onClick={() => scrollToSection('pricing')}
                                className="text-slate-300 hover:text-white transition-colors font-medium"
                            >
                                Harga
                            </button>
                            <Link
                                to="/generator"
                                className="text-slate-300 hover:text-white transition-colors font-medium"
                            >
                                Login
                            </Link>
                            <motion.button
                                onClick={() => scrollToSection('pricing')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative px-6 py-2.5 rounded-full font-semibold text-white overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300" />
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative">Mulai Sekarang</span>
                            </motion.button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-slate-300 hover:text-white"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-x-0 top-16 z-40 md:hidden"
                    >
                        <div className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-4 py-6 space-y-4">
                            <button
                                onClick={() => scrollToSection('pricing')}
                                className="block w-full text-left text-slate-300 hover:text-white transition-colors font-medium py-2"
                            >
                                Harga
                            </button>
                            <Link
                                to="/generator"
                                className="block text-slate-300 hover:text-white transition-colors font-medium py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <motion.button
                                onClick={() => scrollToSection('pricing')}
                                whileTap={{ scale: 0.95 }}
                                className="w-full px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600"
                            >
                                Mulai Sekarang
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
