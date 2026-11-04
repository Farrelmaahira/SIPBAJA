import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, FileText } from 'lucide-react';
import StatusPill from '../atoms/StatusPill';
import RowActionMenu from './RowActionMenu';
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters';
import type { PermohonanTerbaruItem } from '../../types/perencanaan';

export interface PerencanaanPermohonanTerbaruTableProps {
  items: PermohonanTerbaruItem[];
  isLoading?: boolean;
}

export const PerencanaanPermohonanTerbaruTable: FC<PerencanaanPermohonanTerbaruTableProps> = ({
  items,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
        <div>
          <h3 className="text-base font-bold text-[#14201C]">Permohonan Masuk Terbaru</h3>
          <p className="text-xs text-[#8A9A95] mt-0.5">
            {items.length} permohonan aktif • diperbarui hari ini
          </p>
        </div>

        <Link
          to="/perencanaan/pengajuan"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E7C5A] hover:underline cursor-pointer"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#EEF3F0] text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider">
              <th className="py-3.5 px-4 rounded-l-xl">No Permohonan</th>
              <th className="py-3.5 px-4">Judul Pengadaan</th>
              <th className="py-3.5 px-4">Tanggal</th>
              <th className="py-3.5 px-4">Nilai Pengajuan</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center rounded-r-xl">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F2] text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#8A9A95]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-[#0E7C5A] animate-spin" />
                    <p className="text-xs text-[#5F6F6A]">Memuat permohonan masuk terbaru...</p>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#8A9A95]">
                  <div className="w-10 h-10 rounded-xl bg-[#F4F7F5] text-[#8A9A95] flex items-center justify-center mx-auto mb-2">
                    <FileText className="w-5 h-5" />
                  </div>
                  Belum ada permohonan masuk.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-[#F9FBFA] transition-colors">
                  <td className="py-4 px-4 font-bold text-[#0E7C5A]">
                    <Link
                      to={`/perencanaan/pengajuan/${item.id}`}
                      className="hover:underline"
                    >
                      {item.nomor_surat || '-'}
                    </Link>
                  </td>
                  <td className="py-4 px-4 font-bold text-[#14201C]">
                    {item.judul || '-'}
                  </td>
                  <td className="py-4 px-4 text-[#5F6F6A]">
                    {formatTanggalIndo(item.created_at)}
                  </td>
                  <td className="py-4 px-4 font-bold text-[#14201C]">
                    {formatRupiah(item.estimasi_anggaran)}
                  </td>
                  <td className="py-4 px-4">
                    <StatusPill status={item.status || 'diajukan'} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <RowActionMenu
                      item={item}
                      viewHref={`/perencanaan/pengajuan/${item.id}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerencanaanPermohonanTerbaruTable;
