import { motion } from 'framer-motion';
import { FileText, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-12 px-4 border-t border-slate-800">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Logo & Brand */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-lg">
                                <span className="text-white">SPT</span>
                                <span className="text-emerald-400">Instan</span>
                            </span>
                            <p className="text-xs text-slate-500">Generator Laporan SPT 1771</p>
                        </div>
                    </motion.div>

                    {/* Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-wrap items-center justify-center gap-6 text-sm"
                    >
                        <Link to="/generator" className="text-slate-400 hover:text-white transition-colors">
                            Generator
                        </Link>
                        <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">
                            Harga
                        </a>
                        <a href="#faq" className="text-slate-400 hover:text-white transition-colors">
                            FAQ
                        </a>
                        <a
                            href="mailto:support@sptinstan.com"
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            Kontak
                        </a>
                    </motion.div>

                    {/* Copyright */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-slate-500"
                    >
                        <p className="flex items-center gap-1">
                            © {currentYear} SPT Instan. Made with
                            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                            in Indonesia
                        </p>
                    </motion.div>
                </div>

                {/* Bottom Disclaimer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 pt-8 border-t border-slate-800/50 text-center"
                >
                    <p className="text-xs text-slate-600 max-w-2xl mx-auto">
                        SPT Instan adalah alat bantu untuk menghasilkan laporan keuangan SPT 1771.
                        Layanan ini tidak menggantikan konsultasi dengan konsultan pajak profesional.
                        Pengguna bertanggung jawab atas keakuratan data yang diinput.
                    </p>
                </motion.div>
            </div>
        </footer>
    );
}
