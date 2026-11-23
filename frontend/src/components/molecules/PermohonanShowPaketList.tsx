import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, FileText, AlertCircle, Edit, ExternalLink } from 'lucide-react';
import StatusPill from '../atoms/StatusPill';
import type { PpbjPaketDraftItem } from '../../types/ppbj';

export interface PaketPengadaanDokumen {
  id?: number | string;
  namaAsli?: string;
  nama_asli?: string;
  [key: string]: unknown;
}

export interface PaketPengadaanItem {
  id: number | string;
  makNama?: string;
  makKode?: string;
  ppkNama?: string;
  jenisNama?: string;
  metodeNama?: string;
  levelNama?: string;
  nominal?: number | string;
  dokumenList?: PaketPengadaanDokumen[];
  status?: string;
  revisiKe?: number;
  [key: string]: unknown;
}

export interface PermohonanShowPaketListProps {
  paketList?: (PaketPengadaanItem | PpbjPaketDraftItem)[];
  sudahDikunci?: boolean;
  onDelete?: (id: number | string) => void;
}

export const PermohonanShowPaketList: FC<PermohonanShowPaketListProps> = ({
  paketList = [],
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
            <th scope="col" className="py-3 px-4">Dokumen</th>
            <th scope="col" className="py-3 px-4 text-center">Status</th>
            <th scope="col" className="py-3 px-4 text-center w-28">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0F4F2] bg-white">
          {paketList.map((paket, index) => {
            const raw = paket as Record<string, any>;
            const hasDokumen = Boolean(paket.dokumenList && paket.dokumenList.length > 0);
            const firstDoc = paket.dokumenList?.[0] as Record<string, any> | undefined;
            const docName = firstDoc?.namaAsli || firstDoc?.nama_asli || 'Dokumen Pengadaan';
            const isDraft = paket.status === 'draft';
            const isDitolak = paket.status === 'ditolak';
            const revisiKe = raw.revisiKe || raw.revisi_ke || 0;
            const makText = raw.makNama || raw.makKode || '-';
            const ppkText = raw.ppkNama || '-';
            const jenisText = raw.jenisNama || '-';
            const metodeText = raw.metodeNama || '-';
            const levelText = raw.levelNama || '-';

            return (
              <tr key={paket.id} className="hover:bg-[#F8FAF9] transition-colors">
                <td className="py-3.5 px-4 text-center text-xs font-medium text-[#5F6F6A]">
                  {index + 1}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-xs text-[#14201C]">
                      {makText}
                    </span>
                    <span className="text-[11px] text-[#5F6F6A]">
                      PPK: {ppkText}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-[#14201C]">
                      {jenisText}
                    </span>
                    <span className="text-[11px] text-[#5F6F6A]">
                      {metodeText}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F0F4F2] text-[#14201C] text-xs font-medium border border-[#E4EBE8]">
                    {levelText}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  {hasDokumen ? (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0E7C5A] bg-[#EBF7F2] px-2 py-0.5 rounded-md border border-[#D0EAE0]"
                      title={docName}
                    >
                      <FileText className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">{docName}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B42318] bg-[#FEF3F2] px-2 py-0.5 rounded-md border border-[#FECDCA]">
                      <AlertCircle className="w-3 h-3" />
                      <span>Belum Ada</span>
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <StatusPill status={paket.status} />
                    {revisiKe > 0 && (
                      <span className="text-[10px] font-semibold text-[#B54708] bg-[#FEF6EE] px-1.5 py-0.5 rounded-full border border-[#FECDCA]">
                        Rev-{revisiKe}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {isDitolak ? (
                      <Link
                        to={`/ppbj/pengadaan/${paket.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FEE4E2] text-[#D92D20] hover:bg-[#FECDCA] text-[11px] font-bold border border-[#FECDCA] transition-colors"
                        title="Revisi Dokumen Pengadaan yang ditolak"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Revisi</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/ppbj/pengadaan/${paket.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F1F7F4] text-[#0E7C5A] hover:bg-[#E2EFE9] text-[11px] font-semibold border border-[#D0EAE0] transition-colors"
                        title="Lihat Detail Pengadaan"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Detail</span>
                      </Link>
                    )}

                    {isDraft && onDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(paket.id)}
                        className="p-1 rounded-lg text-[#B42318] hover:bg-[#FEF3F2] transition-colors cursor-pointer"
                        title="Hapus draft paket ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PermohonanShowPaketList;
