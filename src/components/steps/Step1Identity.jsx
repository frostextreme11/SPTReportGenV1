import { Building2, MapPin, User, Calendar, FileSignature } from 'lucide-react';
import { motion } from 'framer-motion';
import InputField from '../ui/InputField';
import { useFormData } from '../../context/FormContext';
import { FadeIn, StaggerContainer, StaggerItem } from '../ui/AnimatedStep';

export default function Step1Identity() {
    const { formData, updateField } = useFormData();

    const formatNPWP = (value) => {
        // Remove non-digits
        const digits = value.replace(/\D/g, '').slice(0, 15);

        // Format as XX.XXX.XXX.X-XXX.XXX
        let formatted = '';
        for (let i = 0; i < digits.length; i++) {
            if (i === 2 || i === 5 || i === 8) formatted += '.';
            if (i === 9) formatted += '-';
            if (i === 12) formatted += '.';
            formatted += digits[i];
        }
        return formatted;
    };

    const handleNPWPChange = (value) => {
        updateField('npwp', formatNPWP(value));
    };

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <FadeIn>
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="inline-flex p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30 mb-4"
                    >
                        <Building2 className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Identitas Perusahaan
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Masukkan informasi dasar perusahaan Anda
                    </p>
                </div>
            </FadeIn>

            {/* Form Fields */}
            <StaggerContainer className="space-y-5">
                {/* Company Name */}
                <StaggerItem>
                    <InputField
                        id="namaPerusahaan"
                        label="Nama Perusahaan"
                        value={formData.namaPerusahaan}
                        onChange={(value) => updateField('namaPerusahaan', value)}
                        placeholder="CV. Contoh Usaha Mandiri"
                        required
                        helpTitle="Nama Perusahaan"
                        helpContent="Masukkan nama perusahaan sesuai dengan akta pendirian atau izin usaha yang terdaftar."
                    />
                </StaggerItem>

                {/* NPWP */}
                <StaggerItem>
                    <InputField
                        id="npwp"
                        label="NPWP"
                        value={formData.npwp}
                        onChange={handleNPWPChange}
                        placeholder="00.000.000.0-000.000"
                        required
                        helpTitle="NPWP"
                        helpContent="Nomor Pokok Wajib Pajak perusahaan Anda. Format: XX.XXX.XXX.X-XXX.XXX"
                    />
                </StaggerItem>

                {/* Address */}
                <StaggerItem>
                    <InputField
                        id="alamat"
                        label="Alamat Lengkap"
                        value={formData.alamat}
                        onChange={(value) => updateField('alamat', value)}
                        placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan"
                        multiline
                        rows={3}
                        required
                        helpTitle="Alamat Lengkap"
                        helpContent="Masukkan alamat lengkap perusahaan termasuk nama jalan, nomor, kelurahan, kecamatan, dan kota."
                    />
                </StaggerItem>

                {/* Divider */}
                <div className="border-t border-slate-200 dark:border-slate-700 my-6" />

                {/* Signatory Section */}
                <StaggerItem>
                    <div className="flex items-center gap-2 mb-4">
                        <FileSignature className="w-5 h-5 text-primary-500" />
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            Informasi Penandatangan
                        </h3>
                    </div>
                </StaggerItem>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Tax Year */}
                    <StaggerItem>
                        <InputField
                            id="tahunPajak"
                            label="Tahun Pajak"
                            type="number"
                            value={formData.tahunPajak}
                            onChange={(value) => updateField('tahunPajak', value)}
                            placeholder="2025"
                            required
                            helpTitle="Tahun Pajak"
                            helpContent="Tahun pajak untuk laporan keuangan ini."
                        />
                    </StaggerItem>

                    {/* Signing City */}
                    <StaggerItem>
                        <InputField
                            id="kotaPenandatangan"
                            label="Kota Penandatangan"
                            value={formData.kotaPenandatangan}
                            onChange={(value) => updateField('kotaPenandatangan', value)}
                            placeholder="Jakarta"
                            required
                            helpTitle="Kota Penandatangan"
                            helpContent="Kota tempat laporan ini ditandatangani."
                        />
                    </StaggerItem>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Report Date */}
                    <StaggerItem>
                        <InputField
                            id="tanggalLaporan"
                            label="Tanggal Laporan"
                            type="date"
                            value={formData.tanggalLaporan}
                            onChange={(value) => updateField('tanggalLaporan', value)}
                            required
                            helpTitle="Tanggal Laporan"
                            helpContent="Tanggal penandatanganan laporan keuangan."
                        />
                    </StaggerItem>

                    {/* Position */}
                    <StaggerItem>
                        <InputField
                            id="jabatan"
                            label="Jabatan"
                            value={formData.jabatan}
                            onChange={(value) => updateField('jabatan', value)}
                            placeholder="Direktur"
                            helpTitle="Jabatan"
                            helpContent="Jabatan penandatangan laporan."
                        />
                    </StaggerItem>
                </div>

                {/* Signatory Name */}
                <StaggerItem>
                    <InputField
                        id="namaPenandatangan"
                        label="Nama Penandatangan"
                        value={formData.namaPenandatangan}
                        onChange={(value) => updateField('namaPenandatangan', value)}
                        placeholder="Nama Direktur/Pemilik"
                        required
                        helpTitle="Nama Penandatangan"
                        helpContent="Nama lengkap direktur atau pemilik yang menandatangani laporan keuangan."
                    />
                </StaggerItem>
            </StaggerContainer>
        </div>
    );
}
