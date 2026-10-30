import type { FC } from 'react';
import { Trash2, FileText, AlertCircle } from 'lucide-react';
import StatusPill from '../atoms/StatusPill';
import { formatRupiah } from '../../utils/formatters';

export interface PaketPengadaanDokumen {
  id?: number | string;
  namaAsli?: string;
  nama_asli?: string;
  [key: string]: unknown;
}

export interface PaketPengadaanItem {
  id: number | string;
  makNama?: string;
  ppkNama?: string;
  jenisNama?: string;
  metodeNama?: string;
  levelNama?: string;
  nominal?: number | string;
  dokumenList?: PaketPengadaanDokumen[];
  status?: string;
  [key: string]: unknown;
}

export interface PermohonanShowPaketListProps {
  paketList?: PaketPengadaanItem[];
  sudahDikunci?: boolean;
  onDelete?: (id: number | string) => void;
}

export const PermohonanShowPaketList: FC<PermohonanShowPaketListProps> = ({
  paketList = [],
  sudahDikunci = false,
  onDelete,
}) => {
  if (!paketList || paketList.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-[#8A9A95] italic bg-[#F7FAF9] rounded-xl border border-dashed border-[#CFDAD6]">
        Belum ada paket pengadaan yang dibuat dari permohonan ini.
      </div>
    );
  }

  const handleDelete = (id: number | string) => {
    if (confirm('Apakah Anda yakin ingin menghapus draft paket pengadaan ini?')) {
      if (onDelete) {
        onDelete(id);
      }
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E4EBE8]">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-[#F1F7F4] border-b border-[#E4EBE8] text-[11px] font-semibold text-[#5F6F6A] uppercase tracking-[0.8px]">
            <th scope="col" className="py-3 px-4 w-12 text-center">No</th>
            <th scope="col" className="py-3 px-4">MAK & Penanggung Jawab</th>
            <th scope="col" className="py-3 px-4">Jenis & Metode</th>
            <th scope="col" className="py-3 px-4">Level</th>
            <th scope="col" className="py-3 px-4">Nominal</th>
            <th scope="col" className="py-3 px-4">Dokumen</th>
            <th scope="col" className="py-3 px-4 text-center">Status</th>
            {!sudahDikunci && (
              <th scope="col" className="py-3 px-4 text-center w-16">Aksi</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0F4F2] bg-white">
          {paketList.map((paket, index) => {
            const hasDokumen = Boolean(paket.dokumenList && paket.dokumenList.length > 0);
            const docName = paket.dokumenList?.[0]?.namaAsli || paket.dokumenList?.[0]?.nama_asli;
            const isDraft = paket.status === 'draft';

            return (
              <tr key={paket.id} className="hover:bg-[#F8FAF9] transition-colors">
                <td className="py-3.5 px-4 text-center text-xs font-medium text-[#5F6F6A]">
                  {index + 1}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-xs text-[#14201C]">
                      {paket.makNama}
                    </span>
                    <span className="text-[11px] text-[#5F6F6A]">
                      PPK: {paket.ppkNama || '-'}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-[#14201C]">
                      {paket.jenisNama || '-'}
                    </span>
                    <span className="text-[11px] text-[#5F6F6A]">
                      {paket.metodeNama || '-'}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F0F4F2] text-[#14201C] text-xs font-medium border border-[#E4EBE8]">
                    {paket.levelNama || '-'}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-semibold text-[#14201C] tabular-nums">
                  {formatRupiah(paket.nominal)}
                </td>
                <td className="py-3.5 px-4">
                  {hasDokumen ? (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0E7C5A] bg-[#EBF7F2] px-2 py-0.5 rounded-md border border-[#D0EAE0]"
                      title={docName}
                    >
                      <FileText className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{docName}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B42318] bg-[#FEF3F2] px-2 py-0.5 rounded-md border border-[#FECDCA]">
                      <AlertCircle className="w-3 h-3" />
                      <span>Belum Ada</span>
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <StatusPill status={paket.status} />
                </td>
                {!sudahDikunci && (
                  <td className="py-3.5 px-4 text-center">
                    {isDraft ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(paket.id)}
                        className="p-1.5 rounded-lg text-[#B42318] hover:bg-[#FEF3F2] transition-colors"
                        title="Hapus draft paket ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-[#8A9A95]">-</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PermohonanShowPaketList;
