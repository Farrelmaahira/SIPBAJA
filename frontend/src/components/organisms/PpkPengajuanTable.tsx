import type { FC } from 'react';
import { Link } from 'react-router-dom';
import StatusPill from '../atoms/StatusPill';
import RowActionMenu from './RowActionMenu';
import { formatRupiah, formatTanggal } from '../../utils/formatters';
import type { PpkTableRow } from '../../types/ppk';

export interface PpkPengajuanTableProps {
  rows: PpkTableRow[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const PpkPengajuanTable: FC<PpkPengajuanTableProps> = ({
  rows,
  isLoading = false,
  emptyMessage = 'Belum ada pengajuan masuk.',
}) => {
  const getDetailHref = (row: PpkTableRow): string => {
    if (row.sourceType === 'permohonan') {
      return `/ppk/pengajuan/${row.id}/review?type=permohonan`;
    }
    if (row.status === 'menunggu_persetujuan' || row.status === 'menunggu_review') {
      return `/ppk/pengajuan/${row.id}/review`;
    }
    if (row.status === 'review_pembayaran' || row.status === 'diteruskan') {
      return `/ppk/pengajuan/${row.id}/pembayaran`;
    }
    return `/ppk/pengajuan/${row.id}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#EEF3F0] border-b border-[#E2EAE6] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
            <th className="py-3.5 px-6">NOMOR SURAT</th>
            <th className="py-3.5 px-4">JUDUL PENGADAAN</th>
            <th className="py-3.5 px-4">UNIT PEMOHON</th>
            <th className="py-3.5 px-4">TANGGAL</th>
            <th className="py-3.5 px-4">NOMINAL</th>
            <th className="py-3.5 px-4">STATUS</th>
            <th className="py-3.5 px-6 text-center">AKSI</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0F4F2] text-xs">
          {isLoading ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-[#8A9A95]">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-[#5F6F6A]">Memuat daftar pengajuan PPK...</p>
                </div>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-[#8A9A95]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={`${row.sourceType ?? 'pengadaan'}-${row.id}`} className="hover:bg-[#FAFDFB] transition">
                <td className="py-4 px-6 font-bold text-[#0E7C5A]">
                  <Link to={getDetailHref(row)} className="hover:underline">
                    {row.nomor_surat || '-'}
                  </Link>
                </td>
                <td className="py-4 px-4 font-bold text-[#14201C]">{row.judul || '-'}</td>
                <td className="py-4 px-4 text-[#5F6F6A]">{row.unit || '-'}</td>
                <td className="py-4 px-4 text-[#5F6F6A]">{formatTanggal(row.tanggal)}</td>
                <td className="py-4 px-4 font-bold text-[#14201C]">{formatRupiah(row.nominal)}</td>
                <td className="py-4 px-4">
                  <StatusPill status={row.status} />
                </td>
                <td className="py-4 px-6 text-center">
                  <RowActionMenu item={row} viewHref={getDetailHref(row)} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PpkPengajuanTable;
