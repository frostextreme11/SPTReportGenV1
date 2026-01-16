import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
    DollarSign,
    AlertTriangle,
    Calculator,
    ArrowDown,
    Zap,
    FileOutput,
    CheckCircle2,
    Timer,
    Target,
    ShieldCheck
} from 'lucide-react';

const painPoints = [
    {
        icon: DollarSign,
        title: 'Konsultan Mahal',
        description: 'Biaya jasa akuntan bisa jutaan per tahun. UMKM terbebani biaya yang seharusnya bisa dihemat.',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20'
    },
    {
        icon: AlertTriangle,
        title: 'Rawan Salah Input',
        description: 'Input manual berisiko typo dan kesalahan hitung. Satu error bisa bikin revisi berulang-ulang.',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20'
    },
    {
        icon: Calculator,
        title: 'Rumus Ribet',
        description: 'Format SPT 1771 rumit dengan puluhan kolom. Banyak yang akhirnya pasrah bayar mahal.',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20'
    },
];

const solutions = [
    {
        icon: Zap,
        title: 'Super Cepat',
        description: 'Selesai dalam 10 menit',
    },
    {
        icon: FileOutput,
        title: 'Auto CSV Export',
        description: 'Langsung support e-Form DJP',
    },
    {
        icon: ShieldCheck,
        title: 'Akurat 100%',
        description: 'Kalkulasi otomatis & tervalidasi',
    },
];

function AnimatedCard({ children, delay = 0 }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay }}
        >
            {children}
        </motion.div>
    );
}

export default function ProblemSolution() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    return (
        <section id="demo" className="py-24 px-4 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    ref={sectionRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
                        Kenapa Pilih SPT Instan?
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                        Kami Paham <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Masalah</span> Anda
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Ribuan UMKM Indonesia menghadapi masalah yang sama setiap musim lapor pajak.
                    </p>
                </motion.div>

                {/* Pain Points */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {painPoints.map((pain, index) => (
                        <AnimatedCard key={pain.title} delay={index * 0.1}>
                            <div className={`h-full p-6 rounded-2xl ${pain.bgColor} border ${pain.borderColor} backdrop-blur-sm`}>
                                <div className={`w-12 h-12 rounded-xl ${pain.bgColor} border ${pain.borderColor} flex items-center justify-center mb-4`}>
                                    <pain.icon className={`w-6 h-6 ${pain.color}`} />
                                </div>
                                <h3 className={`text-xl font-bold ${pain.color} mb-2`}>{pain.title}</h3>
                                <p className="text-slate-400">{pain.description}</p>
                            </div>
                        </AnimatedCard>
                    ))}
                </div>

                {/* Arrow Transition */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-16"
                >
                    <div className="relative">
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                        >
                            <ArrowDown className="w-8 h-8 text-white" />
                        </motion.div>
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl -z-10" />
                    </div>
                </motion.div>

                {/* Solution Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Solusi Kami</span> Simpel & Akurat
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        SPT Instan mengubah proses yang rumit jadi semudah isi formulir online.
                    </p>
                </motion.div>

                {/* Solution Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {solutions.map((solution, index) => (
                        <AnimatedCard key={solution.title} delay={index * 0.1}>
                            <motion.div
                                whileHover={{ scale: 1.03, y: -5 }}
                                transition={{ duration: 0.3 }}
                                className="h-full p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-emerald-500/20 backdrop-blur-sm relative overflow-hidden group"
                            >
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                                        <solution.icon className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{solution.title}</h3>
                                    <p className="text-slate-400">{solution.description}</p>
                                </div>
                            </motion.div>
                        </AnimatedCard>
                    ))}
                </div>

                {/* Key Feature Highlight */}
                <AnimatedCard delay={0.3}>
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="relative p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 backdrop-blur-sm overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

                        <div className="relative flex flex-col lg:flex-row items-center gap-8">
                            <div className="flex-shrink-0">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                    <FileOutput className="w-10 h-10 text-white" />
                                </div>
                            </div>
                            <div className="text-center lg:text-left">
                                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                                    Auto-Generate CSV untuk e-Form DJP
                                </h3>
                                <p className="text-lg text-slate-400 mb-4">
                                    Fitur unggulan kami! CSV hasil generate langsung kompatibel dengan sistem e-Form DJP Online.
                                    Tidak perlu input manual lagi — tinggal upload & submit.
                                </p>
                                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Format Resmi DJP</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Validasi Otomatis</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Zero Error Upload</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatedCard>
            </div>
        </section>
    );
}
