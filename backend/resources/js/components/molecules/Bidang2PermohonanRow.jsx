import { Eye } from 'lucide-react';
import StatusPill from '../atoms/StatusPill';
import { formatRupiah, formatTanggal, labelStatusPermohonan } from '../../utils/formatPermohonan';

export default function Bidang2PermohonanRow({ permohonan, onDetail }) {
    const { label, variant } = labelStatusPermohonan(permohonan.status);
    const unitName = permohonan.unit?.nama || permohonan.ringkasan_tujuan || 'Unit Kampus';

    const handleDetailClick = (e) => {
        e.preventDefault();
        if (onDetail) {
            onDetail(permohonan);
        }
    };

    return (
        <tr className="border-b border-[#E4EBE8] last:border-0 hover:bg-[#F9FBFA] transition-colors">
            <td className="py-4 px-4 text-xs font-semibold text-[#0E7C5A] whitespace-nowrap">
                <button
                    type="button"
                    onClick={handleDetailClick}
                    className="text-left font-semibold text-[#0E7C5A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded cursor-pointer"
                    aria-label={`Buka detail permohonan ${permohonan.nomor_surat}`}
                >
                    {permohonan.nomor_surat}
                </button>
            </td>
            <td className="py-4 px-4 max-w-xs">
                <p className="text-xs font-semibold text-[#14201C] truncate" title={permohonan.judul}>
                    {permohonan.judul}
                </p>
                <p className="text-[11px] text-[#5F6F6A] mt-0.5 truncate">
                    {unitName}
                </p>
            </td>
            <td className="py-4 px-4 text-xs text-[#5F6F6A] whitespace-nowrap">
                {formatTanggal(permohonan.created_at)}
            </td>
            <td className="py-4 px-4 text-xs font-semibold text-[#14201C] whitespace-nowrap">
                {formatRupiah(permohonan.estimasi_anggaran)}
            </td>
            <td className="py-4 px-4 whitespace-nowrap">
                <StatusPill status={variant} label={label} />
            </td>
            <td className="py-4 px-4 text-center whitespace-nowrap">
                <button
                    type="button"
                    onClick={handleDetailClick}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#E4EBE8] text-[#0E7C5A] hover:bg-[#E8F5F1] hover:border-[#0E7C5A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
                    aria-label={`Lihat detail permohonan ${permohonan.nomor_surat}`}
                    title="Lihat Detail Permohonan"
                >
                    <Eye className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
}
