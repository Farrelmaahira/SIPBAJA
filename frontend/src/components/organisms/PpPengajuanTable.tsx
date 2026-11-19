import type { FC } from 'react';
import { Link } from 'react-router-dom';
import StatusPill from '../atoms/StatusPill';
import RowActionMenu from './RowActionMenu';
import { formatRupiah, formatTanggal } from '../../utils/formatters';
import type { PpPengadaanItem } from '../../types/pp';

export interface PpPengajuanTableProps {
  items: PpPengadaanItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const PpPengajuanTable: FC<PpPengajuanTableProps> = ({
  items,
  isLoading = false,
  emptyMessage = 'Tidak ada pengajuan ditemukan.',
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#EEF3F0] text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider">
            <th className="py-3.5 px-4 rounded-l-xl">No Permohonan</th>
            <th className="py-3.5 px-4">Judul Pengadaan</th>
            <th className="py-3.5 px-4">Tanggal</th>
            <th className="py-3.5 px-4">Nilai Pengadaan</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-center rounded-r-xl">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0F4F2] text-xs">
          {isLoading ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-[#8A9A95]">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-[#5F6F6A]">Memuat daftar pengajuan...</p>
                </div>
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-[#8A9A95]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            items.map((item) => {
              const permohonan = item.permohonan || item.Permohonan;
              const unit = permohonan?.unit || permohonan?.Unit;
              const targetHref = `/pp/pengadaan/${item.id}`;

              return (
                <tr key={item.id} className="hover:bg-[#F9FBFA] transition-colors">
                  <td className="py-4 px-4 font-bold text-[#0E7C5A]">
                    <Link to={targetHref} className="hover:underline">
                      {permohonan?.nomor_surat || '-'}
                    </Link>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-[#14201C]">{permohonan?.judul || '-'}</p>
                    <p className="text-[11px] text-[#8A9A95] mt-0.5">{unit?.nama || '-'}</p>
                  </td>
                  <td className="py-4 px-4 text-[#5F6F6A]">{formatTanggal(item.created_at)}</td>
                  <td className="py-4 px-4 font-bold text-[#14201C]">{formatRupiah(item.nominal)}</td>
                  <td className="py-4 px-4">
                    <StatusPill status={item.status} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <RowActionMenu item={item} viewHref={targetHref} />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PpPengajuanTable;
