import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, PackageOpen } from 'lucide-react';
import StatusPill from '../../atoms/StatusPill';
import RowActionMenu from '../RowActionMenu';
import { formatRupiah } from '../../../utils/formatters';
import type { KeuanganPengadaanItem } from '../../../types/keuangan';

export interface KeuanganPengadaanMenungguTableProps {
  items: KeuanganPengadaanItem[];
  isLoading?: boolean;
}

export const KeuanganPengadaanMenungguTable: FC<KeuanganPengadaanMenungguTableProps> = ({
  items,
  isLoading = false,
}) => {
  return (
    <section
      className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]"
      aria-labelledby="pengadaan-menunggu-heading"
    >
      {/* Header Tabel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
        <div>
          <h2
            id="pengadaan-menunggu-heading"
            className="text-base sm:text-lg font-bold text-[#14201C] tracking-tight"
          >
            Pengadaan Menunggu Pembayaran
          </h2>
          <p className="text-xs text-[#8A9A95] mt-0.5 font-medium">
            {items.length} pengadaan &bull; diperbarui hari ini
          </p>
        </div>

        <Link
          to="/keuangan/pengadaan"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7C5A] hover:text-[#0A5C43] hover:underline cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded px-1"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Kontainer Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#EEF3F0] text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider">
              <th className="py-3.5 px-4 rounded-l-xl">NO PENGADAAN</th>
              <th className="py-3.5 px-4">JUDUL PENGADAAN</th>
              <th className="py-3.5 px-4">DIAJUKAN OLEH</th>
              <th className="py-3.5 px-4">NILAI PENGAJUAN</th>
              <th className="py-3.5 px-4">STATUS</th>
              <th className="py-3.5 px-4 text-center rounded-r-xl">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F2] text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#8A9A95]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-[#0E7C5A] animate-spin" />
                    <p className="text-xs text-[#5F6F6A] font-medium">
                      Memuat daftar pengadaan menunggu pembayaran...
                    </p>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#8A9A95]">
                  <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center">
                      <PackageOpen className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-[#14201C]">
                      Belum Ada Pengadaan Menunggu Pembayaran
                    </p>
                    <p className="text-xs text-[#5F6F6A] leading-relaxed">
                      Pengadaan yang telah disetujui untuk proses pembayaran akan muncul di sini.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#F9FBFA] transition-colors group"
                >
                  <td className="py-4 px-4 align-middle">
                    <span className="font-bold text-xs text-[#0E7C5A] block tracking-tight">
                      {item.nomor_pengadaan}
                    </span>
                    <span className="text-[11px] text-[#8A9A95] font-medium block mt-0.5">
                      {item.nomor_permohonan}
                    </span>
                  </td>
                  <td className="py-4 px-4 align-middle font-semibold text-[#14201C] max-w-xs truncate">
                    {item.judul}
                  </td>
                  <td className="py-4 px-4 align-middle text-[#5F6F6A] font-medium">
                    {item.diajukan_oleh}
                  </td>
                  <td className="py-4 px-4 align-middle font-semibold text-[#14201C]">
                    {formatRupiah(item.nilai_pengajuan)}
                  </td>
                  <td className="py-4 px-4 align-middle">
                    <StatusPill
                      status={item.status}
                      label={item.status_label || 'Menunggu Input'}
                    />
                  </td>
                  <td className="py-4 px-4 align-middle text-center">
                    <RowActionMenu
                      item={item}
                      viewHref={`/keuangan/pengadaan/${item.id}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default KeuanganPengadaanMenungguTable;
