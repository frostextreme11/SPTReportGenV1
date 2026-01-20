import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag, Clock, Share2, ChevronRight } from 'lucide-react';

// Simple frontmatter parser (gray-matter doesn't work in browser directly)
function parseFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
        return { data: {}, content };
    }

    const frontmatterStr = match[1];
    const markdownContent = match[2];

    const data = {};
    frontmatterStr.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
            const key = line.slice(0, colonIndex).trim();
            let value = line.slice(colonIndex + 1).trim();
            // Remove quotes
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            // Parse arrays
            if (value.startsWith('[') && value.endsWith(']')) {
                try {
                    value = JSON.parse(value.replace(/'/g, '"'));
                } catch (e) {
                    // Keep as string if parsing fails
                }
            }
            data[key] = value;
        }
    });

    return { data, content: markdownContent };
}

export default function BlogPostPage() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchPost() {
            try {
                const response = await fetch(`/blog/${slug}.md`);
                if (!response.ok) {
                    throw new Error('Post not found');
                }
                const text = await response.text();
                const { data, content } = parseFrontmatter(text);
                setPost({ ...data, content });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-slate-400 mb-6">Artikel tidak ditemukan</p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Beranda
                </Link>
            </div>
        );
    }

    const readingTime = Math.ceil(post.content.split(/\s+/).length / 200);

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Beranda</span>
                    </Link>
                    <button
                        onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
                        className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative pt-12 pb-16 px-4"
            >
                {post.image && (
                    <div className="max-w-4xl mx-auto mb-8">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-64 md:h-80 object-cover rounded-2xl"
                        />
                    </div>
                )}

                <div className="max-w-4xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                        <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-400">Blog</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-emerald-400 truncate">{post.title?.substring(0, 30)}...</span>
                    </nav>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <p className="text-lg text-slate-400 mb-8">
                        {post.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        {post.author && (
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>{post.author}</span>
                            </div>
                        )}
                        {post.date && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(post.date).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{readingTime} menit baca</span>
                        </div>
                    </div>

                    {/* Tags */}
                    {post.tags && Array.isArray(post.tags) && (
                        <div className="flex flex-wrap gap-2 mt-6">
                            {post.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 text-emerald-400 text-sm rounded-full"
                                >
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </motion.section>

            {/* Divider */}
            <div className="max-w-4xl mx-auto px-4">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
            </div>

            {/* Article Content */}
            <motion.article
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-4xl mx-auto px-4 py-12"
            >
                <div className="prose prose-invert prose-lg max-w-none
                    prose-headings:text-white prose-headings:font-bold
                    prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-slate-800
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-emerald-400
                    prose-p:text-slate-300 prose-p:leading-relaxed
                    prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:text-emerald-300 hover:prose-a:underline
                    prose-strong:text-white prose-strong:font-semibold
                    prose-ul:text-slate-300 prose-ol:text-slate-300
                    prose-li:marker:text-emerald-500
                    prose-blockquote:border-l-emerald-500 prose-blockquote:bg-slate-900/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:text-slate-400 prose-blockquote:not-italic
                    prose-code:text-emerald-400 prose-code:bg-slate-800 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                    prose-hr:border-slate-800
                ">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                    </ReactMarkdown>
                </div>
            </motion.article>

            {/* CTA Section */}
            <section className="max-w-4xl mx-auto px-4 pb-16">
                <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-white mb-3">
                        Siap Buat Laporan Keuangan?
                    </h3>
                    <p className="text-slate-400 mb-6">
                        Generate Laporan Laba Rugi & Neraca dalam hitungan detik.
                    </p>
                    <a
                        href="https://buatspt.vercel.app/generator"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                    >
                        Coba Gratis Sekarang
                        <ChevronRight className="w-5 h-5" />
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-8">
                <div className="max-w-4xl mx-auto px-4 text-center text-slate-500">
                    <p>© 2026 BuatSPT. Semua hak dilindungi.</p>
                </div>
            </footer>
        </div>
    );
}
