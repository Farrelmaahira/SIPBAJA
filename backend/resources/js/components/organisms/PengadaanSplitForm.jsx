import React from 'react';
import { useForm } from '@inertiajs/react';
import { Plus, Info, AlertCircle, Send } from 'lucide-react';
import PengadaanSplitRow from '../molecules/PengadaanSplitRow';
import { formatRupiah } from '../../utils/formatters';

export default function PengadaanSplitForm({
    permohonanId,
    estimasiAnggaran = 0,
    sisaAnggaran = 0,
    availableMak = [],
    referenceData = {},
}) {
    const defaultItem = () => ({
        permohonan_mak_id: '',
        jenis_id: referenceData.jenis?.[0]?.id ? String(referenceData.jenis[0].id) : '',
        metode_id: referenceData.metode?.[0]?.id ? String(referenceData.metode[0].id) : '',
        nominal: '',
        level_id: '',
        isLevelOverridden: false,
        dokumen: null,
    });

    const { data, setData, post, processing, errors } = useForm({
        items: [
            // Jika ada MAK, berikan MAK pertama sebagai default untuk paket 1 agar langsung terisi seperti mockup
            {
                ...defaultItem(),
                permohonan_mak_id: availableMak[0]?.permohonan_mak_id
                    ? String(availableMak[0].permohonan_mak_id)
                    : '',
            },
        ],
    });

    const handleItemChange = (index, fieldOrUpdates, value) => {
        setData((prev) => {
            const nextItems = [...prev.items];
            if (typeof fieldOrUpdates === 'object' && fieldOrUpdates !== null) {
                nextItems[index] = {
                    ...nextItems[index],
                    ...fieldOrUpdates,
                };
            } else {
                nextItems[index] = {
                    ...nextItems[index],
                    [fieldOrUpdates]: value,
                };
            }
            return {
                ...prev,
                items: nextItems,
            };
        });
    };

    const handleAddItem = () => {
        setData((prev) => ({
            ...prev,
            items: [...prev.items, defaultItem()],
        }));
    };

    const handleRemoveItem = (index) => {
        setData((prev) => {
            if (prev.items.length <= 1) return prev;
            return {
                ...prev,
                items: prev.items.filter((_, i) => i !== index),
            };
        });
    };

    const handleReset = () => {
        if (confirm('Apakah Anda yakin ingin membatalkan dan mereset form dokumen pengadaan?')) {
            setData((prev) => ({
                ...prev,
                items: [
                    {
                        ...defaultItem(),
                        permohonan_mak_id: availableMak[0]?.permohonan_mak_id
                            ? String(availableMak[0].permohonan_mak_id)
                            : '',
                    },
                ],
            }));
        }
    };

    const formTotalNominal = data.items.reduce(
        (sum, item) => sum + (parseFloat(item.nominal) || 0),
        0
    );

    const sisaAnggaranSetelahForm = sisaAnggaran - formTotalNominal;
    const isBudgetExceeded = sisaAnggaranSetelahForm < 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isBudgetExceeded) return;

        post(`/ppbj/permohonan/${permohonanId}/pengadaan/draft`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setData('items', [
                    {
                        ...defaultItem(),
                        permohonan_mak_id: availableMak[0]?.permohonan_mak_id
                            ? String(availableMak[0].permohonan_mak_id)
                            : '',
                    },
                ]);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Realtime Budget Bar Card */}
            <div className="bg-[#F8FAF9] rounded-2xl border border-[#E4EBE8] p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <span className="block text-xs font-semibold text-[#5F6F6A] uppercase tracking-wider mb-1">
                            Pagu Anggaran Permohonan
                        </span>
                        <p className="text-lg font-bold text-[#14201C] tabular-nums">
                            {formatRupiah(estimasiAnggaran)}
                        </p>
                    </div>

                    <div className="h-8 w-[1px] bg-[#E4EBE8] hidden sm:block" />

                    <div>
                        <span className="block text-xs font-semibold text-[#5F6F6A] uppercase tracking-wider mb-1">
                            Total Paket yang Sedang Disusun
                        </span>
                        <p className="text-lg font-bold text-[#14201C] tabular-nums">
                            {formatRupiah(formTotalNominal)}
                        </p>
                    </div>

                    <div className="h-8 w-[1px] bg-[#E4EBE8] hidden sm:block" />

                    <div>
                        <span className="block text-xs font-semibold text-[#5F6F6A] uppercase tracking-wider mb-1">
                            Sisa Anggaran Permohonan
                        </span>
                        <p
                            className={`text-lg font-bold tabular-nums ${
                                isBudgetExceeded ? 'text-[#D92D20]' : 'text-[#0E7C5A]'
                            }`}
                        >
                            {formatRupiah(sisaAnggaranSetelahForm)}
                        </p>
                    </div>
                </div>

                {isBudgetExceeded && (
                    <div className="mt-3.5 p-3 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] flex items-center gap-2.5 text-xs font-medium text-[#B42318]">
                        <AlertCircle className="w-4 h-4 shrink-0 text-[#D92D20]" />
                        <span>
                            Total akumulasi nominal paket pengadaan melebihi pagu estimasi anggaran permohonan. Silakan sesuaikan kembali nominal paket.
                        </span>
                    </div>
                )}

                {errors.nominal && (
                    <div className="mt-3.5 p-3 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] text-xs font-medium text-[#B42318]">
                        {errors.nominal}
                    </div>
                )}
                {errors.permohonan && (
                    <div className="mt-3.5 p-3 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] text-xs font-medium text-[#B42318]">
                        {errors.permohonan}
                    </div>
                )}
            </div>

            {/* Grid Kartu Dokumen Pengadaan (2 Kolom di Layar Lebar) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.items.map((item, index) => (
                    <PengadaanSplitRow
                        key={index}
                        index={index}
                        item={item}
                        availableMak={availableMak}
                        referenceData={referenceData}
                        onChange={handleItemChange}
                        onRemove={handleRemoveItem}
                        canRemove={data.items.length > 1}
                        errors={errors}
                    />
                ))}
            </div>

            {/* Tombol Tambah Dokumen Pengadaan (Dashed Border Hijau Lebar Penuh) */}
            <button
                type="button"
                onClick={handleAddItem}
                disabled={isBudgetExceeded}
                className="w-full min-h-[52px] py-3.5 rounded-2xl border-2 border-dashed border-[#0E7C5A] bg-[#F7FBF9] text-[#0E7C5A] hover:bg-[#EBF7F2] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>Tambah Dokumen Pengadaan</span>
            </button>

            {/* Bar Aksi Bawah: Info & Tombol Batal / Kirim Pengadaan */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-[#F0F4F2]">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#5F6F6A]">
                    <Info className="w-4 h-4 shrink-0 text-[#8A9A95]" />
                    <span>Pastikan setiap dokumen sudah memiliki MAK dan penanggung jawab sebelum dikirim.</span>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-5 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-sm font-semibold text-[#344054] hover:bg-gray-50 transition-colors shadow-xs"
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        disabled={processing || isBudgetExceeded || formTotalNominal <= 0}
                        className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0E7C5A] text-white hover:bg-[#0B664A] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                        <span>{processing ? 'Menyimpan...' : 'Kirim Pengadaan'}</span>
                    </button>
                </div>
            </div>
        </form>
    );
}
