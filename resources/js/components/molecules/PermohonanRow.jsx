import { Link } from '@inertiajs/react';
import { MoreVertical } from 'lucide-react';
import StatusPill from '../atoms/StatusPill';
import { formatRupiah, formatTanggal, labelStatusPermohonan } from '../../utils/formatPermohonan';

export default function PermohonanRow({ nomorSurat, judul, tanggal, nilaiPengajuan, status, onAksi }) {
    const { label, variant } = labelStatusPermohonan(status);

    return (
        <tr className="border-b border-[#E4EBE8] last:border-0 hover:bg-[#F9FBFA] transition-colors">
            <td className="py-3.5 px-4 text-sm font-semibold text-[#0E7C5A] whitespace-nowrap">
                {/*
                 * TODO: Implement permohonan.show route.
                 * Link dibuat tapi mengarah ke '#' sampai route tersedia.
                 */}
                <Link
                    href="#"
                    className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded"
                    aria-label={`Buka detail permohonan ${nomorSurat}`}
                >
                    {nomorSurat}
                </Link>
            </td>
            <td className="py-3.5 px-4 text-sm text-[#14201C]">
                {judul}
            </td>
            <td className="py-3.5 px-4 text-sm text-[#5F6F6A] whitespace-nowrap">
                {formatTanggal(tanggal)}
            </td>
            <td className="py-3.5 px-4 text-sm font-medium text-[#14201C] whitespace-nowrap">
                {formatRupiah(nilaiPengajuan)}
            </td>
            <td className="py-3.5 px-4">
                <StatusPill status={variant} label={label} />
            </td>
            <td className="py-3.5 px-4 text-right">
                <button
                    type="button"
                    onClick={onAksi}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#5F6F6A] hover:bg-[#EEF5F2] hover:text-[#14201C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A]"
                    aria-label={`Opsi permohonan ${nomorSurat}`}
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
}
