import type { FC } from 'react';
import { X, FileText, Download } from 'lucide-react';

export interface DocumentPreviewData {
  label?: string;
  category?: string;
  filename?: string;
  size?: string;
  meta?: string;
  [key: string]: unknown;
}

export interface DocumentPreviewModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  document?: DocumentPreviewData | null;
  category?: string;
  filename?: string;
  size?: string;
  label?: string;
  downloadUrl?: string;
  blobUrl?: string | null;
}

export const DocumentPreviewModal: FC<DocumentPreviewModalProps> = ({
  open,
  isOpen,
  onClose,
  document,
  category,
  filename: propFilename,
  size: propSize,
  label: propLabel,
  downloadUrl: propDownloadUrl,
  blobUrl,
}) => {
  const visible = Boolean(open || isOpen) && Boolean(document || propFilename || category || blobUrl);
  if (!visible) return null;

  const label = propLabel || category || document?.label || document?.category || 'Pratinjau Dokumen';
  const filename = propFilename || document?.filename || 'Dokumen_Pengadaan_SIPBAJA.pdf';
  const size = propSize || document?.size || document?.meta || 'PDF • 1.2 MB';
  const resolvedDownloadUrl = propDownloadUrl || (document?.download_url as string | undefined) || '/pp/dokumen/1/download';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4EBE8] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#111827] truncate">{label}</h3>
              <p className="text-xs text-[#6B7280] truncate">
                {filename} &bull; {size}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={resolvedDownloadUrl}
              target={resolvedDownloadUrl.startsWith('http') || resolvedDownloadUrl.includes('/api/') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0E7C5A] hover:bg-[#0b6347] text-white text-xs font-bold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-[#E4EBE8] text-gray-500 hover:bg-gray-50 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="bg-[#EEF3F0] p-4 sm:p-6 max-h-[78vh] overflow-y-auto">
          {blobUrl ? (
            <div className="space-y-3">
              <iframe
                src={`${blobUrl}#toolbar=1&navpanes=0`}
                title={`Pratinjau Dokumen ${filename}`}
                className="w-full h-[65vh] rounded-xl border border-[#E4EBE8] bg-white shadow-xs"
              />
              <div className="flex items-center justify-between px-2 text-xs text-[#5F6F6A]">
                <span className="font-medium text-[#14201C] truncate max-w-sm">
                  {filename}
                </span>
                <span className="px-3 py-1 bg-[#14201C] text-white rounded-full text-[10px] font-semibold tracking-wide">
                  Berkas Asli Jurusan
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E4EBE8] shadow-xs p-8 max-w-2xl mx-auto">
              <div className="border-b-2 border-[#0E7C5A] pb-4 mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#0E7C5A]">
                    POLITEKNIK NEGERI JAKARTA &bull; SIPBAJA
                  </p>
                  <h4 className="text-base font-extrabold text-[#111827] mt-0.5">{label}</h4>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-[#EAF6F1] text-[#0E7C5A] font-bold text-[11px]">
                  DOKUMEN RESMI
                </span>
              </div>

              <div className="space-y-3 text-xs text-[#374151] leading-relaxed">
                <p>
                  Nama Berkas: <strong>{filename}</strong>
                </p>
                <p>
                  Dokumen ini merupakan bagian dari berkas resmi pengadaan barang dan jasa pada Sistem
                  Informasi Pengadaan Barang dan Jasa (SIPBAJA) Politeknik Negeri Jakarta.
                </p>
                <div className="my-5 p-4 rounded-xl bg-[#F8FAF9] border border-[#E4EBE8] space-y-2.5">
                  <div className="h-2.5 bg-[#E2EAE6] rounded-full w-full" />
                  <div className="h-2.5 bg-[#E2EAE6] rounded-full w-11/12" />
                  <div className="h-2.5 bg-[#E2EAE6] rounded-full w-4/5" />
                  <div className="h-2.5 bg-[#E2EAE6] rounded-full w-full mt-3" />
                  <div className="h-2.5 bg-[#E2EAE6] rounded-full w-3/4" />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#F0F4F2] flex items-center justify-between text-[11px] text-[#9CA3AF]">
                <span>SIPBAJA Digital Archive</span>
                <span>Halaman 1 dari 1</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
