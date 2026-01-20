import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
    {
        question: 'Apakah laporan yang dihasilkan sesuai standar DJP?',
        answer: 'Ya, 100% sesuai! Laporan keuangan yang dihasilkan mengikuti format standar SPT 1771 dari Direktorat Jenderal Pajak. File CSV yang diekspor langsung kompatibel dengan sistem e-Form DJP Online.'
    },
    {
        question: 'Berapa lama proses pembuatan laporan?',
        answer: 'Rata-rata hanya 10-15 menit! Anda cukup input data identitas perusahaan, pendapatan, dan beban usaha. Sistem kami akan otomatis mengkalkulasi dan generate laporan lengkap.'
    },
    {
        question: 'Apakah data saya aman?',
        answer: 'Keamanan data adalah prioritas kami. Semua data dienkripsi dengan standar industri. Kami tidak menyimpan data keuangan sensitif Anda setelah proses selesai.'
    },
    {
        question: 'Bisa revisi jika ada kesalahan input?',
        answer: 'Tentu! Semua paket termasuk revisi unlimited. Anda bisa mengubah data dan regenerate laporan sebanyak yang diperlukan tanpa biaya tambahan.'
    },
    {
        question: 'Apa bedanya dengan jasa konsultan pajak?',
        answer: 'BuatSPT cocok untuk UMKM dengan struktur keuangan sederhana. Jika perusahaan Anda memiliki transaksi kompleks seperti investasi, saham, atau transaksi internasional, kami sarankan konsultasi dengan akuntan profesional.'
    },
    {
        question: 'Bagaimana cara upload ke DJP Online?',
        answer: 'Setelah download file CSV, login ke djponline.pajak.go.id, pilih menu e-Form SPT 1771, lalu gunakan fitur import data. Panduan lengkap akan kami sertakan dalam email konfirmasi.'
    },
];

function FAQItem({ faq, index, isOpen, onToggle }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="border-b border-slate-700/50 last:border-b-0"
        >
            <button
                onClick={onToggle}
                className="w-full py-6 flex items-center justify-between gap-4 text-left group"
            >
                <span className={`text-lg font-medium transition-colors duration-300 ${isOpen ? 'text-emerald-400' : 'text-white group-hover:text-emerald-400'
                    }`}>
                    {faq.question}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-400'
                        }`}
                >
                    <ChevronDown className="w-5 h-5" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-slate-400 leading-relaxed">
                            {faq.answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState(0);
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    return (
        <section id="faq" className="py-24 px-4 relative">
            <div className="max-w-3xl mx-auto">
                {/* Section Header */}
                <motion.div
                    ref={sectionRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
                        <HelpCircle className="w-4 h-4" />
                        <span>FAQ</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Pertanyaan yang Sering Diajukan
                    </h2>
                    <p className="text-slate-400">
                        Temukan jawaban untuk pertanyaan umum tentang SPT Instan
                    </p>
                </motion.div>

                {/* FAQ List */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 px-6 md:px-8"
                >
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            faq={faq}
                            index={index}
                            isOpen={openIndex === index}
                            onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                        />
                    ))}
                </motion.div>

                {/* Contact CTA */}
                {/* <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-center mt-12"
                >
                    <p className="text-slate-400 mb-4">
                        Masih punya pertanyaan lain?
                    </p>
                    <motion.a
                        href="https://wa.me/6281234567890"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Chat via WhatsApp
                    </motion.a>
                </motion.div> */}
            </div>
        </section>
    );
}
