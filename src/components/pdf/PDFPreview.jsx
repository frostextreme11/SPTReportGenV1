import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, RotateCcw, Eye, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useFormData } from '../../context/FormContext';
import Button from '../ui/Button';
import NeracaPage from './NeracaPage';
import LabaRugiPage from './LabaRugiPage';
import PeredaranPage from './PeredaranPage';

export default function PDFPreview({ isOpen, onClose }) {
    const [currentPage, setCurrentPage] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const pdfContainerRef = useRef(null);

    const {
        formData,
        resetForm,
        getTotalPeredaran,
        getTotalPphFinal,
        getLabaKotor,
        getLabaBersih,
        getTotalAktivaLancar,
        getTotalAktivaTetap,
        getTotalAktiva,
        getTotalKewajiban,
        getTotalModal,
    } = useFormData();

    const calculations = {
        totalPeredaran: getTotalPeredaran(),
        totalPphFinal: getTotalPphFinal(),
        labaKotor: getLabaKotor(),
        labaBersih: getLabaBersih(),
        totalAktivaLancar: getTotalAktivaLancar(),
        totalAktivaTetap: getTotalAktivaTetap(),
        totalAktiva: getTotalAktiva(),
        totalKewajiban: getTotalKewajiban(),
        totalModal: getTotalModal(),
    };

    const pages = [
        { id: 'neraca', title: 'Neraca', component: <NeracaPage formData={formData} calculations={calculations} /> },
        { id: 'labarugi', title: 'Laba Rugi', component: <LabaRugiPage formData={formData} calculations={calculations} /> },
        { id: 'peredaran', title: 'Peredaran Usaha', component: <PeredaranPage formData={formData} calculations={calculations} /> },
    ];

    const handleDownloadPDF = async () => {
        setIsGenerating(true);

        try {
            // Dynamically import html2pdf.js
            const html2pdf = (await import('html2pdf.js')).default;

            // Create a container with all pages
            const container = document.createElement('div');
            container.innerHTML = pdfContainerRef.current.innerHTML;

            const options = {
                margin: [10, 10, 10, 10],
                filename: `Laporan_Keuangan_${formData.namaPerusahaan?.replace(/\s+/g, '_') || 'Perusahaan'}_${formData.tahunPajak}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                },
                pagebreak: {
                    mode: ['css', 'legacy'],
                    before: '.pdf-page',
                },
            };

            await html2pdf().set(options).from(pdfContainerRef.current).save();
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Terjadi kesalahan saat membuat PDF. Silakan coba lagi.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReset = () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
            resetForm();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                <Eye className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg text-slate-800 dark:text-white">Pratinjau Laporan</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {pages[currentPage].title} - Halaman {currentPage + 1} dari {pages.length}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Page Navigation Tabs */}
                    <div className="flex gap-1 p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                        {pages.map((page, index) => (
                            <button
                                key={page.id}
                                onClick={() => setCurrentPage(index)}
                                className={`
                  flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${currentPage === index
                                        ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                                    }
                `}
                            >
                                <FileText className="w-4 h-4 inline mr-2" />
                                {page.title}
                            </button>
                        ))}
                    </div>

                    {/* PDF Content */}
                    <div className="overflow-auto max-h-[calc(90vh-200px)] bg-slate-100 dark:bg-slate-900 p-4">
                        {/* Hidden container with all pages for PDF generation */}
                        <div ref={pdfContainerRef} className="hidden">
                            {pages.map((page) => (
                                <div key={page.id} className="pdf-page">
                                    {page.component}
                                </div>
                            ))}
                        </div>

                        {/* Visible preview - single page */}
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white shadow-lg rounded-lg overflow-hidden mx-auto"
                            style={{ maxWidth: '210mm' }}
                        >
                            {pages[currentPage].component}
                        </motion.div>
                    </div>

                    {/* Page Navigation */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Sebelumnya
                        </button>

                        <div className="flex gap-2">
                            {pages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPage(index)}
                                    className={`
                    w-8 h-8 rounded-full text-sm font-medium transition-all
                    ${currentPage === index
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
                                        }
                  `}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                            disabled={currentPage === pages.length - 1}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Selanjutnya
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
                        <Button
                            variant="danger"
                            onClick={handleReset}
                            className="sm:w-auto"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset Data
                        </Button>

                        <div className="flex-1" />

                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="sm:w-auto"
                        >
                            Tutup
                        </Button>

                        <Button
                            variant="primary"
                            onClick={handleDownloadPDF}
                            disabled={isGenerating}
                            className="sm:w-auto"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Membuat PDF...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
