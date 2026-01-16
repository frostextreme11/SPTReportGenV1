import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, RotateCcw, Eye, ChevronLeft, ChevronRight, Loader2, Sparkles, FileDown } from 'lucide-react';
import { useFormData } from '../../context/FormContext';
import Button from '../ui/Button';
import NeracaPage from './NeracaPage';
import LabaRugiPage from './LabaRugiPage';
import PeredaranPage from './PeredaranPage';

export default function PDFPreview({ isOpen, onClose }) {
    const [currentPage, setCurrentPage] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);

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
        setDownloadSuccess(false);

        try {
            // Dynamically import html2pdf.js
            const html2pdf = (await import('html2pdf.js')).default;

            // Create wrapper to clip the PDF content from view
            const wrapper = document.createElement('div');
            wrapper.style.position = 'fixed';
            wrapper.style.left = '0';
            wrapper.style.top = '0';
            wrapper.style.width = '1px';
            wrapper.style.height = '1px';
            wrapper.style.overflow = 'hidden';
            wrapper.style.zIndex = '9999';
            wrapper.style.pointerEvents = 'none';

            // Create the actual PDF container - must have explicit dimensions
            const pdfContainer = document.createElement('div');
            pdfContainer.style.position = 'absolute';
            pdfContainer.style.left = '0';
            pdfContainer.style.top = '0';
            pdfContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
            pdfContainer.style.background = 'white';
            pdfContainer.style.color = 'black';
            pdfContainer.style.visibility = 'visible';

            wrapper.appendChild(pdfContainer);

            // Build HTML content for all 3 pages - with explicit heights
            const buildPageHTML = (title, content, isFirst = false) => `
                <div style="page-break-before: ${isFirst ? 'auto' : 'always'}; padding: 32px; font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #000; background: #fff; min-height: 1123px; box-sizing: border-box; height: auto;">
                    ${content}
                </div>
            `;

            const formatRupiah = (value) => {
                if (value === null || value === undefined || isNaN(value)) return '0';
                const absValue = Math.abs(value);
                return absValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            };

            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
            };

            const signatureBlock = `
                <div style="margin-top: 48px; display: flex; justify-content: flex-end;">
                    <div style="text-align: center; min-width: 200px;">
                        <p style="margin: 0;">${formData.kotaPenandatangan || ''}, ${formatDate(formData.tanggalLaporan)}</p>
                        <p style="margin: 4px 0 0 0;">${formData.jabatan || 'Direktur'},</p>
                        <div style="margin-top: 64px; border-bottom: 1px solid #000; padding-bottom: 4px;">
                            <p style="margin: 0; font-weight: bold;">${formData.namaPenandatangan || '___________________'}</p>
                        </div>
                    </div>
                </div>
            `;

            // Page 1: Neraca
            const neracaHTML = `
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0;">${formData.namaPerusahaan || 'NAMA PERUSAHAAN'}</h1>
                    <h2 style="font-size: 12pt; font-weight: bold; text-transform: uppercase; margin: 4px 0 0 0;">NERACA</h2>
                    <p style="font-size: 10pt; margin: 4px 0 0 0;">Per 31 Desember ${formData.tahunPajak}</p>
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
                    <thead>
                        <tr style="background: #f3f4f6;">
                            <th style="border: 1px solid #000; padding: 8px; text-align: left; width: 35%;">AKTIVA</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: right; width: 15%;">Rp</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: left; width: 35%;">KEWAJIBAN DAN MODAL</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: right; width: 15%;">Rp</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #f9fafb;">AKTIVA LANCAR</td>
                            <td style="border: 1px solid #000; padding: 8px;"></td>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #f9fafb;">KEWAJIBAN</td>
                            <td style="border: 1px solid #000; padding: 8px;"></td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; padding-left: 16px;">Kas dan Setara Kas</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(formData.kas)}</td>
                            <td style="border: 1px solid #000; padding: 8px; padding-left: 16px;">Utang Usaha</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(formData.utangUsaha)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; padding-left: 16px;">Piutang Usaha</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(formData.piutang)}</td>
                            <td style="border: 1px solid #000; padding: 8px; padding-left: 16px;">Utang Lain-lain</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(formData.utangLain)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; padding-left: 16px;">Persediaan</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(formData.persediaan)}</td>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #f9fafb;">Total Kewajiban</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold; background: #f9fafb;">${formatRupiah(calculations.totalKewajiban)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; padding-left: 16px;">Biaya Dibayar Dimuka</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(formData.biayaDibayarDimuka)}</td>
                            <td style="border: 1px solid #000; padding: 8px;"></td>
                            <td style="border: 1px solid #000; padding: 8px;"></td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #f9fafb;">Total Aktiva Lancar</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold; background: #f9fafb;">${formatRupiah(calculations.totalAktivaLancar)}</td>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #f9fafb;">MODAL</td>
                            <td style="border: 1px solid #000; padding: 8px;"></td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #f9fafb;">AKTIVA TETAP</td>
                            <td style="border: 1px solid #000; padding: 8px;"></td>
                            <td style="border: 1px solid #000; padding: 8px; padding-left: 16px;">Modal Saham</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(formData.modalSaham)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; padding-left: 16px;">Kendaraan</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(formData.kendaraan)}</td>
                            <td style="border: 1px solid #000; padding: 8px; padding-left: 16px;">Laba Ditahan</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(formData.labaDitahan)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; padding-left: 16px;">Peralatan</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(formData.peralatan)}</td>
                            <td style="border: 1px solid #000; padding: 8px; padding-left: 16px;">Laba Tahun Berjalan</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(calculations.labaBersih)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; padding-left: 16px;">Inventaris</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(formData.inventaris)}</td>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #f9fafb;">Total Modal</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold; background: #f9fafb;">${formatRupiah(calculations.totalModal)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; padding-left: 16px;">Akumulasi Penyusutan</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">(${formatRupiah(Math.abs(formData.akumulasiPenyusutan))})</td>
                            <td style="border: 1px solid #000; padding: 8px;"></td>
                            <td style="border: 1px solid #000; padding: 8px;"></td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #f9fafb;">Total Aktiva Tetap</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold; background: #f9fafb;">${formatRupiah(calculations.totalAktivaTetap)}</td>
                            <td style="border: 1px solid #000; padding: 8px;"></td>
                            <td style="border: 1px solid #000; padding: 8px;"></td>
                        </tr>
                        <tr style="background: #e5e7eb;">
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">TOTAL AKTIVA</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">${formatRupiah(calculations.totalAktiva)}</td>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">TOTAL KEWAJIBAN + MODAL</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">${formatRupiah(calculations.totalKewajiban + calculations.totalModal)}</td>
                        </tr>
                    </tbody>
                </table>
                ${signatureBlock}
            `;

            // Page 2: Laba Rugi
            const labaRugiHTML = `
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0;">${formData.namaPerusahaan || 'NAMA PERUSAHAAN'}</h1>
                    <h2 style="font-size: 12pt; font-weight: bold; text-transform: uppercase; margin: 4px 0 0 0;">LAPORAN LABA RUGI</h2>
                    <p style="font-size: 10pt; margin: 4px 0 0 0;">Untuk Periode yang Berakhir 31 Desember ${formData.tahunPajak}</p>
                </div>
                <table style="width: 100%; font-size: 11pt;">
                    <tbody>
                        <tr><td colspan="2" style="padding: 8px 0; font-weight: bold; font-size: 12pt;">PENDAPATAN</td></tr>
                        <tr><td style="padding: 4px 0 4px 16px;">Pendapatan Usaha</td><td style="text-align: right;">${formatRupiah(formData.pendapatan)}</td></tr>
                        <tr><td colspan="2" style="padding: 8px 0; font-weight: bold; border-top: 1px solid #000;">Total Pendapatan</td></tr>
                        <tr><td></td><td style="text-align: right; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px;">${formatRupiah(formData.pendapatan)}</td></tr>
                        
                        <tr><td colspan="2" style="padding: 16px 0 8px 0; font-weight: bold; font-size: 12pt;">HARGA POKOK PENJUALAN</td></tr>
                        <tr><td style="padding: 4px 0 4px 16px;">Harga Pokok Penjualan</td><td style="text-align: right;">(${formatRupiah(formData.hpp)})</td></tr>
                        
                        <tr style="background: #f3f4f6;"><td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000;">LABA KOTOR</td><td style="text-align: right; font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000;">${formatRupiah(calculations.labaKotor)}</td></tr>
                        
                        <tr><td colspan="2" style="padding: 16px 0 8px 0; font-weight: bold; font-size: 12pt;">BEBAN OPERASIONAL</td></tr>
                        <tr><td style="padding: 4px 0 4px 16px;">Biaya Operasional</td><td style="text-align: right;">(${formatRupiah(formData.biayaOperasional)})</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #000;">Total Beban Operasional</td><td style="text-align: right; font-weight: bold; border-top: 1px solid #000;">(${formatRupiah(formData.biayaOperasional)})</td></tr>
                        
                        <tr><td style="padding: 8px 0; font-weight: bold;">LABA OPERASIONAL</td><td style="text-align: right; font-weight: bold;">${formatRupiah(calculations.labaKotor - formData.biayaOperasional)}</td></tr>
                        
                        <tr><td colspan="2" style="padding: 16px 0 8px 0; font-weight: bold; font-size: 12pt;">PENDAPATAN DAN BEBAN LAIN-LAIN</td></tr>
                        <tr><td style="padding: 4px 0 4px 16px;">Pendapatan Lain-lain</td><td style="text-align: right;">${formatRupiah(formData.pendapatanLain)}</td></tr>
                        <tr><td style="padding: 4px 0 4px 16px;">Beban Lain-lain</td><td style="text-align: right;">(${formatRupiah(formData.bebanLain)})</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #000;">Total Pendapatan/(Beban) Lain-lain</td><td style="text-align: right; font-weight: bold; border-top: 1px solid #000;">${formatRupiah(formData.pendapatanLain - formData.bebanLain)}</td></tr>
                        
                        <tr style="background: #e5e7eb;"><td style="padding: 12px 0; font-weight: bold; font-size: 12pt; border-top: 2px solid #000; border-bottom: 2px solid #000;">LABA BERSIH</td><td style="text-align: right; font-weight: bold; font-size: 12pt; border-top: 2px solid #000; border-bottom: 2px solid #000;">${formatRupiah(calculations.labaBersih)}</td></tr>
                    </tbody>
                </table>
                ${signatureBlock}
            `;

            // Page 3: Peredaran Usaha
            const peredaranRows = formData.peredaran.map((item, index) => `
                <tr style="background: ${index % 2 === 0 ? '#fff' : '#f9fafb'};">
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">${index + 1}</td>
                    <td style="border: 1px solid #000; padding: 8px;">${item.bulan}</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(item.pendapatan)}</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(item.pphFinal)}</td>
                </tr>
            `).join('');

            const peredaranHTML = `
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0;">${formData.namaPerusahaan || 'NAMA PERUSAHAAN'}</h1>
                    <p style="font-size: 10pt; margin: 4px 0 0 0;">NPWP: ${formData.npwp || '-'}</p>
                    <p style="font-size: 10pt; margin: 4px 0 0 0;">${formData.alamat || '-'}</p>
                    <h2 style="font-size: 12pt; font-weight: bold; text-transform: uppercase; margin: 16px 0 0 0;">DAFTAR PEREDARAN USAHA</h2>
                    <p style="font-size: 10pt; margin: 4px 0 0 0;">Tahun Pajak ${formData.tahunPajak}</p>
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
                    <thead>
                        <tr style="background: #f3f4f6;">
                            <th style="border: 1px solid #000; padding: 8px; text-align: center; width: 40px;">No</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Bulan</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: right;">Peredaran Usaha (Rp)</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: right;">PPh Final 0.5% (Rp)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${peredaranRows}
                        <tr style="background: #e5e7eb; font-weight: bold;">
                            <td style="border: 1px solid #000; padding: 8px; text-align: center;" colspan="2">TOTAL</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(calculations.totalPeredaran)}</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(calculations.totalPphFinal)}</td>
                        </tr>
                    </tbody>
                </table>
                <div style="margin-top: 24px; font-size: 10pt;">
                    <p style="font-weight: bold; margin-bottom: 8px;">Catatan:</p>
                    <ul style="list-style: disc; padding-left: 20px; color: #4b5563; margin: 0;">
                        <li>PPh Final dihitung berdasarkan PP 23 Tahun 2018 (tarif 0.5% dari peredaran bruto)</li>
                        <li>Berlaku untuk Wajib Pajak dengan peredaran bruto ≤ Rp 4.800.000.000 per tahun</li>
                    </ul>
                </div>
                ${signatureBlock}
            `;

            // Combine all pages
            pdfContainer.innerHTML = `
                ${buildPageHTML('Neraca', neracaHTML, true)}
                ${buildPageHTML('Laba Rugi', labaRugiHTML)}
                ${buildPageHTML('Peredaran Usaha', peredaranHTML)}
            `;

            document.body.appendChild(wrapper);

            // Wait for DOM to render and layout to be calculated
            await new Promise(resolve => setTimeout(resolve, 200));

            // Force layout calculation by reading properties
            const containerHeight = pdfContainer.scrollHeight;
            const containerWidth = pdfContainer.scrollWidth;
            // console.log('PDF Container dimensions:', containerWidth, 'x', containerHeight);

            const options = {
                margin: [10, 10, 10, 10],
                filename: `Laporan_Keuangan_${formData.namaPerusahaan?.replace(/\s+/g, '_') || 'Perusahaan'}_${formData.tahunPajak}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false,
                    scrollX: 0,
                    scrollY: 0,
                    width: containerWidth,
                    height: containerHeight,
                    windowWidth: containerWidth,
                    windowHeight: containerHeight,
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                },
                pagebreak: {
                    mode: 'css',
                },
            };

            await html2pdf().set(options).from(pdfContainer).save();

            // Clean up
            document.body.removeChild(wrapper);

            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 3000);
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
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
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

                    {/* Big Download Button - Always Visible */}
                    <div className="p-4 bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-900/20 dark:to-emerald-900/20 border-b border-slate-200 dark:border-slate-700">
                        <motion.button
                            onClick={handleDownloadPDF}
                            disabled={isGenerating}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                                w-full py-4 px-6 rounded-xl font-bold text-lg
                                flex items-center justify-center gap-3
                                transition-all duration-300 relative overflow-hidden
                                ${isGenerating
                                    ? 'bg-slate-400 cursor-wait'
                                    : downloadSuccess
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30'
                                        : 'bg-gradient-to-r from-primary-500 via-primary-600 to-emerald-500 hover:from-primary-600 hover:via-primary-700 hover:to-emerald-600 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40'
                                }
                                text-white
                            `}
                        >
                            {/* Animated background shimmer */}
                            {!isGenerating && !downloadSuccess && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                                />
                            )}

                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Membuat PDF...</span>
                                </>
                            ) : downloadSuccess ? (
                                <>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500 }}
                                    >
                                        <Sparkles className="w-6 h-6" />
                                    </motion.div>
                                    <span>Berhasil Diunduh! ✓</span>
                                </>
                            ) : (
                                <>
                                    <FileDown className="w-6 h-6" />
                                    <span>Download Semua Laporan (PDF)</span>
                                    <motion.div
                                        animate={{ y: [0, 3, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        <Download className="w-5 h-5" />
                                    </motion.div>
                                </>
                            )}
                        </motion.button>
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
                            📄 3 halaman: Neraca, Laba Rugi, dan Peredaran Usaha
                        </p>
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
                    <div className="overflow-auto flex-1 bg-slate-100 dark:bg-slate-900 p-4">
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
                    <div className="flex flex-col sm:flex-row gap-3 p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
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
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
