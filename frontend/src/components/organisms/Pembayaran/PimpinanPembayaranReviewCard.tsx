import { useState, type FC, type ChangeEvent } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  Upload,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import type { PpbjPembayaranContext, PpbjDokumenItem } from '@/types/ppbj';
import { DokumenListCard } from '@/components/organisms/DokumenListCard';
import type { DokumenItem } from '@/types/dokumen';
import { formatRupiah, formatTanggalIndo } from '@/utils/formatters';

export interface PimpinanPembayaranReviewCardProps {
  role: 'BIDANG2' | 'PPK';
  context: PpbjPembayaranContext | null;
  isLoading: boolean;
  onApprove: (memo: File, catatan?: string) => Promise<void>;
  onReject: (alasan: string) => Promise<void>;
  onViewDokumen: (doc: DokumenItem) => void;
  onDownloadDokumen?: (doc: DokumenItem) => void;
  previewBlobUrl?: string | null;
  previewDocId?: number | string | null;
  isLoadingPreview?: boolean;
  isViewingDocId?: number | string | null;
  isDownloadingDocId?: number | string | null;
  autoExpand?: boolean;
}

export const PimpinanPembayaranReviewCard: FC<PimpinanPembayaranReviewCardProps> = ({
  role,
  context,
  isLoading,
  onApprove,
  onReject,
  onViewDokumen,
  onDownloadDokumen,
  previewBlobUrl,
  previewDocId,
  isLoadingPreview,
  isViewingDocId,
  isDownloadingDocId,
  autoExpand = false,
}) => {
  const [isApproveModalOpen, setIsApproveModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [memoFile, setMemoFile] = useState<File | null>(null);
  const [catatanApprove, setCatatanApprove] = useState<string>('');
  const [alasanReject, setAlasanReject] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<PpbjDokumenItem | null>(null);
  const [isFotoDrawerOpen, setIsFotoDrawerOpen] = useState<boolean>(false);
  const [isRiwayatOpen, setIsRiwayatOpen] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-[#E4EBE8] shadow-[0_4px_24px_rgba(13,51,38,0.04)] flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#0E7C5A]" />
        <span className="ml-3 text-xs font-semibold text-[#5F6F6A]">
          Memuat verifikasi berkas pembayaran...
        </span>
      </div>
    );
  }

  if (!context || !context.pembayaran) {
    return null;
  }

  const { pembayaran, dokumen_tagihan, approvals, penerimaan, dokumen_riwayat } = context;

  const currentRoleApproval = role === 'PPK' ? approvals.ppk : approvals.bidang2;
  const otherRoleApproval = role === 'PPK' ? approvals.bidang2 : approvals.ppk;
  const otherRoleLabel = role === 'PPK' ? 'Bidang 2 (Wadir II)' : 'PPK';
  const myRoleLabel = role === 'PPK' ? 'PPK' : 'Bidang 2 (Wadir II)';

  const isDitolakByOther =
    otherRoleApproval?.keputusan === 'ditolak' ||
    (pembayaran.status === 'perlu_revisi' && currentRoleApproval?.keputusan !== 'ditolak');

  const isMyApprovalDone = currentRoleApproval?.keputusan === 'disetujui';
  const isMyRejectDone = currentRoleApproval?.keputusan === 'ditolak';

  // Daftar berkas tagihan untuk DokumenListCard
  const tagihanList: DokumenItem[] = dokumen_tagihan
    ? [
        {
          id: dokumen_tagihan.id,
          nama_asli: dokumen_tagihan.nama_asli,
          tipe_dokumen: 'dokumen_tagihan',
          ukuran_bytes: dokumen_tagihan.ukuran_bytes,
          mime_type: dokumen_tagihan.mime_type,
          download_url: dokumen_tagihan.url,
        },
      ]
    : [];

  // Daftar riwayat dokumen pengadaan
  const riwayatList: DokumenItem[] = [
    ...(dokumen_riwayat?.permohonan?.dokumen || []).map((d) => ({
      id: d.id,
      nama_asli: d.nama_asli,
      tipe_dokumen: d.tipe_dokumen || 'surat_permohonan',
      ukuran_bytes: d.ukuran_bytes,
      mime_type: d.mime_type,
      download_url: d.url,
    })),
    ...(dokumen_riwayat?.kontrak?.dokumen || []).map((d) => ({
      id: d.id,
      nama_asli: d.nama_asli,
      tipe_dokumen: d.tipe_dokumen || 'dokumen_kontrak',
      ukuran_bytes: d.ukuran_bytes,
      mime_type: d.mime_type,
      download_url: d.url,
    })),
    ...(penerimaan?.bast_dokumen
      ? [
          {
            id: penerimaan.bast_dokumen.id,
            nama_asli: penerimaan.bast_dokumen.nama_asli,
            tipe_dokumen: 'bast',
            ukuran_bytes: penerimaan.bast_dokumen.ukuran_bytes,
            mime_type: penerimaan.bast_dokumen.mime_type,
            download_url: penerimaan.bast_dokumen.url,
          },
        ]
      : []),
  ];

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoFile) {
      setActionError('Dokumen memo persetujuan pembayaran wajib diunggah (PDF).');
      return;
    }
    setActionError(null);
    setIsSubmitting(true);
    try {
      await onApprove(memoFile, catatanApprove);
      setIsApproveModalOpen(false);
      setMemoFile(null);
      setCatatanApprove('');
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Gagal menyetujui pembayaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alasanReject.trim()) {
      setActionError('Alasan penolakan / catatan revisi wajib diisi.');
      return;
    }
    setActionError(null);
    setIsSubmitting(true);
    try {
      await onReject(alasanReject.trim());
      setIsRejectModalOpen(false);
      setAlasanReject('');
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Gagal menolak dokumen pembayaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-3xl p-6 border border-[#E4EBE8] shadow-[0_4px_24px_rgba(13,51,38,0.04)] space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#F0F4F2] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#14201C]">
              Verifikasi Dokumen Tagihan & Memo Pembayaran ({myRoleLabel})
            </h2>
            <p className="text-xs text-[#5F6F6A] mt-0.5">
              Tinjau draf tagihan PPBJ dan seluruh riwayat berkas sebelum menerbitkan Memo Persetujuan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pembayaran.status === 'disetujui' || pembayaran.status === 'siap_bayar' || pembayaran.status === 'selesai' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E] border border-[#BDE8D1]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Persetujuan Lengkap
            </span>
          ) : pembayaran.status === 'perlu_revisi' || pembayaran.status === 'ditolak' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
              <AlertCircle className="w-3.5 h-3.5" />
              Perlu Revisi Tagihan
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
              <Clock className="w-3.5 h-3.5" />
              Menunggu Review Pimpinan
            </span>
          )}
        </div>
      </div>

      {/* Warning Banner Jika Terkunci Akibat Penolakan Pihak Lain */}
      {isDitolakByOther && (
        <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-3 text-xs text-[#991B1B]">
          <Lock className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Alur Persetujuan Terkunci Sementara</p>
            <p className="mt-1 leading-relaxed">
              Dokumen pembayaran ini telah ditolak/diminta revisi oleh{' '}
              <span className="font-semibold">{otherRoleLabel}</span>
              {otherRoleApproval?.alasan ? ` dengan catatan: "${otherRoleApproval.alasan}"` : '.'}
              <br />
              Tombol persetujuan ditangguhkan hingga pihak PPBJ mengunggah dokumen tagihan revisi baru.
            </p>
          </div>
        </div>
      )}

      {/* Status Review Dual Approval (PPK & Bidang 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status PPK */}
        <div className="p-4 rounded-2xl border border-[#E4EBE8] bg-[#FAFCFA]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#14201C]">Review PPK</span>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                approvals.ppk?.keputusan === 'disetujui'
                  ? 'bg-[#E4F6EC] text-[#0B7A4E]'
                  : approvals.ppk?.keputusan === 'ditolak'
                  ? 'bg-[#FEE2E2] text-[#991B1B]'
                  : 'bg-[#FEF3C7] text-[#B45309]'
              }`}
            >
              {approvals.ppk?.keputusan ? approvals.ppk.keputusan.toUpperCase() : 'MENUNGGU'}
            </span>
          </div>
          {approvals.ppk?.memo ? (
            <button
              type="button"
              onClick={() =>
                onViewDokumen({
                  id: approvals.ppk!.memo!.id,
                  nama_asli: approvals.ppk!.memo!.nama_asli,
                  tipe_dokumen: 'memo_persetujuan_pembayaran',
                  ukuran_bytes: 0,
                  download_url: approvals.ppk!.memo!.url,
                })
              }
              className="text-xs font-semibold text-[#0E7C5A] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              {approvals.ppk.memo.nama_asli}
            </button>
          ) : approvals.ppk?.alasan ? (
            <p className="text-xs text-[#991B1B] italic mt-1">Alasan: {approvals.ppk.alasan}</p>
          ) : (
            <p className="text-xs text-[#8A9A95] italic mt-1">Belum menerbitkan memo persetujuan.</p>
          )}
        </div>

        {/* Status Bidang 2 */}
        <div className="p-4 rounded-2xl border border-[#E4EBE8] bg-[#FAFCFA]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#14201C]">Review Bidang 2 (Wadir II)</span>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                approvals.bidang2?.keputusan === 'disetujui'
                  ? 'bg-[#E4F6EC] text-[#0B7A4E]'
                  : approvals.bidang2?.keputusan === 'ditolak'
                  ? 'bg-[#FEE2E2] text-[#991B1B]'
                  : 'bg-[#FEF3C7] text-[#B45309]'
              }`}
            >
              {approvals.bidang2?.keputusan ? approvals.bidang2.keputusan.toUpperCase() : 'MENUNGGU'}
            </span>
          </div>
          {approvals.bidang2?.memo ? (
            <button
              type="button"
              onClick={() =>
                onViewDokumen({
                  id: approvals.bidang2!.memo!.id,
                  nama_asli: approvals.bidang2!.memo!.nama_asli,
                  tipe_dokumen: 'memo_persetujuan_pembayaran',
                  ukuran_bytes: 0,
                  download_url: approvals.bidang2!.memo!.url,
                })
              }
              className="text-xs font-semibold text-[#0E7C5A] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              {approvals.bidang2.memo.nama_asli}
            </button>
          ) : approvals.bidang2?.alasan ? (
            <p className="text-xs text-[#991B1B] italic mt-1">Alasan: {approvals.bidang2.alasan}</p>
          ) : (
            <p className="text-xs text-[#8A9A95] italic mt-1">Belum menerbitkan memo persetujuan.</p>
          )}
        </div>
      </div>

      {/* Rincian Nominal Tagihan */}
      <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E4EBE8] flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="text-xs text-[#5F6F6A]">Nominal Tagihan Diajukan PPBJ:</span>
          <p className="text-base font-bold text-[#0E7C5A]">{formatRupiah(pembayaran.nominal || 0)}</p>
        </div>
        {pembayaran.tanggal_bayar && (
          <div>
            <span className="text-xs text-[#5F6F6A]">Tanggal Pembayaran:</span>
            <p className="text-xs font-semibold text-[#14201C]">{formatTanggalIndo(pembayaran.tanggal_bayar)}</p>
          </div>
        )}
      </div>

      {/* FR-55: Pratinjau Draf Tagihan PPBJ menggunakan DokumenListCard */}
      <div>
        <DokumenListCard
          title="Dokumen Draf Tagihan / Invoice Termin (PPBJ)"
          dokumenList={tagihanList}
          emptyTitle="Belum ada draf tagihan yang diunggah"
          emptyDescription="Pihak PPBJ belum mengunggah dokumen draf tagihan untuk pengadaan ini."
          onViewNewTab={onViewDokumen}
          onDownload={onDownloadDokumen}
          previewBlobUrl={previewBlobUrl}
          previewDocId={previewDocId}
          isLoadingPreview={isLoadingPreview}
          isViewingId={isViewingDocId}
          isDownloadingId={isDownloadingDocId}
          autoExpand={autoExpand}
        />
      </div>

      {/* FR-55: Riwayat Dokumen Lengkap Pengadaan (Permohonan, Kontrak, BAST) */}
      <div className="rounded-2xl border border-[#E4EBE8] bg-[#F9FBFA] overflow-hidden">
        <button
          type="button"
          onClick={() => setIsRiwayatOpen((prev) => !prev)}
          className="w-full p-4 flex items-center justify-between bg-white hover:bg-[#F8FAF9] transition-colors cursor-pointer text-left select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-[#14201C]">
                  Seluruh Dokumen Riwayat Pengadaan
                </p>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4F7F5] text-[#5F6F6A]">
                  {riwayatList.length} Berkas
                </span>
              </div>
              <p className="text-[11px] text-[#8A9A95] mt-0.5">
                Surat Permohonan, RKAKL, Kontrak/SPK, dan Berita Acara Serah Terima (BAST)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0E7C5A] hidden sm:inline">
              {isRiwayatOpen ? 'Tutup Riwayat' : 'Lihat Seluruh Berkas'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F4F7F5] flex items-center justify-center text-[#5F6F6A]">
              {isRiwayatOpen ? <ChevronUp className="w-4 h-4 text-[#0E7C5A]" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {isRiwayatOpen && (
          <div className="p-4 border-t border-[#E4EBE8] bg-[#F9FBFA]">
            <DokumenListCard
              title="Berkas Riwayat Pengadaan Lengkap"
              dokumenList={riwayatList}
              emptyTitle="Belum ada berkas riwayat"
              emptyDescription="Tidak ada berkas permohonan atau kontrak yang tersimpan."
              onViewNewTab={onViewDokumen}
              onDownload={onDownloadDokumen}
              previewBlobUrl={previewBlobUrl}
              previewDocId={previewDocId}
              isLoadingPreview={isLoadingPreview}
              isViewingId={isViewingDocId}
              isDownloadingId={isDownloadingDocId}
              autoExpand={false}
            />
          </div>
        )}
      </div>

      {/* FR-55: Galeri Foto Fisik Barang (Drawer Horizontal) */}
      {penerimaan && penerimaan.foto_barang.length > 0 && (
        <div className="rounded-2xl border border-[#E4EBE8] bg-[#F9FBFA] overflow-hidden">
          <button
            type="button"
            onClick={() => setIsFotoDrawerOpen((prev) => !prev)}
            className="w-full p-4 flex items-center justify-between bg-white hover:bg-[#F8FAF9] transition-colors cursor-pointer text-left select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-[#14201C]">
                    Dokumentasi Foto Fisik Barang (Perlengkapan)
                  </p>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4F7F5] text-[#5F6F6A]">
                    {penerimaan.foto_barang.length} Foto
                  </span>
                </div>
                <p className="text-[11px] text-[#8A9A95] mt-0.5">
                  Klik untuk {isFotoDrawerOpen ? 'menutup' : 'melihat'} bukti fisik barang yang telah diverifikasi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0E7C5A] hidden sm:inline">
                {isFotoDrawerOpen ? 'Sembunyikan' : 'Buka Foto'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#F4F7F5] flex items-center justify-center text-[#5F6F6A]">
                {isFotoDrawerOpen ? <ChevronUp className="w-4 h-4 text-[#0E7C5A]" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {isFotoDrawerOpen && (
            <div className="p-4 border-t border-[#E4EBE8] bg-[#F9FBFA]">
              <div className="flex gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-[#D0DCD7] scrollbar-track-transparent">
                {penerimaan.foto_barang.map((foto) => (
                  <div
                    key={foto.id}
                    className="group relative shrink-0 w-44 sm:w-52 rounded-2xl overflow-hidden border border-[#E4EBE8] bg-white shadow-xs"
                  >
                    <div className="relative aspect-4/3 w-full bg-[#F4F7F5] overflow-hidden">
                      <img
                        src={foto.url}
                        alt={foto.nama_asli}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedImage(foto)}
                          className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-xs font-bold text-[#14201C] shadow-sm cursor-pointer flex items-center gap-1"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-[#0E7C5A]" />
                          Perbesar
                        </button>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white">
                      <p className="text-xs font-semibold text-[#14201C] truncate" title={foto.nama_asli}>
                        {foto.nama_asli}
                      </p>
                      <p className="text-[10px] text-[#8A9A95] mt-0.5">
                        {(foto.ukuran_bytes / 1024).toFixed(0)} KB &bull; Foto Barang
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons: Approve & Reject (FR-56, FR-57) */}
      <div className="pt-2 flex items-center justify-end flex-wrap gap-3">
        {isMyApprovalDone ? (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E4F6EC] border border-[#BDE8D1] text-xs font-bold text-[#0B7A4E]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Anda telah menyetujui pembayaran ini beserta Memo Persetujuan.</span>
          </div>
        ) : isMyRejectDone ? (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-xs font-bold text-[#991B1B]">
            <AlertCircle className="w-4 h-4" />
            <span>Anda telah menolak draf tagihan ini. Menunggu pengunggahan ulang oleh PPBJ.</span>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setActionError(null);
                setIsRejectModalOpen(true);
              }}
              disabled={isDitolakByOther || isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-[#FCA5A5] bg-white hover:bg-[#FEF2F2] text-[#DC2626] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tolak / Minta Revisi
            </button>
            <button
              type="button"
              onClick={() => {
                setActionError(null);
                setIsApproveModalOpen(true);
              }}
              disabled={isDitolakByOther || isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              Setujui & Unggah Memo
            </button>
          </>
        )}
      </div>

      {/* Modal Approve dengan Wajib Memo Persetujuan (FR-56) */}
      {isApproveModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setIsApproveModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-3xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F4F2] mb-4">
              <div>
                <h3 className="text-base font-bold text-[#14201C]">
                  Persetujuan Pembayaran ({myRoleLabel})
                </h3>
                <p className="text-xs text-[#5F6F6A] mt-0.5">
                  Unggah berkas dokumen Memo Persetujuan Pembayaran (PDF)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="p-1 rounded-lg text-[#8A9A95] hover:bg-[#F4F7F5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-[#FEE2E2] text-xs text-[#991B1B]">
                {actionError}
              </div>
            )}

            <form onSubmit={handleApproveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#14201C] mb-1.5">
                  Dokumen Memo Persetujuan (Wajib PDF, Maks. 10 MB) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const f = e.target.files?.[0] || null;
                    setMemoFile(f);
                  }}
                  className="w-full text-xs text-[#5F6F6A] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#EAF6F1] file:text-[#0E7C5A] hover:file:bg-[#D5EFE5] file:cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14201C] mb-1.5">
                  Catatan Persetujuan (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={catatanApprove}
                  onChange={(e) => setCatatanApprove(e.target.value)}
                  placeholder="Masukkan catatan pendukung persetujuan jika ada..."
                  className="w-full rounded-xl border border-[#D0DCD7] p-3 text-xs text-[#14201C] focus:outline-none focus:ring-2 focus:ring-[#0E7C5A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F0F4F2]">
                <button
                  type="button"
                  onClick={() => setIsApproveModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5F6F6A] hover:bg-[#F4F7F5] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !memoFile}
                  className="px-5 py-2.5 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Kirim Persetujuan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reject dengan Wajib Alasan Spesifik (FR-57) */}
      {isRejectModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setIsRejectModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-3xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F4F2] mb-4">
              <div>
                <h3 className="text-base font-bold text-[#14201C]">
                  Penolakan / Permintaan Revisi Pembayaran
                </h3>
                <p className="text-xs text-[#5F6F6A] mt-0.5">
                  Berikan alasan spesifik untuk diteruskan ke pihak PPBJ
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1 rounded-lg text-[#8A9A95] hover:bg-[#F4F7F5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-[#FEE2E2] text-xs text-[#991B1B]">
                {actionError}
              </div>
            )}

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#14201C] mb-1.5">
                  Alasan Penolakan / Catatan Revisi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={alasanReject}
                  onChange={(e) => setAlasanReject(e.target.value)}
                  placeholder="Jelaskan secara spesifik ketidaksesuaian draf tagihan atau dokumen lampiran..."
                  className="w-full rounded-xl border border-[#FCA5A5] p-3 text-xs text-[#14201C] focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F0F4F2]">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5F6F6A] hover:bg-[#F4F7F5] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !alasanReject.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Kirim Penolakan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal Foto Barang */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2] mb-3">
              <h3 className="text-sm font-bold text-[#14201C]">{selectedImage.nama_asli}</h3>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg text-[#5F6F6A] hover:bg-[#F4F7F5] cursor-pointer"
              >
                Tutup
              </button>
            </div>
            <img
              src={selectedImage.url}
              alt={selectedImage.nama_asli}
              className="w-full max-h-[75vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default PimpinanPembayaranReviewCard;
