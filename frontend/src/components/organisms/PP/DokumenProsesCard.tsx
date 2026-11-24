import type { FC } from 'react';
import { Tag, UserCheck } from 'lucide-react';
import DocumentCard from '../DocumentCard';
import { formatBytes } from '../../../utils/formatters';
import type { DokumenItem } from '../../../types/dokumen';
import type { PpMakItem } from '../../../types/pp';

export interface DokumenProsesCardProps {
  suratPermohonanDoc?: DokumenItem | null;
  memoBidang2Doc?: DokumenItem | null;
  memoPpkDoc?: DokumenItem | null;
  makList?: PpMakItem[];
  ppkNama?: string | null;
  onView?: (doc: DokumenItem) => void;
  onDownload?: (doc: DokumenItem) => void;
}

export const DokumenProsesCard: FC<DokumenProsesCardProps> = ({
  suratPermohonanDoc,
  memoBidang2Doc,
  memoPpkDoc,
  makList = [],
  ppkNama,
  onView,
  onDownload,
}) => {
  const sizeLabel = (doc?: DokumenItem | null) =>
    doc?.ukuran_bytes ? `PDF • ${formatBytes(doc.ukuran_bytes)}` : 'PDF • Tersedia';

  const viewHandler = (doc?: DokumenItem | null) =>
    doc?.download_url && onView ? () => onView(doc) : undefined;

  const downloadHandler = (doc?: DokumenItem | null) =>
    doc?.download_url && onDownload ? () => onDownload(doc) : undefined;

  return (
    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
      <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
        <h3 className="text-base font-bold text-[#14201C]">Dokumen Proses Sebelumnya</h3>
        <p className="text-xs text-[#8A9A95] mt-0.5">
          Surat permohonan, memo persetujuan, dan jenis MAK dari Perencanaan
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <DocumentCard
          category="Surat Permohonan"
          filename={suratPermohonanDoc?.nama_asli || 'Surat_Permohonan.pdf'}
          size={sizeLabel(suratPermohonanDoc)}
          onView={viewHandler(suratPermohonanDoc)}
          onDownload={downloadHandler(suratPermohonanDoc)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DocumentCard
            category="Memo Persetujuan Bidang 2"
            filename={memoBidang2Doc?.nama_asli || 'Memo_Persetujuan_Bidang2.pdf'}
            size={sizeLabel(memoBidang2Doc)}
            onView={viewHandler(memoBidang2Doc)}
            onDownload={downloadHandler(memoBidang2Doc)}
          />

          <DocumentCard
            category="Memo Persetujuan PPK"
            filename={memoPpkDoc?.nama_asli || 'Memo_Persetujuan_PPK.pdf'}
            size={sizeLabel(memoPpkDoc)}
            onView={viewHandler(memoPpkDoc)}
            onDownload={downloadHandler(memoPpkDoc)}
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#F4F7F5] border border-[#E4EBE8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-[#8A9A95] block">
              Jenis MAK dari Perencanaan
            </span>
            <span className="text-xs font-bold text-[#14201C] block mt-0.5">
              {makList.length > 0
                ? makList.map((m) => (m.kode ? `${m.kode} · ${m.nama}` : m.nama)).join(', ')
                : '532111 · Belanja Modal Peralatan dan Mesin'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#5F6F6A] pl-11 sm:pl-0">
          <UserCheck className="w-4 h-4 text-[#0E7C5A] shrink-0" />
          <span className="text-[#8A9A95]">Penanggung Jawab MAK:</span>
          <span className="font-bold text-[#14201C]">
            {ppkNama ? `${ppkNama} · PPK` : 'Budi Santoso · PPK'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DokumenProsesCard;
