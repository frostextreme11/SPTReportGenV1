import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, RotateCcw, Eye, ChevronLeft, ChevronRight, Loader2, Sparkles, FileDown, Download } from 'lucide-react';
import { useFormData } from '../../context/FormContext';
import Button from '../ui/Button';
import NeracaPage from './NeracaPage';
import LabaRugiPage from './LabaRugiPage';
import PeredaranPage from './PeredaranPage';

export default function PDFPreview({ isOpen, onClose }) {
    const [currentPage, setCurrentPage] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingDoc, setGeneratingDoc] = useState(null); // 'all', 'neraca', 'labarugi', 'peredaran'
    const [downloadSuccess, setDownloadSuccess] = useState(null);

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

    // Helper functions for PDF content generation
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
        <div style="margin-top: 48px; text-align: right;">
            <div style="display: inline-block; text-align: center; min-width: 200px;">
                <p style="margin: 0;">${formData.kotaPenandatangan || ''}, ${formatDate(formData.tanggalLaporan)}</p>
                <p style="margin: 4px 0 0 0;">${formData.jabatan || 'Direktur'},</p>
                <div style="margin-top: 60px; border-bottom: 1px solid #000; padding-bottom: 4px;">
                    <p style="margin: 0; font-weight: bold;">${formData.namaPenandatangan || '___________________'}</p>
                </div>
            </div>
        </div>
    `;

    // Generate Neraca HTML
    const getNeracaHTML = () => `
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0;">${formData.namaPerusahaan || 'NAMA PERUSAHAAN'}</h1>
            <h2 style="font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 8px 0 0 0;">NERACA</h2>
            <p style="font-size: 11pt; margin: 4px 0 0 0;">Per 31 Desember ${formData.tahunPajak}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
            <thead>
                <tr style="background: #e5e7eb;">
                    <th style="border: 1px solid #000; padding: 6px; text-align: left; width: 35%;">AKTIVA</th>
                    <th style="border: 1px solid #000; padding: 6px; text-align: right; width: 15%;">Rp</th>
                    <th style="border: 1px solid #000; padding: 6px; text-align: left; width: 35%;">KEWAJIBAN DAN MODAL</th>
                    <th style="border: 1px solid #000; padding: 6px; text-align: right; width: 15%;">Rp</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000; padding: 5px; font-weight: bold; background: #f3f4f6;">AKTIVA LANCAR</td>
                    <td style="border: 1px solid #000; padding: 5px;"></td>
                    <td style="border: 1px solid #000; padding: 5px; font-weight: bold; background: #f3f4f6;">KEWAJIBAN</td>
                    <td style="border: 1px solid #000; padding: 5px;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 5px; padding-left: 12px;">Kas dan Setara Kas</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right;">${formatRupiah(formData.kas)}</td>
                    <td style="border: 1px solid #000; padding: 5px; padding-left: 12px;">Utang Usaha</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right;">${formatRupiah(formData.utangUsaha)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 5px; padding-left: 12px;">Piutang Usaha</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right;">${formatRupiah(formData.piutang)}</td>
                    <td style="border: 1px solid #000; padding: 5px; padding-left: 12px;">Utang Lain-lain</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right;">${formatRupiah(formData.utangLain)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 5px; padding-left: 12px;">Persediaan</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right;">${formatRupiah(formData.persediaan)}</td>
                    <td style="border: 1px solid #000; padding: 5px; font-weight: bold; background: #f3f4f6;">Total Kewajiban</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right; font-weight: bold; background: #f3f4f6;">${formatRupiah(calculations.totalKewajiban)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 5px; padding-left: 12px;">Biaya Dibayar Dimuka</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right;">${formatRupiah(formData.biayaDibayarDimuka)}</td>
                    <td style="border: 1px solid #000; padding: 5px;"></td>
                    <td style="border: 1px solid #000; padding: 5px;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 5px; font-weight: bold; background: #f3f4f6;">Total Aktiva Lancar</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right; font-weight: bold; background: #f3f4f6;">${formatRupiah(calculations.totalAktivaLancar)}</td>
                    <td style="border: 1px solid #000; padding: 5px; font-weight: bold; background: #f3f4f6;">MODAL</td>
                    <td style="border: 1px solid #000; padding: 5px;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 5px; font-weight: bold; background: #f3f4f6;">AKTIVA TETAP</td>
                    <td style="border: 1px solid #000; padding: 5px;"></td>
                    <td style="border: 1px solid #000; padding: 5px; padding-left: 12px;">Modal Saham</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right;">${formatRupiah(formData.modalSaham)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 5px; padding-left: 12px;">Kendaraan</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right;">${formatRupiah(formData.kendaraan)}</td>
                    <td style="border: 1px solid #000; padding: 5px; padding-left: 12px;">Laba Ditahan</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right;">${formatRupiah(formData.labaDitahan)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 5px; padding-left: 12px;">Peralatan</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right;">${formatRupiah(formData.peralatan)}</td>
                    <td style="border: 1px solid #000; padding: 5px; padding-left: 12px;">Laba Tahun Berjalan</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right;">${formatRupiah(calculations.labaBersih)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 5px; padding-left: 12px;">Inventaris</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right;">${formatRupiah(formData.inventaris)}</td>
                    <td style="border: 1px solid #000; padding: 5px; font-weight: bold; background: #f3f4f6;">Total Modal</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right; font-weight: bold; background: #f3f4f6;">${formatRupiah(calculations.totalModal)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 5px; padding-left: 12px;">Akumulasi Penyusutan</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right;">(${formatRupiah(Math.abs(formData.akumulasiPenyusutan))})</td>
                    <td style="border: 1px solid #000; padding: 5px;"></td>
                    <td style="border: 1px solid #000; padding: 5px;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 5px; font-weight: bold; background: #f3f4f6;">Total Aktiva Tetap</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: right; font-weight: bold; background: #f3f4f6;">${formatRupiah(calculations.totalAktivaTetap)}</td>
                    <td style="border: 1px solid #000; padding: 5px;"></td>
                    <td style="border: 1px solid #000; padding: 5px;"></td>
                </tr>
                <tr style="background: #d1d5db;">
                    <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">TOTAL AKTIVA</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">${formatRupiah(calculations.totalAktiva)}</td>
                    <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">TOTAL KEWAJIBAN + MODAL</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">${formatRupiah(calculations.totalKewajiban + calculations.totalModal)}</td>
                </tr>
            </tbody>
        </table>
        ${signatureBlock}
    `;

    // Generate Laba Rugi HTML
    const getLabaRugiHTML = () => `
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0;">${formData.namaPerusahaan || 'NAMA PERUSAHAAN'}</h1>
            <h2 style="font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 8px 0 0 0;">LAPORAN LABA RUGI</h2>
            <p style="font-size: 11pt; margin: 4px 0 0 0;">Untuk Periode yang Berakhir 31 Desember ${formData.tahunPajak}</p>
        </div>
        <table style="width: 100%; font-size: 11pt; border-collapse: collapse;">
            <tbody>
                <tr><td colspan="2" style="padding: 8px 0 4px 0; font-weight: bold; font-size: 12pt; border-bottom: 1px solid #ccc;">PENDAPATAN</td></tr>
                <tr><td style="padding: 4px 0 4px 16px;">Pendapatan Usaha</td><td style="text-align: right; padding: 4px 0;">${formatRupiah(formData.pendapatan)}</td></tr>
                <tr style="background: #f3f4f6;"><td style="padding: 6px 0; font-weight: bold;">Total Pendapatan</td><td style="text-align: right; font-weight: bold; padding: 6px 0; border-bottom: 1px solid #000;">${formatRupiah(formData.pendapatan)}</td></tr>
                
                <tr><td colspan="2" style="padding: 12px 0 4px 0; font-weight: bold; font-size: 12pt; border-bottom: 1px solid #ccc;">HARGA POKOK PENJUALAN</td></tr>
                <tr><td style="padding: 4px 0 4px 16px;">Harga Pokok Penjualan</td><td style="text-align: right; padding: 4px 0;">(${formatRupiah(formData.hpp)})</td></tr>
                
                <tr style="background: #d1fae5;"><td style="padding: 8px 0; font-weight: bold; font-size: 12pt;">LABA KOTOR</td><td style="text-align: right; font-weight: bold; font-size: 12pt; padding: 8px 0;">${formatRupiah(calculations.labaKotor)}</td></tr>
                
                <tr><td colspan="2" style="padding: 12px 0 4px 0; font-weight: bold; font-size: 12pt; border-bottom: 1px solid #ccc;">BEBAN OPERASIONAL</td></tr>
                <tr><td style="padding: 4px 0 4px 16px;">Biaya Operasional</td><td style="text-align: right; padding: 4px 0;">(${formatRupiah(formData.biayaOperasional)})</td></tr>
                <tr style="background: #f3f4f6;"><td style="padding: 6px 0; font-weight: bold;">Total Beban Operasional</td><td style="text-align: right; font-weight: bold; padding: 6px 0;">(${formatRupiah(formData.biayaOperasional)})</td></tr>
                
                <tr><td style="padding: 8px 0; font-weight: bold;">LABA OPERASIONAL</td><td style="text-align: right; font-weight: bold; padding: 8px 0;">${formatRupiah(calculations.labaKotor - formData.biayaOperasional)}</td></tr>
                
                <tr><td colspan="2" style="padding: 12px 0 4px 0; font-weight: bold; font-size: 12pt; border-bottom: 1px solid #ccc;">PENDAPATAN DAN BEBAN LAIN-LAIN</td></tr>
                <tr><td style="padding: 4px 0 4px 16px;">Pendapatan Lain-lain</td><td style="text-align: right; padding: 4px 0;">${formatRupiah(formData.pendapatanLain)}</td></tr>
                <tr><td style="padding: 4px 0 4px 16px;">Beban Lain-lain</td><td style="text-align: right; padding: 4px 0;">(${formatRupiah(formData.bebanLain)})</td></tr>
                <tr style="background: #f3f4f6;"><td style="padding: 6px 0; font-weight: bold;">Total Pendapatan/(Beban) Lain-lain</td><td style="text-align: right; font-weight: bold; padding: 6px 0;">${formatRupiah(formData.pendapatanLain - formData.bebanLain)}</td></tr>
                
                <tr style="background: #10b981; color: white;"><td style="padding: 10px 0; font-weight: bold; font-size: 14pt;">LABA BERSIH</td><td style="text-align: right; font-weight: bold; font-size: 14pt; padding: 10px 0;">${formatRupiah(calculations.labaBersih)}</td></tr>
            </tbody>
        </table>
        ${signatureBlock}
    `;

    // Generate Peredaran Usaha HTML
    const getPeredaranHTML = () => {
        const peredaranRows = formData.peredaran.map((item, index) => `
            <tr style="background: ${index % 2 === 0 ? '#fff' : '#f9fafb'};">
                <td style="border: 1px solid #000; padding: 6px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #000; padding: 6px;">${item.bulan}</td>
                <td style="border: 1px solid #000; padding: 6px; text-align: right;">${formatRupiah(item.pendapatan)}</td>
                <td style="border: 1px solid #000; padding: 6px; text-align: right;">${formatRupiah(item.pphFinal)}</td>
            </tr>
        `).join('');

        return `
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0;">${formData.namaPerusahaan || 'NAMA PERUSAHAAN'}</h1>
                <p style="font-size: 10pt; margin: 4px 0 0 0;">NPWP: ${formData.npwp || '-'}</p>
                <p style="font-size: 10pt; margin: 2px 0 0 0;">${formData.alamat || '-'}</p>
                <h2 style="font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 16px 0 0 0;">DAFTAR PEREDARAN USAHA</h2>
                <p style="font-size: 11pt; margin: 4px 0 0 0;">Tahun Pajak ${formData.tahunPajak}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
                <thead>
                    <tr style="background: #e5e7eb;">
                        <th style="border: 1px solid #000; padding: 8px; text-align: center; width: 40px;">No</th>
                        <th style="border: 1px solid #000; padding: 8px; text-align: left;">Bulan</th>
                        <th style="border: 1px solid #000; padding: 8px; text-align: right;">Peredaran Usaha (Rp)</th>
                        <th style="border: 1px solid #000; padding: 8px; text-align: right;">PPh Final 0.5% (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    ${peredaranRows}
                    <tr style="background: #10b981; color: white; font-weight: bold;">
                        <td style="border: 1px solid #000; padding: 8px; text-align: center;" colspan="2">TOTAL</td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(calculations.totalPeredaran)}</td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatRupiah(calculations.totalPphFinal)}</td>
                    </tr>
                </tbody>
            </table>
            <div style="margin-top: 20px; font-size: 10pt; padding: 12px; background: #f3f4f6; border-radius: 4px;">
                <p style="font-weight: bold; margin: 0 0 6px 0;">Catatan:</p>
                <ul style="list-style: disc; padding-left: 20px; color: #4b5563; margin: 0;">
                    <li>PPh Final dihitung berdasarkan PP 23 Tahun 2018 (tarif 0.5% dari peredaran bruto)</li>
                    <li>Berlaku untuk Wajib Pajak dengan peredaran bruto ≤ Rp 4.800.000.000 per tahun</li>
                </ul>
            </div>
            ${signatureBlock}
        `;
    };

    // Generate single PDF for a specific document type
    const generateSinglePDF = async (docType, docTitle, htmlContent) => {
        const html2pdf = (await import('html2pdf.js')).default;

        // Create wrapper to clip content from view
        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.left = '0';
        wrapper.style.top = '0';
        wrapper.style.width = '1px';
        wrapper.style.height = '1px';
        wrapper.style.overflow = 'hidden';
        wrapper.style.zIndex = '9999';
        wrapper.style.pointerEvents = 'none';

        // Create the PDF container
        const pdfContainer = document.createElement('div');
        pdfContainer.style.position = 'absolute';
        pdfContainer.style.left = '0';
        pdfContainer.style.top = '0';
        pdfContainer.style.width = '794px';
        pdfContainer.style.padding = '40px';
        pdfContainer.style.background = 'white';
        pdfContainer.style.color = 'black';
        pdfContainer.style.fontFamily = "'Times New Roman', serif";
        pdfContainer.style.fontSize = '12pt';
        pdfContainer.style.lineHeight = '1.4';
        pdfContainer.style.boxSizing = 'border-box';
        pdfContainer.innerHTML = htmlContent;

        wrapper.appendChild(pdfContainer);
        document.body.appendChild(wrapper);

        // Wait for DOM render
        await new Promise(resolve => setTimeout(resolve, 300));

        const containerHeight = pdfContainer.scrollHeight;
        const containerWidth = pdfContainer.scrollWidth;

        const options = {
            margin: [15, 15, 15, 15],
            filename: `${docTitle}_${formData.namaPerusahaan?.replace(/\s+/g, '_') || 'Perusahaan'}_${formData.tahunPajak}.pdf`,
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
        };

        await html2pdf().set(options).from(pdfContainer).save();
        document.body.removeChild(wrapper);
    };

    // Download individual document
    const handleDownloadSingle = async (docType) => {
        setIsGenerating(true);
        setGeneratingDoc(docType);
        setDownloadSuccess(null);

        try {
            let htmlContent, docTitle;
            switch (docType) {
                case 'neraca':
                    htmlContent = getNeracaHTML();
                    docTitle = 'Neraca';
                    break;
                case 'labarugi':
                    htmlContent = getLabaRugiHTML();
                    docTitle = 'Laba_Rugi';
                    break;
                case 'peredaran':
                    htmlContent = getPeredaranHTML();
                    docTitle = 'Peredaran_Usaha';
                    break;
                default:
                    return;
            }

            await generateSinglePDF(docType, docTitle, htmlContent);
            setDownloadSuccess(docType);
            setTimeout(() => setDownloadSuccess(null), 3000);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Terjadi kesalahan saat membuat PDF. Silakan coba lagi.');
        } finally {
            setIsGenerating(false);
            setGeneratingDoc(null);
        }
    };

    // Download all documents as a single combined PDF
    const handleDownloadAll = async () => {
        setIsGenerating(true);
        setGeneratingDoc('all');
        setDownloadSuccess(null);

        try {
            const { jsPDF } = await import('jspdf');
            const html2canvas = (await import('html2canvas')).default;

            // Create a new PDF document
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);

            // Helper function to render HTML to canvas and add to PDF
            const addPageToPDF = async (htmlContent, isFirstPage = false) => {
                // Create wrapper to clip content from view
                const wrapper = document.createElement('div');
                wrapper.style.position = 'fixed';
                wrapper.style.left = '0';
                wrapper.style.top = '0';
                wrapper.style.width = '1px';
                wrapper.style.height = '1px';
                wrapper.style.overflow = 'hidden';
                wrapper.style.zIndex = '9999';
                wrapper.style.pointerEvents = 'none';

                // Create the PDF container
                const pdfContainer = document.createElement('div');
                pdfContainer.style.position = 'absolute';
                pdfContainer.style.left = '0';
                pdfContainer.style.top = '0';
                pdfContainer.style.width = '794px'; // A4 width at 96dpi
                pdfContainer.style.minHeight = '1123px'; // A4 height at 96dpi
                pdfContainer.style.padding = '40px';
                pdfContainer.style.background = 'white';
                pdfContainer.style.color = 'black';
                pdfContainer.style.fontFamily = "'Times New Roman', serif";
                pdfContainer.style.fontSize = '12pt';
                pdfContainer.style.lineHeight = '1.4';
                pdfContainer.style.boxSizing = 'border-box';
                pdfContainer.innerHTML = htmlContent;

                wrapper.appendChild(pdfContainer);
                document.body.appendChild(wrapper);

                // Wait for DOM render
                await new Promise(resolve => setTimeout(resolve, 300));

                // Render to canvas
                const canvas = await html2canvas(pdfContainer, {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                // Calculate dimensions to fit content on one page
                const imgWidth = contentWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                // If not the first page, add a new page
                if (!isFirstPage) {
                    pdf.addPage();
                }

                // Add the image to PDF
                const imgData = canvas.toDataURL('image/jpeg', 0.98);

                // If content is taller than page, scale it down to fit
                let finalImgHeight = imgHeight;
                let finalImgWidth = imgWidth;
                const maxContentHeight = pageHeight - (margin * 2);

                if (imgHeight > maxContentHeight) {
                    const scaleFactor = maxContentHeight / imgHeight;
                    finalImgHeight = maxContentHeight;
                    finalImgWidth = imgWidth * scaleFactor;
                }

                // Center horizontally if scaled down
                const xOffset = margin + (contentWidth - finalImgWidth) / 2;

                pdf.addImage(imgData, 'JPEG', xOffset, margin, finalImgWidth, finalImgHeight);

                // Cleanup
                document.body.removeChild(wrapper);
            };

            // Add Neraca page
            await addPageToPDF(getNeracaHTML(), true);

            // Add Laba Rugi page
            await addPageToPDF(getLabaRugiHTML(), false);

            // Add Peredaran Usaha page
            await addPageToPDF(getPeredaranHTML(), false);

            // Save the combined PDF
            const filename = `Laporan_Keuangan_${formData.namaPerusahaan?.replace(/\s+/g, '_') || 'Perusahaan'}_${formData.tahunPajak}.pdf`;
            pdf.save(filename);

            setDownloadSuccess('all');
            setTimeout(() => setDownloadSuccess(null), 3000);
        } catch (error) {
            console.error('Error generating PDFs:', error);
            alert('Terjadi kesalahan saat membuat PDF. Silakan coba lagi.');
        } finally {
            setIsGenerating(false);
            setGeneratingDoc(null);
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
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
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

                    {/* Download Buttons Section */}
                    <div className="p-4 bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-900/20 dark:to-emerald-900/20 border-b border-slate-200 dark:border-slate-700">
                        {/* Main Download All Button */}
                        <motion.button
                            onClick={handleDownloadAll}
                            disabled={isGenerating}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                                w-full py-3 px-6 rounded-xl font-bold text-base
                                flex items-center justify-center gap-3
                                transition-all duration-300 relative overflow-hidden
                                ${isGenerating && generatingDoc === 'all'
                                    ? 'bg-slate-400 cursor-wait'
                                    : downloadSuccess === 'all'
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30'
                                        : 'bg-gradient-to-r from-primary-500 via-primary-600 to-emerald-500 hover:from-primary-600 hover:via-primary-700 hover:to-emerald-600 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40'
                                }
                                text-white mb-3
                            `}
                        >
                            {!isGenerating && downloadSuccess !== 'all' && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                                />
                            )}

                            {isGenerating && generatingDoc === 'all' ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Membuat PDF Laporan Keuangan...</span>
                                </>
                            ) : downloadSuccess === 'all' ? (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    <span>Laporan Berhasil Diunduh! ✓</span>
                                </>
                            ) : (
                                <>
                                    <FileDown className="w-5 h-5" />
                                    <span>Download Laporan Keuangan (1 PDF - 3 Halaman)</span>
                                </>
                            )}
                        </motion.button>

                        {/* Individual Download Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'neraca', label: 'Neraca', icon: '📊' },
                                { id: 'labarugi', label: 'Laba Rugi', icon: '📈' },
                                { id: 'peredaran', label: 'Peredaran', icon: '📋' },
                            ].map((doc) => (
                                <motion.button
                                    key={doc.id}
                                    onClick={() => handleDownloadSingle(doc.id)}
                                    disabled={isGenerating}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`
                                        py-2 px-3 rounded-lg font-medium text-sm
                                        flex items-center justify-center gap-2
                                        transition-all duration-200
                                        ${isGenerating && generatingDoc === doc.id
                                            ? 'bg-slate-300 dark:bg-slate-600 cursor-wait'
                                            : downloadSuccess === doc.id
                                                ? 'bg-green-500 text-white'
                                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                                        }
                                    `}
                                >
                                    {isGenerating && generatingDoc === doc.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : downloadSuccess === doc.id ? (
                                        <span>✓</span>
                                    ) : (
                                        <span>{doc.icon}</span>
                                    )}
                                    <span>{doc.label}</span>
                                    <Download className="w-3 h-3" />
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Page Tabs */}
                    <div className="flex gap-1 p-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
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

                    {/* PDF Content Preview */}
                    <div className="overflow-auto flex-1 bg-slate-100 dark:bg-slate-900 p-4">
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
                                    className={`w-3 h-3 rounded-full transition-all ${currentPage === index
                                        ? 'bg-primary-500 scale-125'
                                        : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                                        }`}
                                />
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
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset Data
                        </Button>

                        <Button variant="outline" onClick={onClose}>
                            Tutup
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
