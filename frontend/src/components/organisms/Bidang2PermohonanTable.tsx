import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList } from 'lucide-react';
import StatusPill from '../atoms/StatusPill';
import RowActionMenu from './RowActionMenu';
import { formatRupiah } from '../../utils/formatters';

export interface Bidang2TableItem {
  id: number | string;
  nomor_surat?: string | null;
  nomor_pengadaan?: string | null;
  nomor_permohonan?: string | null;
  judul?: string | null;
  unit_nama?: string | null;
  unit?: { id?: number; nama?: string } | null;
  estimasi_anggaran?: number | string | null;
  nominal?: number | string | null;
  status?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface Bidang2PermohonanTableProps {
  variant?: 'permohonan' | 'pengadaan';
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
  rows?: Bidang2TableItem[];
  isLoading?: boolean;
  isError?: boolean;
  onDetail?: (item: Bidang2TableItem) => void;
}

function SkeletonRow({ isPengadaan }: { isPengadaan: boolean }) {
  return (
    <tr className="border-b border-[#F0F4F2] animate-pulse" aria-hidden="true">
      <td className="py-4 px-4">
        <div className="h-4 w-28 bg-[#EEF5F2] rounded mb-1" />
        {isPengadaan && <div className="h-3 w-20 bg-[#EEF5F2] rounded" />}
      </td>
      <td className="py-4 px-4">
        <div className="h-4 w-48 bg-[#EEF5F2] rounded" />
      </td>
      <td className="py-4 px-4">
        <div className="h-4 w-32 bg-[#EEF5F2] rounded" />
      </td>
      <td className="py-4 px-4">
        <div className="h-4 w-28 bg-[#EEF5F2] rounded" />
      </td>
      <td className="py-4 px-4">
        <div className="h-6 w-28 bg-[#EEF5F2] rounded-full" />
      </td>
      <td className="py-4 px-4 text-center">
        <div className="h-8 w-8 bg-[#EEF5F2] rounded-lg mx-auto" />
      </td>
    </tr>
  );
}

export const Bidang2PermohonanTable: FC<Bidang2PermohonanTableProps> = ({
  variant = 'permohonan',
  title,
  subtitle,
  viewAllHref,
  rows = [],
  isLoading = false,
  isError = false,
  onDetail,
}) => {
  const isPengadaan = variant === 'pengadaan';

  const defaultTitle = isPengadaan
    ? 'Riwayat Pengadaan Terbaru'
    : 'Riwayat Permohonan Terbaru';
  const defaultSubtitle = isPengadaan
    ? '4 pengadaan terakhir yang telah diproses'
    : '4 permohonan terakhir yang telah diproses';
  const defaultHref = isPengadaan ? '/bidang-2/pengadaan' : '/bidang-2/pengajuan';

  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || defaultSubtitle;
  const targetHref = viewAllHref || defaultHref;

  const colFirst = isPengadaan ? 'NO PENGADAAN' : 'NO PERMOHONAN';
  const cols = [colFirst, 'JUDUL PENGADAAN', 'DIAJUKAN OLEH', 'NILAI PENGAJUAN', 'STATUS', 'AKSI'];

  return (
    <section
      className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] overflow-hidden"
      aria-label={displayTitle}
      aria-busy={isLoading || undefined}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5">
        <div>
          <h2 className="text-base font-bold text-[#14201C] tracking-tight">
            {displayTitle}
          </h2>
          <p className="text-xs text-[#8A9A95] mt-0.5">
            {displaySubtitle}
          </p>
        </div>

        <Link
          to={targetHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E7C5A] hover:underline cursor-pointer self-start sm:self-auto"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#F4F7F5] text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider">
              {cols.map((col, idx) => (
                <th
                  key={col}
                  scope="col"
                  className={`py-3.5 px-4 ${idx === 0 ? 'rounded-l-xl' : ''} ${
                    idx === cols.length - 1 ? 'rounded-r-xl text-center' : ''
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F2] text-xs">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRow key={i} isPengadaan={isPengadaan} />
              ))
            ) : isError ? (
              <tr>
                <td colSpan={cols.length} className="py-12 text-center text-[#B42318]">
                  <p className="font-semibold text-sm">Gagal memuat data riwayat.</p>
                  <p className="text-xs text-[#8A9A95] mt-1">Silakan coba muat ulang halaman.</p>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={cols.length} className="py-10 text-center text-[#8A9A95]">
                  <div className="w-10 h-10 rounded-xl bg-[#F4F7F5] text-[#8A9A95] flex items-center justify-center mx-auto mb-2">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-xs text-[#14201C]">
                    Belum ada riwayat {isPengadaan ? 'pengadaan' : 'permohonan'}.
                  </p>
                </td>
              </tr>
            ) : (
              rows.slice(0, 4).map((row) => {
                const itemHref = isPengadaan
                  ? `/bidang-2/pengadaan/${row.id}`
                  : `/bidang-2/pengajuan/${row.id}`;

                const unitNama =
                  row.unit_nama ||
                  row.unit?.nama ||
                  'Unit Kampus';

                const nominal =
                  row.nominal !== undefined && row.nominal !== null
                    ? Number(row.nominal)
                    : Number(row.estimasi_anggaran || 0);

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-[#F9FBFA] transition-colors"
                  >
                    {/* Kolom 1: No Pengadaan / No Permohonan */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {isPengadaan ? (
                        <div>
                          <p className="font-bold text-[#14201C]">
                            {row.nomor_pengadaan || `PGD-${String(row.id).padStart(4, '0')}`}
                          </p>
                          <p className="text-[11px] text-[#8A9A95] mt-0.5">
                            {row.nomor_permohonan || `Permohonan #${row.id}`}
                          </p>
                        </div>
                      ) : onDetail ? (
                        <button
                          type="button"
                          onClick={() => onDetail(row)}
                          className="font-bold text-[#14201C] hover:text-[#0E7C5A] hover:underline cursor-pointer text-left"
                        >
                          {row.nomor_surat || row.nomor_pengadaan || `0101${row.id}-FF-11`}
                        </button>
                      ) : (
                        <Link
                          to={itemHref}
                          className="font-bold text-[#14201C] hover:text-[#0E7C5A] hover:underline"
                        >
                          {row.nomor_surat || row.nomor_pengadaan || `0101${row.id}-FF-11`}
                        </Link>
                      )}
                    </td>

                    {/* Kolom 2: Judul Pengadaan */}
                    <td className="py-4 px-4 font-bold text-[#14201C] max-w-xs truncate" title={row.judul || undefined}>
                      {row.judul || 'Pengadaan Komputer Lab'}
                    </td>

                    {/* Kolom 3: Diajukan Oleh */}
                    <td className="py-4 px-4 text-[#14201C] whitespace-nowrap">
                      {unitNama}
                    </td>

                    {/* Kolom 4: Nilai Pengajuan */}
                    <td className="py-4 px-4 font-bold text-[#14201C] whitespace-nowrap">
                      {formatRupiah(nominal)}
                    </td>

                    {/* Kolom 5: Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {isPengadaan ? (
                        <StatusPill status="review_pengajuan" label="Review Pengajuan" />
                      ) : (
                        <StatusPill status="review_permohonan" label="Review Permohonan" />
                      )}
                    </td>

                    {/* Kolom 6: Aksi */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <RowActionMenu
                        item={{ ...row, status: row.status ?? undefined }}
                        viewHref={itemHref}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Bidang2PermohonanTable;
