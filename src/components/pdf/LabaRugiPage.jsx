import { formatRupiah } from '../../utils/currency';

export default function LabaRugiPage({ formData, calculations }) {
    const { labaKotor, labaBersih } = calculations;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    return (
        <div className="pdf-page bg-white text-black p-8" style={{ fontFamily: 'Times New Roman, serif', fontSize: '12pt', lineHeight: '1.6' }}>
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-lg font-bold uppercase tracking-wide">{formData.namaPerusahaan || 'NAMA PERUSAHAAN'}</h1>
                <h2 className="text-base font-bold uppercase mt-1">LAPORAN LABA RUGI</h2>
                <p className="text-sm mt-1">Untuk Periode yang Berakhir 31 Desember {formData.tahunPajak}</p>
            </div>

            {/* Profit & Loss Table */}
            <table className="w-full border-collapse text-sm">
                <tbody>
                    {/* Revenue Section */}
                    <tr>
                        <td className="py-2 font-bold text-base" colSpan="2">PENDAPATAN</td>
                    </tr>
                    <tr>
                        <td className="py-1 pl-4">Pendapatan Usaha</td>
                        <td className="py-1 text-right">{formatRupiah(formData.pendapatan, false)}</td>
                    </tr>
                    <tr>
                        <td className="py-2 font-bold border-t border-black" colSpan="2">Total Pendapatan</td>
                    </tr>
                    <tr>
                        <td className="py-1 pl-4"></td>
                        <td className="py-1 text-right font-bold border-b border-black">{formatRupiah(formData.pendapatan, false)}</td>
                    </tr>

                    {/* COGS Section */}
                    <tr>
                        <td className="py-2 pt-4 font-bold text-base" colSpan="2">HARGA POKOK PENJUALAN</td>
                    </tr>
                    <tr>
                        <td className="py-1 pl-4">Harga Pokok Penjualan</td>
                        <td className="py-1 text-right">({formatRupiah(formData.hpp, false)})</td>
                    </tr>

                    {/* Gross Profit */}
                    <tr className="bg-gray-100">
                        <td className="py-2 font-bold border-t border-b border-black">LABA KOTOR</td>
                        <td className="py-2 text-right font-bold border-t border-b border-black">{formatRupiah(labaKotor, false)}</td>
                    </tr>

                    {/* Operating Expenses */}
                    <tr>
                        <td className="py-2 pt-4 font-bold text-base" colSpan="2">BEBAN OPERASIONAL</td>
                    </tr>
                    <tr>
                        <td className="py-1 pl-4">Biaya Operasional</td>
                        <td className="py-1 text-right">({formatRupiah(formData.biayaOperasional, false)})</td>
                    </tr>
                    <tr>
                        <td className="py-2 font-bold border-t border-black">Total Beban Operasional</td>
                        <td className="py-2 text-right font-bold border-t border-black">({formatRupiah(formData.biayaOperasional, false)})</td>
                    </tr>

                    {/* Operating Profit */}
                    <tr>
                        <td className="py-2 font-bold">LABA OPERASIONAL</td>
                        <td className="py-2 text-right font-bold">{formatRupiah(labaKotor - formData.biayaOperasional, false)}</td>
                    </tr>

                    {/* Other Income/Expenses */}
                    <tr>
                        <td className="py-2 pt-4 font-bold text-base" colSpan="2">PENDAPATAN DAN BEBAN LAIN-LAIN</td>
                    </tr>
                    <tr>
                        <td className="py-1 pl-4">Pendapatan Lain-lain</td>
                        <td className="py-1 text-right">{formatRupiah(formData.pendapatanLain, false)}</td>
                    </tr>
                    <tr>
                        <td className="py-1 pl-4">Beban Lain-lain</td>
                        <td className="py-1 text-right">({formatRupiah(formData.bebanLain, false)})</td>
                    </tr>
                    <tr>
                        <td className="py-2 font-bold border-t border-black">Total Pendapatan/(Beban) Lain-lain</td>
                        <td className="py-2 text-right font-bold border-t border-black">{formatRupiah(formData.pendapatanLain - formData.bebanLain, false)}</td>
                    </tr>

                    {/* Net Profit */}
                    <tr className="bg-gray-200">
                        <td className="py-3 font-bold text-base border-t-2 border-b-2 border-black">LABA BERSIH</td>
                        <td className="py-3 text-right font-bold text-base border-t-2 border-b-2 border-black">{formatRupiah(labaBersih, false)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Signature Block */}
            <div className="mt-12 flex justify-end">
                <div className="text-center" style={{ minWidth: '200px' }}>
                    <p>{formData.kotaPenandatangan}, {formatDate(formData.tanggalLaporan)}</p>
                    <p className="mt-1">{formData.jabatan || 'Direktur'},</p>
                    <div className="mt-16 border-b border-black pb-1">
                        <p className="font-bold">{formData.namaPenandatangan || '___________________'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
