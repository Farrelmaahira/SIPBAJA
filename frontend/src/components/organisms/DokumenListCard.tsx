import { useState, useMemo, type FC } from 'react';
import {
  FileText,
  Eye,
  Download,
  Loader2,
  ChevronDown,
  ChevronUp,
  Files,
  FileCheck2,
  Upload,
} from 'lucide-react';
import type { DokumenItem } from '../../types/dokumen';
import { formatBytes } from '../../utils/formatters';

export interface DokumenListCardProps {
  title?: string;
  dokumenList?: DokumenItem[] | null;
  nomorSurat?: string | null;
  judul?: string | null;
  unitNama?: string | null;
  tanggal?: string | null;
  onViewNewTab?: (dokumen: DokumenItem) => void;
  onDownload?: (dokumen: DokumenItem) => void;
  isViewingId?: number | string | null;
  isDownloadingId?: number | string | null;
  previewBlobUrl?: string | null;
  previewDocId?: number | string | null;
  isLoadingPreview?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
}

export const DokumenListCard: FC<DokumenListCardProps> = ({
  title = 'Dokumen Permohonan',
  dokumenList = [],
  nomorSurat,
  judul,
  unitNama,
  tanggal,
  onViewNewTab,
  onDownload,
  isViewingId = null,
  isDownloadingId = null,
  previewBlobUrl = null,
  previewDocId = null,
  isLoadingPreview = false,
  emptyTitle,
  emptyDescription,
  onEmptyAction,
  emptyActionLabel,
}) => {
  const safeList = useMemo(() => {
    if (!dokumenList || !Array.isArray(dokumenList)) return [];
    return dokumenList;
  }, [dokumenList]);

  // Default expanded: open the first 'surat_permohonan' doc, or the first doc in the list
  const initialExpandedId = useMemo(() => {
    if (safeList.length === 0) return null;
    const permohonanDoc = safeList.find(
      (d) => d.tipe_dokumen === 'surat_permohonan' || d.tipe_dokumen === 'permohonan'
    );
    return permohonanDoc ? permohonanDoc.id : safeList[0].id;
  }, [safeList]);

  const [expandedId, setExpandedId] = useState<number | string | null>(initialExpandedId);

  const toggleExpand = (id: number | string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getDocTypeBadge = (tipe?: string | null) => {
    switch (tipe) {
      case 'surat_permohonan':
        return 'Surat Permohonan';
      case 'rkakl':
      case 'RKAKL':
        return 'Dokumen RKAKL';
      case 'memo_persetujuan':
        return 'Memo Persetujuan';
      case 'dokumen_pengadaan':
        return 'Dokumen Pengadaan';
      case 'bukti_tanda_tangan':
        return 'Bukti Tanda Tangan';
      default:
        return 'Lampiran Berkas';
    }
  };

  return (
    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
      {/* Card Header */}
      <div className="pb-4 mb-4 border-b border-[#F0F4F2] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Files className="w-5 h-5 text-[#0E7C5A]" />
          <h3 className="text-base font-bold text-[#14201C]">{title}</h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4F7F5] text-[#5F6F6A]">
            {safeList.length} Berkas
          </span>
        </div>
        {safeList.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EAF6F1] text-[#0E7C5A]">
            Live Preview
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-[#F4F7F5] text-[#8A9A95]">
            Belum Tersedia
          </span>
        )}
      </div>

      {safeList.length === 0 ? (
        <div className="py-12 px-6 text-center bg-[#F9FBFA] rounded-2xl border-2 border-dashed border-[#E4EBE8] flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF6F1] flex items-center justify-center mb-3.5 text-[#0E7C5A]">
            <Files className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-[#14201C]">
            {emptyTitle || 'Belum ada dokumen yang terlampir'}
          </p>
          <p className="text-xs text-[#8A9A95] mt-1 max-w-sm">
            {emptyDescription ||
              'Dokumen yang diunggah akan muncul secara otomatis di sini.'}
          </p>
          {onEmptyAction && (
            <button
              type="button"
              onClick={onEmptyAction}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{emptyActionLabel || 'Unggah Dokumen'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {safeList.map((doc, idx) => {
            const isExpanded = expandedId === doc.id;
            const isRkaklDoc =
              doc.tipe_dokumen === 'rkakl' ||
              doc.tipe_dokumen === 'RKAKL' ||
              (doc.nama_asli && doc.nama_asli.toLowerCase().includes('rkakl'));
            const isPermohonanDoc =
              doc.tipe_dokumen === 'surat_permohonan' ||
              doc.tipe_dokumen === 'permohonan';
            const isPdf =
              doc.mime_type === 'application/pdf' ||
              (doc.nama_asli && doc.nama_asli.toLowerCase().endsWith('.pdf'));
            const canPreviewIframe = isPermohonanDoc || isRkaklDoc || isPdf || safeList.length === 1;
            const hasDownloadUrl = Boolean(doc.download_url);
            const displaySize = doc.ukuran_bytes ? formatBytes(doc.ukuran_bytes) : '-';
            const isViewingThis = isViewingId === doc.id;
            const isDownloadingThis = isDownloadingId === doc.id;

            // Preview URL priority: blob URL if matches current doc, or direct download_url with inline disposition
            const activePreviewSrc =
              previewBlobUrl && previewDocId === doc.id
                ? previewBlobUrl
                : doc.download_url
                  ? `${doc.download_url.replace(/^\/api(?=\/)/, '')}${
                      doc.download_url.includes('?') ? '&' : '?'
                    }disposition=inline`
                  : null;

            return (
              <div
                key={doc.id || idx}
                className="rounded-2xl border border-[#E4EBE8] bg-[#F9FBFA] overflow-hidden transition-all duration-200"
              >
                {/* Accordion Item Bar */}
                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                  <div
                    className="flex items-center gap-3 min-w-0 cursor-pointer select-none"
                    onClick={() => toggleExpand(doc.id)}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPdf
                          ? 'bg-[#FEE4E2] text-[#D92D20]'
                          : 'bg-[#E8F0FF] text-[#2F68D6]'
                        }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className="text-xs font-bold text-[#14201C] truncate max-w-[200px] sm:max-w-xs md:max-w-md"
                          title={doc.nama_asli}
                        >
                          {doc.nama_asli}
                        </p>
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF4F2] text-[#0E7C5A]">
                          {getDocTypeBadge(doc.tipe_dokumen)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8A9A95] mt-0.5">
                        {isPdf ? 'PDF' : 'Berkas'} &bull; {displaySize}
                        {doc.versi ? ` &bull; Versi ${doc.versi}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {onViewNewTab && (
                      <button
                        type="button"
                        onClick={() => onViewNewTab(doc)}
                        disabled={!hasDownloadUrl || isViewingThis}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E4EBE8] text-xs font-bold text-[#14201C] hover:bg-[#F8FAF9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                        title="Buka dokumen di tab baru"
                      >
                        {isViewingThis ? (
                          <Loader2 className="w-3.5 h-3.5 text-[#0E7C5A] animate-spin" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-[#5F6F6A]" />
                        )}
                        <span>{isViewingThis ? 'Memuat...' : 'Lihat'}</span>
                      </button>
                    )}

                    {onDownload && (
                      <button
                        type="button"
                        onClick={() => onDownload(doc)}
                        disabled={!hasDownloadUrl || isDownloadingThis}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer"
                        title="Unduh berkas dokumen"
                      >
                        {isDownloadingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{isDownloadingThis ? 'Mengunduh...' : 'Unduh'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleExpand(doc.id)}
                      className="w-8 h-8 rounded-xl border border-[#E4EBE8] bg-[#F4F7F5] hover:bg-[#E8EFEA] text-[#5F6F6A] flex items-center justify-center transition-colors cursor-pointer"
                      title={isExpanded ? 'Tutup pratinjau' : 'Buka pratinjau'}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="border-t border-[#E4EBE8] p-4 bg-[#F7FAF9]">
                    {canPreviewIframe ? (
                      /* Live Iframe for Documents */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-[#5F6F6A] px-1">
                          <span className="font-semibold text-[#14201C] flex items-center gap-1.5">
                            <FileCheck2 className="w-4 h-4 text-[#0E7C5A]" />
                            {isRkaklDoc ? 'Pratinjau Dokumen RKAKL' : 'Pratinjau Surat Permohonan'}
                          </span>
                          <span className="text-[11px] text-[#8A9A95]">
                            {isRkaklDoc
                              ? (doc.versi ? `Versi ${doc.versi}` : 'Acuan Pagu')
                              : (nomorSurat ? `No. ${nomorSurat}` : '')}
                          </span>
                        </div>

                        {isLoadingPreview && previewDocId === doc.id ? (
                          <div className="h-[480px] flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-[#E4EBE8]">
                            <Loader2 className="w-7 h-7 text-[#0E7C5A] animate-spin" />
                            <p className="text-xs font-medium text-[#5F6F6A]">
                              Memuat pratinjau isi dokumen...
                            </p>
                          </div>
                        ) : activePreviewSrc ? (
                          <iframe
                            src={`${activePreviewSrc}#toolbar=0&navpanes=0`}
                            title={`Pratinjau isi ${doc.nama_asli}`}
                            className="w-full h-[520px] rounded-xl border border-[#E4EBE8] bg-white shadow-xs"
                          />
                        ) : isRkaklDoc ? (
                          /* Fallback Mockup Dokumen RKAKL */
                          <div className="bg-white rounded-xl border border-[#E4EBE8] shadow-2xs p-6 sm:p-8 max-w-xl mx-auto space-y-5">
                            <div className="flex items-center gap-3 pb-4 border-b-2 border-[#0E7C5A]">
                              <div className="w-10 h-10 rounded-lg bg-[#0E7C5A] text-white flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#14201C] uppercase tracking-wide">
                                  RKA-K/L TAHUN ANGGARAN 2026
                                </p>
                                <p className="text-[11px] text-[#5F6F6A]">
                                  Pengadaan Barang &amp; Jasa Politeknik Negeri Jakarta
                                </p>
                              </div>
                            </div>
                            <div className="text-xs space-y-1.5 text-[#14201C]">
                              <div className="flex gap-2">
                                <span className="w-24 text-[#5F6F6A]">Nama Berkas</span>
                                <span className="font-semibold">: {doc.nama_asli}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="w-24 text-[#5F6F6A]">Versi Dokumen</span>
                                <span>: Versi {doc.versi ?? 1}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="w-24 text-[#5F6F6A]">Status</span>
                                <span className="font-bold text-[#0E7C5A]">: Aktif Digunakan</span>
                              </div>
                            </div>
                            <p className="text-xs text-[#5F6F6A] leading-relaxed">
                              Dokumen acuan pagu anggaran yang telah disahkan untuk proses verifikasi mata anggaran kegiatan (MAK) di lingkungan kampus.
                            </p>
                          </div>
                        ) : (
                          /* Fallback Mockup Dokumen Berkop Resmi */
                          <div className="bg-white rounded-xl border border-[#E4EBE8] shadow-2xs p-6 sm:p-8 max-w-xl mx-auto space-y-5">
                            <div className="flex items-center gap-3 pb-4 border-b-2 border-[#14201C]">
                              <div className="w-10 h-10 rounded-lg bg-[#0E7C5A] text-white flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#14201C] uppercase tracking-wide">
                                  {unitNama || 'JURUSAN TEKNIK INFORMATIKA & KOMPUTER'}
                                </p>
                                <p className="text-[11px] text-[#5F6F6A]">
                                  Pengadaan Barang &amp; Jasa
                                </p>
                              </div>
                            </div>

                            <div className="text-xs space-y-1.5 text-[#14201C]">
                              <div className="flex gap-2">
                                <span className="w-16 text-[#5F6F6A]">Nomor</span>
                                <span>: {nomorSurat || '-'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="w-16 text-[#5F6F6A]">Perihal</span>
                                <span className="font-semibold">: Permohonan {judul || 'Pengadaan'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="w-16 text-[#5F6F6A]">Tanggal</span>
                                <span>: {tanggal || '-'}</span>
                              </div>
                            </div>

                            <div className="text-center pt-2">
                              <p className="text-xs font-bold uppercase tracking-wider text-[#14201C] underline">
                                SURAT PERMOHONAN PENGADAAN
                              </p>
                            </div>

                            <p className="text-xs text-[#14201C] leading-relaxed">
                              Dengan hormat, bersama surat ini kami mengajukan permohonan pengadaan{' '}
                              {judul || 'barang'} untuk menunjang kelancaran operasional dan kegiatan akademik
                              unit kami.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Non-Permohonan Document Info Box */
                      <div className="bg-white rounded-xl border border-[#E4EBE8] p-5 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1.5 text-xs">
                            <p className="font-bold text-[#14201C] text-sm">{doc.nama_asli}</p>
                            <p className="text-[#5F6F6A]">
                              Tipe Dokumen:{' '}
                              <strong className="text-[#14201C]">
                                {getDocTypeBadge(doc.tipe_dokumen)}
                              </strong>
                            </p>
                            <p className="text-[#5F6F6A]">
                              Ukuran Berkas: <strong className="text-[#14201C]">{displaySize}</strong>
                            </p>
                            {doc.versi && (
                              <p className="text-[#5F6F6A]">
                                Versi Dokumen: <strong className="text-[#14201C]">{doc.versi}</strong>
                              </p>
                            )}
                          </div>

                          {onDownload && (
                            <button
                              type="button"
                              onClick={() => onDownload(doc)}
                              disabled={!hasDownloadUrl || isDownloadingThis}
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-white text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                            >
                              <Download className="w-4 h-4" />
                              <span>Unduh Berkas Ini</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DokumenListCard;

