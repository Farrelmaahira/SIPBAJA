import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import StatusPill from '../atoms/StatusPill';
import RowActionMenu from './RowActionMenu';
import { formatRupiah } from '../../utils/formatters';

export interface PpbjDashboardTableRow {
  id: number;
  primaryNumber: string;
  secondaryNumber?: string;
  judul: string;
  unitNama: string;
  nominal: number | null;
  status: string;
  detailHref: string;
}

export interface PpbjDashboardTableCardProps {
  title: string;
  subtitle: string;
  lihatSemuaHref: string;
  numberColumnLabel: string;
  rows: PpbjDashboardTableRow[];
  isLoading?: boolean;
  emptyMessage: string;
}

export const PpbjDashboardTableCard: FC<PpbjDashboardTableCardProps> = ({
  title,
  subtitle,
  lihatSemuaHref,
  numberColumnLabel,
  rows,
  isLoading = false,
  emptyMessage,
}) => {
  return (
    <section className="bg-white rounded-[22px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] overflow-hidden">
      <div className="px-6 py-5 border-b border-[#F0F4F2] flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-bold text-[#14201C]">{title}</h2>
          <p className="text-xs text-[#8A9A95] mt-0.5">{subtitle}</p>
        </div>
        <Link
          to={lihatSemuaHref}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E4EBE8] hover:bg-[#F4F7F5] text-xs font-bold text-[#0E7C5A] transition shrink-0"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#EEF3F0] border-b border-[#E2EAE6] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              <th className="py-3.5 px-6">{numberColumnLabel}</th>
              <th className="py-3.5 px-4">JUDUL PENGADAAN</th>
              <th className="py-3.5 px-4">DIAJUKAN OLEH</th>
              <th className="py-3.5 px-4">NILAI PENGAJUAN</th>
              <th className="py-3.5 px-4">STATUS</th>
              <th className="py-3.5 px-6 text-center">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F2] text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[#8A9A95]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-[#5F6F6A]">Memuat data...</p>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#8A9A95]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#FAFDFB] transition">
                  <td className="py-4 px-6">
                    <Link to={row.detailHref} className="font-bold text-[#0E7C5A] hover:underline block">
                      {row.primaryNumber}
                    </Link>
                    {row.secondaryNumber && (
                      <span className="text-[11px] text-[#8A9A95] block mt-0.5">
                        {row.secondaryNumber}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 font-bold text-[#14201C]">{row.judul}</td>
                  <td className="py-4 px-4 text-[#5F6F6A]">{row.unitNama}</td>
                  <td className="py-4 px-4 font-bold text-[#14201C]">
                    {row.nominal !== null ? formatRupiah(row.nominal) : '-'}
                  </td>
                  <td className="py-4 px-4">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <RowActionMenu item={row} viewHref={row.detailHref} />
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

export default PpbjDashboardTableCard;
