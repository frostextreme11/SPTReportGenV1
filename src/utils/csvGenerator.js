/**
 * CSV Generator Utility for DJP e-Form
 * Uses semicolon (;) delimiter as required by DJP
 * Strict UTF-8 encoding with BOM for Excel compatibility
 */

/**
 * Generate CSV string with semicolon delimiter
 * @param {string[]} headers - Array of header strings
 * @param {Array<Array<string|number>>} rows - 2D array of row data
 * @returns {string} CSV formatted string
 */
export function generateCSV(headers, rows) {
    // Join headers with semicolon
    const headerLine = headers.join(';');

    // Process each row
    const dataLines = rows.map(row => {
        return row.map(cell => {
            // Handle null/undefined
            if (cell === null || cell === undefined) return '';

            // Convert to string
            let value = String(cell);

            // Escape quotes and wrap in quotes if contains special characters
            if (value.includes(';') || value.includes('"') || value.includes('\n')) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }

            return value;
        }).join(';');
    });

    // Combine header and data
    return [headerLine, ...dataLines].join('\r\n');
}

/**
 * Format date to dd/mm/yyyy as required by DJP
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string
 */
export function formatDateDJP(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}

/**
 * Format money value - no thousand separators as per DJP requirement
 * @param {number} value - Numeric value
 * @returns {string} Formatted number string
 */
export function formatMoneyDJP(value) {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return String(Math.round(value));
}

/**
 * Clean NPWP - must be 15-16 digits
 * @param {string} npwp - NPWP string
 * @returns {string} Cleaned NPWP (digits only)
 */
export function cleanNPWP(npwp) {
    if (!npwp) return '';
    return npwp.replace(/\D/g, '');
}

/**
 * Download CSV file with UTF-8 BOM for Excel compatibility
 * @param {string} content - CSV content string
 * @param {string} filename - Filename for download
 */
export function downloadCSV(content, filename) {
    // Add UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ============================================
// DJP e-Form CSV Schemas
// ============================================

/**
 * Generate Depreciation CSV (Lampiran 1A)
 * @param {Array} assets - Array of asset objects
 * @param {string} npwp - Company NPWP for filename
 * @returns {{ content: string, filename: string }}
 */
export function generateDepreciationCSV(assets, npwp) {
    const headers = [
        'Jenis Harta',
        'Kelompok Harta',
        'Jenis Usaha',
        'Nama Harta',
        'Bln Perolehan',
        'Thn Perolehan',
        'Jenis Penyusutan Komersial',
        'Jenis Penyusutan Fiskal',
        'Harga Perolehan',
        'Nilai Sisa Buku',
        'Penyusutan fiskal tahun ini',
        'Keterangan nama harta'
    ];

    const rows = assets.map(asset => [
        asset.jenisHarta || 'Kelompok 1', // Default to Kelompok 1
        asset.kelompokHarta || '1',
        asset.jenisUsaha || '',
        asset.namaHarta || '',
        asset.bulanPerolehan || '01',
        asset.tahunPerolehan || '',
        asset.penyusutanKomersial || 'Garis Lurus',
        asset.penyusutanFiskal || 'Garis Lurus',
        formatMoneyDJP(asset.hargaPerolehan),
        formatMoneyDJP(asset.nilaiSisaBuku || 0),
        formatMoneyDJP(asset.penyusutanTahunIni || 0),
        asset.keterangan || ''
    ]);

    const content = generateCSV(headers, rows);
    const filename = `1771-ASET_${cleanNPWP(npwp)}.csv`;

    return { content, filename };
}

/**
 * Generate Domestic Tax Credit CSV (Lampiran III - PPh 22/23/26)
 * @param {Array} credits - Array of tax credit objects
 * @param {string} npwp - Company NPWP for filename
 * @returns {{ content: string, filename: string }}
 */
export function generateTaxCreditCSV(credits, npwp) {
    const headers = [
        'Nomor',
        'Nama Pemotong',
        'NPWP Pemotong',
        'Pasal',
        'Jenis',
        'Nilai Obj Pemotongan',
        'PPh Potput',
        'Nomor Bukti',
        'Tanggal',
        'Alamat',
        'NTPN'
    ];

    const rows = credits.map((credit, index) => [
        String(index + 1), // Nomor: Auto-increment
        credit.namaPemotong || '', // Nama Pemotong
        cleanNPWP(credit.npwpPemotong).slice(0, 15), // NPWP Pemotong: Max 15 digits
        credit.pasal || '23', // Pasal: 22, 23, or 26
        credit.kodeJenis || '24', // Jenis: Kode Jenis Penghasilan (1-25)
        formatMoneyDJP(credit.nilaiObjek), // Nilai Obj Pemotongan
        formatMoneyDJP(credit.jumlahDipotong), // PPh Potput
        credit.nomorBukti || '', // Nomor Bukti
        formatDateDJP(credit.tanggal), // Tanggal: dd/mm/yyyy
        credit.alamatPemotong || '', // Alamat Pemotong/Pemungut
        credit.ntpn || '' // NTPN: 16 digit
    ]);

    const content = generateCSV(headers, rows);
    const filename = `LAMPIRAN-III-1771-KREDIT_${cleanNPWP(npwp)}.csv`;

    return { content, filename };
}

/**
 * Generate Tax Payment CSV (SSP) - Strict DJP Schema
 * @param {Array} payments - Array of payment objects
 * @param {string} npwp - Company NPWP (not used in filename for this type)
 * @returns {{ content: string, filename: string }}
 */
export function generateTaxPaymentCSV(payments, npwp) {
    const headers = [
        'No',
        'KAP',
        'KJS',
        'Cara Pelunasan',
        'Nomor Bukti Setor/Pbk',
        'Jumlah Pembayaran',
        'Tanggal Setor'
    ];

    const rows = payments.map((payment, index) => [
        String(index + 1), // No: Auto-increment sequence
        payment.kap || '411126', // KAP: The selected code
        payment.kjs || '200', // KJS: The selected code
        payment.caraPelunasan || '1', // Cara Pelunasan: Default 1 (Via Bank/Persepsi)
        payment.ntpn || '', // Nomor Bukti Setor/Pbk: The NTPN string
        formatMoneyDJP(payment.jumlahPembayaran), // Jumlah Pembayaran: Integer string
        formatDateDJP(payment.tanggalSetor) // Tanggal Setor: dd/mm/yyyy
    ]);

    const content = generateCSV(headers, rows);
    // Exact filename as required: 1771-PEMBAYARAN SSP.csv
    const filename = '1771-PEMBAYARAN SSP.csv';

    return { content, filename };
}

