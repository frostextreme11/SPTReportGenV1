import { formatRupiah } from '../../utils/currency';

export default function PeredaranPage({ formData, calculations }) {
    const { totalPeredaran, totalPphFinal } = calculations;

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
                <p className="text-sm">NPWP: {formData.npwp || '-'}</p>
                <p className="text-sm">{formData.alamat || '-'}</p>
                <h2 className="text-base font-bold uppercase mt-4">DAFTAR PEREDARAN USAHA</h2>
                <p className="text-sm mt-1">Tahun Pajak {formData.tahunPajak}</p>
            </div>

            {/* Revenue Table */}
            <table className="w-full border-collapse border border-black text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-2 text-center w-12">No</th>
                        <th className="border border-black p-2 text-left">Bulan</th>
                        <th className="border border-black p-2 text-right">Peredaran Usaha (Rp)</th>
                        <th className="border border-black p-2 text-right">PPh Final 0.5% (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    {formData.peredaran.map((item, index) => (
                        <tr key={item.bulan} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-black p-2 text-center">{index + 1}</td>
                            <td className="border border-black p-2">{item.bulan}</td>
                            <td className="border border-black p-2 text-right">{formatRupiah(item.pendapatan, false)}</td>
                            <td className="border border-black p-2 text-right">{formatRupiah(item.pphFinal, false)}</td>
                        </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="bg-gray-200 font-bold">
                        <td className="border border-black p-2 text-center" colSpan="2">TOTAL</td>
                        <td className="border border-black p-2 text-right">{formatRupiah(totalPeredaran, false)}</td>
                        <td className="border border-black p-2 text-right">{formatRupiah(totalPphFinal, false)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Notes */}
            <div className="mt-6 text-sm">
                <p className="font-bold mb-2">Catatan:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>PPh Final dihitung berdasarkan PP 23 Tahun 2018 (tarif 0.5% dari peredaran bruto)</li>
                    <li>Berlaku untuk Wajib Pajak dengan peredaran bruto &le; Rp 4.800.000.000 per tahun</li>
                </ul>
            </div>

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
