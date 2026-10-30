import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Layers, Eye } from 'lucide-react';
import StatusPill from '../atoms/StatusPill';
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters';

export interface PermohonanTableItem {
  id: number | string;
  nomorSurat?: string;
  nomor_surat?: string;
  judul?: string;
  unitNama?: string;
  unit_nama?: string;
  tanggalPengajuan?: string;
  tanggal_pengajuan?: string;
  created_at?: string;
  makList?: string[];
  estimasiAnggaran?: number | string;
  estimasi_anggaran?: number | string;
  status?: string;
  jumlahPaket?: number;
  revisiKe?: number;
  [key: string]: unknown;
}

export interface PermohonanTableProps {
  items?: PermohonanTableItem[];
  isLoading?: boolean;
}

export const PermohonanTable: FC<PermohonanTableProps> = ({ items = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.05)] p-12 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#5F6F6A]">Memuat daftar permohonan pengadaan...</p>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-[20px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.05)] p-12 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#F1F7F4] flex items-center justify-center text-[#5F6F6A]">
          <FileText className="w-7 h-7 stroke-[1.75]" />
        </div>
        <h3 className="text-base font-semibold text-[#14201C] mb-1">
          Belum ada permohonan pengadaan
        </h3>
        <p className="text-sm text-[#5F6F6A] max-w-sm mx-auto">
          Permohonan pengadaan yang diajukan oleh unit kerja akan tercatat di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.05)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#F1F7F4] border-b border-[#E4EBE8] text-[11px] font-semibold text-[#5F6F6A] uppercase tracking-[0.8px]">
              <th scope="col" className="py-3.5 px-5">No Permohonan</th>
              <th scope="col" className="py-3.5 px-5">Judul & Unit</th>
              <th scope="col" className="py-3.5 px-5">Tanggal Pengajuan</th>
              <th scope="col" className="py-3.5 px-5">Sumber Dana (MAK)</th>
              <th scope="col" className="py-3.5 px-5">Estimasi Anggaran</th>
              <th scope="col" className="py-3.5 px-5">Status</th>
              <th scope="col" className="py-3.5 px-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F2]">
            {items.map((item) => {
              const hasMak = Array.isArray(item.makList) && item.makList.length > 0;
              const isRevised = (item.revisiKe ?? 0) > 0;
              const nomor = item.nomorSurat || item.nomor_surat || '-';
              const tanggal = item.tanggalPengajuan || item.tanggal_pengajuan || item.created_at;
              const unit = item.unitNama || item.unit_nama || '-';
              const nominal = item.estimasiAnggaran ?? item.estimasi_anggaran;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-[#F8FAF9] transition-colors"
                >
                  {/* No Permohonan */}
                  <td className="py-4 px-5 align-top font-semibold text-[#0E7C5A] whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>{nomor}</span>
                      {(item.jumlahPaket ?? 0) > 0 && (
                        <span className="text-[11px] font-normal text-[#5F6F6A] mt-0.5 inline-flex items-center gap-1">
                          <Layers className="w-3 h-3 text-[#5F6F6A]" />
                          {item.jumlahPaket} Paket
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Judul & Unit */}
                  <td className="py-4 px-5 align-top min-w-[240px] max-w-md">
                    <p className="font-medium text-[#14201C] line-clamp-2 leading-snug">
                      {item.judul || '-'}
                    </p>
                    <p className="text-xs text-[#5F6F6A] mt-1">
                      {unit}
                    </p>
                  </td>

                  {/* Tanggal Pengajuan */}
                  <td className="py-4 px-5 align-top text-xs text-[#5F6F6A] whitespace-nowrap">
                    {formatTanggalIndo(tanggal)}
                  </td>

                  {/* Sumber Dana (MAK) */}
                  <td className="py-4 px-5 align-top">
                    {hasMak ? (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {item.makList?.map((mak, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#EAF5F1] text-[#0A5C43]"
                          >
                            {mak}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-[#8A9A95] italic">
                        Belum ditentukan
                      </span>
                    )}
                  </td>

                  {/* Estimasi Anggaran */}
                  <td className="py-4 px-5 align-top whitespace-nowrap font-semibold text-[#14201C]">
                    {formatRupiah(nominal)}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5 align-top whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1">
                      <StatusPill status={item.status} />
                      {isRevised && (
                        <span className="text-[10px] font-medium text-[#B54708] bg-[#FEF6EE] px-1.5 py-0.5 rounded">
                          Revisi ke-{item.revisiKe}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Aksi */}
                  <td className="py-4 px-5 align-top text-right whitespace-nowrap">
                    <Link
                      to={`/ppbj/permohonan/${item.id}`}
                      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border-[0.5px] gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#0E7C5A] hover:bg-[#EAF5F1] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0E7C5A]/30"
                      aria-label={`Detail permohonan ${nomor}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermohonanTable;
