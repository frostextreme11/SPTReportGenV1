import { formatRupiah } from '../../utils/currency';

export default function NeracaPage({ formData, calculations }) {
    const {
        totalAktivaLancar,
        totalAktivaTetap,
        totalAktiva,
        totalKewajiban,
        totalModal,
        labaBersih
    } = calculations;

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
                <h2 className="text-base font-bold uppercase mt-1">NERACA</h2>
                <p className="text-sm mt-1">Per 31 Desember {formData.tahunPajak}</p>
            </div>

            {/* Balance Sheet Table */}
            <table className="w-full border-collapse border border-black text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-2 text-left w-1/2">AKTIVA</th>
                        <th className="border border-black p-2 text-right w-1/4">Rp</th>
                        <th className="border border-black p-2 text-left w-1/2">KEWAJIBAN DAN MODAL</th>
                        <th className="border border-black p-2 text-right w-1/4">Rp</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Row 1: Headers */}
                    <tr>
                        <td className="border border-black p-2 font-bold bg-gray-50">AKTIVA LANCAR</td>
                        <td className="border border-black p-2"></td>
                        <td className="border border-black p-2 font-bold bg-gray-50">KEWAJIBAN</td>
                        <td className="border border-black p-2"></td>
                    </tr>

                    {/* Row 2 */}
                    <tr>
                        <td className="border border-black p-2 pl-4">Kas dan Setara Kas</td>
                        <td className="border border-black p-2 text-right">{formatRupiah(formData.kas, false)}</td>
                        <td className="border border-black p-2 pl-4">Utang Usaha</td>
                        <td className="border border-black p-2 text-right">{formatRupiah(formData.utangUsaha, false)}</td>
                    </tr>

                    {/* Row 3 */}
                    <tr>
                        <td className="border border-black p-2 pl-4">Piutang Usaha</td>
                        <td className="border border-black p-2 text-right">{formatRupiah(formData.piutang, false)}</td>
                        <td className="border border-black p-2 pl-4">Utang Lain-lain</td>
                        <td className="border border-black p-2 text-right">{formatRupiah(formData.utangLain, false)}</td>
                    </tr>

                    {/* Row 4 */}
                    <tr>
                        <td className="border border-black p-2 pl-4">Persediaan</td>
                        <td className="border border-black p-2 text-right">{formatRupiah(formData.persediaan, false)}</td>
                        <td className="border border-black p-2 font-bold bg-gray-50">Total Kewajiban</td>
                        <td className="border border-black p-2 text-right font-bold bg-gray-50">{formatRupiah(totalKewajiban, false)}</td>
                    </tr>

                    {/* Row 5 */}
                    <tr>
                        <td className="border border-black p-2 pl-4">Biaya Dibayar Dimuka</td>
                        <td className="border border-black p-2 text-right">{formatRupiah(formData.biayaDibayarDimuka, false)}</td>
                        <td className="border border-black p-2"></td>
                        <td className="border border-black p-2"></td>
                    </tr>

                    {/* Row 6: Subtotal Aktiva Lancar */}
                    <tr>
                        <td className="border border-black p-2 font-bold bg-gray-50">Total Aktiva Lancar</td>
                        <td className="border border-black p-2 text-right font-bold bg-gray-50">{formatRupiah(totalAktivaLancar, false)}</td>
                        <td className="border border-black p-2 font-bold bg-gray-50">MODAL</td>
                        <td className="border border-black p-2"></td>
                    </tr>

                    {/* Row 7: Aktiva Tetap Header */}
                    <tr>
                        <td className="border border-black p-2 font-bold bg-gray-50">AKTIVA TETAP</td>
                        <td className="border border-black p-2"></td>
                        <td className="border border-black p-2 pl-4">Modal Saham</td>
                        <td className="border border-black p-2 text-right">{formatRupiah(formData.modalSaham, false)}</td>
                    </tr>

                    {/* Row 8 */}
                    <tr>
                        <td className="border border-black p-2 pl-4">Kendaraan</td>
                        <td className="border border-black p-2 text-right">{formatRupiah(formData.kendaraan, false)}</td>
                        <td className="border border-black p-2 pl-4">Laba Ditahan</td>
                        <td className="border border-black p-2 text-right">{formatRupiah(formData.labaDitahan, false)}</td>
                    </tr>

                    {/* Row 9 */}
                    <tr>
                        <td className="border border-black p-2 pl-4">Peralatan</td>
                        <td className="border border-black p-2 text-right">{formatRupiah(formData.peralatan, false)}</td>
                        <td className="border border-black p-2 pl-4">Laba Tahun Berjalan</td>
                        <td className="border border-black p-2 text-right">{formatRupiah(labaBersih, false)}</td>
                    </tr>

                    {/* Row 10 */}
                    <tr>
                        <td className="border border-black p-2 pl-4">Inventaris</td>
                        <td className="border border-black p-2 text-right">{formatRupiah(formData.inventaris, false)}</td>
                        <td className="border border-black p-2 font-bold bg-gray-50">Total Modal</td>
                        <td className="border border-black p-2 text-right font-bold bg-gray-50">{formatRupiah(totalModal, false)}</td>
                    </tr>

                    {/* Row 11: Akumulasi Penyusutan */}
                    <tr>
                        <td className="border border-black p-2 pl-4">Akumulasi Penyusutan</td>
                        <td className="border border-black p-2 text-right">({formatRupiah(Math.abs(formData.akumulasiPenyusutan), false)})</td>
                        <td className="border border-black p-2"></td>
                        <td className="border border-black p-2"></td>
                    </tr>

                    {/* Row 12: Subtotal Aktiva Tetap */}
                    <tr>
                        <td className="border border-black p-2 font-bold bg-gray-50">Total Aktiva Tetap</td>
                        <td className="border border-black p-2 text-right font-bold bg-gray-50">{formatRupiah(totalAktivaTetap, false)}</td>
                        <td className="border border-black p-2"></td>
                        <td className="border border-black p-2"></td>
                    </tr>

                    {/* Total Row */}
                    <tr className="bg-gray-200">
                        <td className="border border-black p-2 font-bold">TOTAL AKTIVA</td>
                        <td className="border border-black p-2 text-right font-bold">{formatRupiah(totalAktiva, false)}</td>
                        <td className="border border-black p-2 font-bold">TOTAL KEWAJIBAN + MODAL</td>
                        <td className="border border-black p-2 text-right font-bold">{formatRupiah(totalKewajiban + totalModal, false)}</td>
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
