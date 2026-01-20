import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Tag, ChevronRight, BookOpen } from 'lucide-react';

// Blog post metadata - in a real app, this would come from an API or CMS
const BLOG_POSTS = [
    {
        slug: 'panduan-isi-spt-tahunan-badan-1771-umkm',
        title: 'Panduan Lengkap Isi SPT Tahunan Badan Form 1771 Khusus UMKM (Update 2026)',
        description: 'Bingung isi formulir 1771? Simak panduan langkah demi langkah isi SPT Tahunan Badan khusus UMKM lengkap dengan cara mudah buat laporan keuangannya.',
        date: '2026-01-20',
        author: 'Tim BuatSPT',
        tags: ['Pajak Badan', 'SPT Tahunan', 'Form 1771', 'UMKM'],
        image: '/images/blog/cover-panduan-spt-1771.jpeg',
        readTime: 8,
    },
    {
        slug: 'dokumen-persiapan-lapor-spt-badan-1771',
        title: 'Dokumen Apa Saja yang Wajib Disiapkan Sebelum Isi Form 1771? (Ceklist Lengkap)',
        description: 'Mau lapor SPT Tahunan Badan tapi bingung dokumennya? Simak ceklist lengkap dokumen wajib untuk Form 1771 agar proses lapor pajak lancar.',
        date: '2026-01-20',
        author: 'Tim BuatSPT',
        tags: ['Syarat Lapor SPT', 'Form 1771', 'Dokumen Pajak', 'UMKM'],
        image: '/images/blog/cover-dokumen-spt-1771.jpeg',
        readTime: 6,
    },
    {
        slug: 'cara-buat-laporan-keuangan-fiskal-tanpa-akuntansi',
        title: 'Cara Membuat Laporan Keuangan Fiskal dari Nol Tanpa Background Akuntansi',
        description: 'Tidak paham akuntansi tapi harus buat laporan pajak? Pelajari cara mudah membuat Laporan Keuangan Fiskal dari nol untuk UMKM tanpa pusing rumus.',
        date: '2026-01-20',
        author: 'Tim BuatSPT',
        tags: ['Tips Pajak', 'Laporan Keuangan', 'Akuntansi Dasar', 'UMKM'],
        image: '/images/blog/cover-laporan-fiskal-tanpa-akuntansi.jpeg',
        readTime: 7,
    },
    {
        slug: 'kesalahan-fatal-lapor-spt-badan-umkm-kena-denda',
        title: '5 Kesalahan Fatal Saat Lapor SPT Badan yang Sering Bikin UMKM Kena Denda',
        description: 'Takut kena denda pajak? Kenali 5 kesalahan fatal saat lapor SPT Tahunan Badan yang sering dilakukan UMKM dan cara menghindarinya.',
        date: '2026-01-20',
        author: 'Tim BuatSPT',
        tags: ['Tips Pajak', 'Kesalahan SPT', 'Denda Pajak', 'UMKM'],
        image: '/images/blog/cover-kesalahan-spt-badan.jpeg',
        readTime: 8,
    },
];

function BlogCard({ post, index }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
        >
            <Link
                to={`/blog/${post.slug}`}
                className="block bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10"
            >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-slate-800">
                    {post.image ? (
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-cyan-500/20" style={{ display: post.image ? 'none' : 'flex' }}>
                        <BookOpen className="w-12 h-12 text-emerald-400/50" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 2).map((tag, i) => (
                            <span
                                key={i}
                                className="px-2 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                        {post.title}
                    </h2>

                    {/* Description */}
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                        {post.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(post.date).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {post.readTime} menit
                            </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                    </div>
                </div>
            </Link>
        </motion.article>
    );
}

export default function BlogListPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Beranda</span>
                    </Link>
                    <Link
                        to="/generator"
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors text-sm"
                    >
                        Buat Laporan
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-16 pb-12 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6"
                    >
                        <BookOpen className="w-4 h-4" />
                        Blog & Panduan
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
                    >
                        Panduan Pajak untuk{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            UMKM Indonesia
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-400 max-w-2xl mx-auto"
                    >
                        Tips, tutorial, dan panduan lengkap seputar lapor pajak badan,
                        Form 1771, dan cara membuat laporan keuangan yang mudah dipahami.
                    </motion.p>
                </div>
            </section>

            {/* Divider */}
            <div className="max-w-6xl mx-auto px-4">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
            </div>

            {/* Blog Grid */}
            <section className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {BLOG_POSTS.map((post, index) => (
                        <BlogCard key={post.slug} post={post} index={index} />
                    ))}
                </div>

                {/* Empty State */}
                {BLOG_POSTS.length === 0 && (
                    <div className="text-center py-16">
                        <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-400 mb-2">
                            Belum ada artikel
                        </h3>
                        <p className="text-slate-500">
                            Artikel baru akan segera hadir. Kembali lagi nanti!
                        </p>
                    </div>
                )}
            </section>

            {/* CTA Section */}
            <section className="max-w-6xl mx-auto px-4 pb-16">
                <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-white mb-3">
                        Butuh Laporan Keuangan untuk SPT?
                    </h3>
                    <p className="text-slate-400 mb-6 max-w-xl mx-auto">
                        Buat Laporan Laba Rugi & Neraca dalam hitungan detik.
                        Tanpa rumus Excel, tanpa pusing akuntansi.
                    </p>
                    <Link
                        to="/generator"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                    >
                        Coba Gratis Sekarang
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-8">
                <div className="max-w-6xl mx-auto px-4 text-center text-slate-500">
                    <p>© 2026 BuatSPT. Semua hak dilindungi.</p>
                </div>
            </footer>
        </div>
    );
}
