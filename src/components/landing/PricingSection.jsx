import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Check,
    Star,
    Crown,
    Building2,
    FileText,
    Download,
    Infinity as InfinityIcon,
    Users
} from 'lucide-react';

const pricingPlans = [
    {
        id: 'umkm',
        name: 'UMKM',
        price: '99.000',
        priceNote: 'sekali bayar',
        description: 'Solusi lengkap untuk 1 perusahaan',
        popular: true,
        features: [
            { icon: Building2, text: '1 Laporan Perusahaan' },
            { icon: InfinityIcon, text: 'Revisi Unlimited' },
            { icon: FileText, text: 'PDF Laporan Keuangan' },
            { icon: Download, text: 'CSV Export untuk DJP' },
        ],
        cta: 'Mulai Sekarang',
        ctaLink: '/generator',
    },
    {
        id: 'agency',
        name: 'Agency / Bulk',
        price: '350.000',
        priceNote: 'untuk 5 perusahaan',
        description: 'Hemat 30% untuk banyak klien',
        popular: false,
        savings: 'Lebih Hemat!', // NEW BADGE TRIGGER
        features: [
            { icon: Building2, text: '5 Laporan Perusahaan' },
            { icon: Users, text: 'Rp 70rb per perusahaan' },
            { icon: InfinityIcon, text: 'Revisi Unlimited' },
            { icon: Crown, text: 'White Label Ready' },
        ],
        cta: 'Mulai Sekarang',
        ctaLink: '/generator',
    },
];

function PricingCard({ plan, index }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="relative"
        >
            <motion.div
                whileHover={{ scale: 1.03, y: -8 }}
                transition={{ duration: 0.3 }}
                className={`relative h-full rounded-3xl overflow-hidden ${plan.popular || plan.savings
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900'
                    : 'bg-slate-800/50'
                    }`}
            >
                {/* Visual Effects (Glow & Badges) */}
                {(plan.popular || plan.savings) && (
                    <>
                        {/* Glow Border */}
                        <div className={`absolute inset-0 rounded-3xl opacity-30 blur-sm bg-gradient-to-r ${plan.savings
                            ? 'from-amber-500 via-orange-500 to-amber-500' // Gold/Orange for Savings
                            : 'from-emerald-500 via-cyan-500 to-emerald-500' // Green/Cyan for Popular
                            }`} />
                        <div
                            className={`absolute -inset-0.5 rounded-3xl animate-pulse bg-gradient-to-r ${plan.savings
                                ? 'from-amber-500 via-orange-500 to-amber-500'
                                : 'from-emerald-500 via-cyan-500 to-emerald-500'
                                }`}
                        />

                        {/* Badge */}
                        <div className="absolute -top-px left-1/2 -translate-x-1/2 z-20">
                            <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-b-xl ${plan.savings
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20'
                                : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                                }`}>
                                {plan.savings ? (
                                    <Crown className="w-4 h-4 text-white fill-white" />
                                ) : (
                                    <Star className="w-4 h-4 text-white fill-white" />
                                )}
                                <span className="text-sm font-bold text-white">
                                    {plan.savings || 'Paling Populer'}
                                </span>
                            </div>
                        </div>
                    </>
                )}

                {/* Card Content */}
                <div className={`relative h-full p-8 rounded-3xl ${plan.popular || plan.savings
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-transparent'
                    : 'border border-slate-700/50'
                    }`}>
                    {/* Header */}
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                        <p className="text-slate-400 text-sm">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                        <div className="flex items-baseline gap-1">
                            <span className="text-slate-400 text-lg">Rp</span>
                            <span className={`text-4xl lg:text-5xl font-extrabold ${plan.popular
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400'
                                : plan.savings
                                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400'
                                    : 'text-white'
                                }`}>
                                {plan.price}
                            </span>
                        </div>
                        <span className="text-slate-500 text-sm">{plan.priceNote}</span>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                        {plan.features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <div className={`w-8 h-8 rounded-lg ${plan.popular
                                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                                    : plan.savings
                                        ? 'bg-amber-500/10 border border-amber-500/20'
                                        : 'bg-slate-700/50'
                                    } flex items-center justify-center`}>
                                    <feature.icon className={`w-4 h-4 ${plan.popular ? 'text-emerald-400' : plan.savings ? 'text-amber-400' : 'text-slate-400'
                                        }`} />
                                </div>
                                <span className="text-slate-300">{feature.text}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <Link to={plan.ctaLink}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${plan.popular
                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                                : plan.savings
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40'
                                    : 'bg-slate-700 text-white hover:bg-slate-600'
                                }`}
                        >
                            {plan.cta}
                        </motion.button>
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function PricingSection() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    return (
        <section id="pricing" className="py-24 px-4 relative">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-transparent" />

            <div className="max-w-5xl mx-auto relative">
                {/* Section Header */}
                <motion.div
                    ref={sectionRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
                        Harga Transparan
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                        Investasi yang <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Hemat</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Bandingkan dengan biaya konsultan jutaan rupiah. BuatSPT jauh lebih terjangkau.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {pricingPlans.map((plan, index) => (
                        <PricingCard key={plan.id} plan={plan} index={index} />
                    ))}
                </div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-16 text-center"
                >
                    <div className="inline-flex flex-wrap justify-center items-center gap-6 px-8 py-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Check className="w-5 h-5 text-emerald-400" />
                            <span>Garansi 7 Hari</span>
                        </div>
                        <div className="hidden sm:block w-px h-6 bg-slate-700" />
                        <div className="flex items-center gap-2 text-slate-400">
                            <Check className="w-5 h-5 text-emerald-400" />
                            <span>Pembayaran Aman</span>
                        </div>
                        <div className="hidden sm:block w-px h-6 bg-slate-700" />
                        <div className="flex items-center gap-2 text-slate-400">
                            <Check className="w-5 h-5 text-emerald-400" />
                            <span>Support 24/7</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
