import { createContext, useContext, useState, useEffect } from 'react';

const FormContext = createContext();

// Default form data structure
const getDefaultFormData = () => ({
    // Step 1: Company Identity
    namaPerusahaan: '',
    npwp: '',
    alamat: '',
    kotaPenandatangan: '',
    tanggalLaporan: '',
    namaPenandatangan: '',
    jabatan: 'Direktur',
    tahunPajak: new Date().getFullYear().toString(),

    // Step 2: Revenue (12 months)
    peredaran: [
        { bulan: 'Januari', pendapatan: 0, pphFinal: 0 },
        { bulan: 'Februari', pendapatan: 0, pphFinal: 0 },
        { bulan: 'Maret', pendapatan: 0, pphFinal: 0 },
        { bulan: 'April', pendapatan: 0, pphFinal: 0 },
        { bulan: 'Mei', pendapatan: 0, pphFinal: 0 },
        { bulan: 'Juni', pendapatan: 0, pphFinal: 0 },
        { bulan: 'Juli', pendapatan: 0, pphFinal: 0 },
        { bulan: 'Agustus', pendapatan: 0, pphFinal: 0 },
        { bulan: 'September', pendapatan: 0, pphFinal: 0 },
        { bulan: 'Oktober', pendapatan: 0, pphFinal: 0 },
        { bulan: 'November', pendapatan: 0, pphFinal: 0 },
        { bulan: 'Desember', pendapatan: 0, pphFinal: 0 },
    ],

    // Step 3: Profit & Loss
    pendapatan: 0,
    hpp: 0,
    biayaOperasional: 0,
    pendapatanLain: 0,
    bebanLain: 0,

    // Step 4: Balance Sheet - Assets (Aktiva)
    // Current Assets (Aktiva Lancar)
    kas: 0,
    piutang: 0,
    persediaan: 0,
    biayaDibayarDimuka: 0,

    // Fixed Assets (Aktiva Tetap)
    kendaraan: 0,
    peralatan: 0,
    inventaris: 0,
    akumulasiPenyusutan: 0, // This should be a negative value

    // Liabilities (Kewajiban)
    utangUsaha: 0,
    utangLain: 0,

    // Equity (Modal)
    modalSaham: 0,
    labaDitahan: 0,
});

const STORAGE_KEY = 'siaplapor1771_formdata';

export function FormProvider({ children }) {
    const [formData, setFormData] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    return { ...getDefaultFormData(), ...JSON.parse(stored) };
                } catch (e) {
                    console.error('Error parsing stored form data:', e);
                }
            }
        }
        return getDefaultFormData();
    });

    // Save to localStorage whenever formData changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, [formData]);

    // Update a single field
    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Update a specific month in peredaran array
    const updatePeredaran = (index, field, value) => {
        setFormData(prev => {
            const newPeredaran = [...prev.peredaran];
            newPeredaran[index] = { ...newPeredaran[index], [field]: value };

            // Auto-calculate PPh Final (0.5%) if updating pendapatan
            if (field === 'pendapatan') {
                newPeredaran[index].pphFinal = Math.round(value * 0.005);
            }

            return { ...prev, peredaran: newPeredaran };
        });
    };

    // Calculate total peredaran usaha
    const getTotalPeredaran = () => {
        return formData.peredaran.reduce((sum, item) => sum + (item.pendapatan || 0), 0);
    };

    // Calculate total PPh Final
    const getTotalPphFinal = () => {
        return formData.peredaran.reduce((sum, item) => sum + (item.pphFinal || 0), 0);
    };

    // Calculate Laba Kotor (Gross Profit)
    const getLabaKotor = () => {
        const pendapatan = formData.pendapatan || getTotalPeredaran();
        return pendapatan - (formData.hpp || 0);
    };

    // Calculate Laba Bersih (Net Profit)
    const getLabaBersih = () => {
        const labaKotor = getLabaKotor();
        return labaKotor - (formData.biayaOperasional || 0) + (formData.pendapatanLain || 0) - (formData.bebanLain || 0);
    };

    // Calculate Total Aktiva (Total Assets)
    const getTotalAktivaLancar = () => {
        return (formData.kas || 0) + (formData.piutang || 0) + (formData.persediaan || 0) + (formData.biayaDibayarDimuka || 0);
    };

    const getTotalAktivaTetap = () => {
        return (formData.kendaraan || 0) + (formData.peralatan || 0) + (formData.inventaris || 0) - Math.abs(formData.akumulasiPenyusutan || 0);
    };

    const getTotalAktiva = () => {
        return getTotalAktivaLancar() + getTotalAktivaTetap();
    };

    // Calculate Total Kewajiban (Total Liabilities)
    const getTotalKewajiban = () => {
        return (formData.utangUsaha || 0) + (formData.utangLain || 0);
    };

    // Calculate Total Modal (Total Equity)
    const getTotalModal = () => {
        return (formData.modalSaham || 0) + (formData.labaDitahan || 0) + getLabaBersih();
    };

    // Check if balance sheet is balanced
    const isBalanced = () => {
        const totalAktiva = getTotalAktiva();
        const totalPasiva = getTotalKewajiban() + getTotalModal();
        return Math.abs(totalAktiva - totalPasiva) < 1; // Allow for rounding errors
    };

    // Reset form to defaults
    const resetForm = () => {
        setFormData(getDefaultFormData());
        localStorage.removeItem(STORAGE_KEY);
    };

    const value = {
        formData,
        setFormData,
        updateField,
        updatePeredaran,
        getTotalPeredaran,
        getTotalPphFinal,
        getLabaKotor,
        getLabaBersih,
        getTotalAktivaLancar,
        getTotalAktivaTetap,
        getTotalAktiva,
        getTotalKewajiban,
        getTotalModal,
        isBalanced,
        resetForm,
    };

    return (
        <FormContext.Provider value={value}>
            {children}
        </FormContext.Provider>
    );
}

export function useFormData() {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormData must be used within a FormProvider');
    }
    return context;
}
