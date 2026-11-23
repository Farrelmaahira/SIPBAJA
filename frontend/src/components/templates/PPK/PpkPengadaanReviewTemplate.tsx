import type { FC } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Tag,
  Building2,
  Banknote,
  Eye,
  Download,
  XCircle,
  CheckCircle2,
  Layers,
  Info,
  UserCheck,
  Hash,
  AlertCircle,
  Clock,
} from 'lucide-react';
import AppLayout, { type AppNavItem } from '../General/AppLayout';
import KonfirmasiApproveModal from '../../organisms/KonfirmasiApproveModal';
import TolakPengadaanModal from '../../organisms/TolakPengadaanModal';
import DocumentPreviewModal from '../../organisms/DocumentPreviewModal';
import type {
  PpPengadaanDetailPayload,
  PpDocumentPreviewInfo,
  PpMakItem,
  PpDokumenItem,
} from '../../../types/pp';
import type { NotificationItem } from '../../../types/notification';

export interface PpkPengadaanReviewTemplateProps {
  detail?: PpPengadaanDetailPayload;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
  navItems: AppNavItem[];
  confirmApproveOpen: boolean;
  rejectOpen: boolean;
  submitting: boolean;
  rejectError: string;
  flashError?: string;
  previewDoc: PpDocumentPreviewInfo | null;
  onOpenConfirmApprove: () => void;
  onCloseConfirmApprove: () => void;
  onConfirmApprove: () => void;
  onOpenReject: () => void;
  onCloseReject: () => void;
  onConfirmReject: (alasan: string) => void;
  onSelectPreviewDoc: (doc: PpDocumentPreviewInfo | null) => void;
}

export const PpkPengadaanReviewTemplate: FC<PpkPengadaanReviewTemplateProps> = ({
  detail = {},
  recentNotifications = [],
  unreadNotificationsCount = 0,
  navItems,
  confirmApproveOpen,
  rejectOpen,
  submitting,
  rejectError,
  flashError = '',
  previewDoc,
  onOpenConfirmApprove,
  onCloseConfirmApprove,
  onConfirmApprove,
  onOpenReject,
  onCloseReject,
  onConfirmReject,
  onSelectPreviewDoc,
}) => {
  const pengadaan = detail.pengadaan || { id: 0 };
  const makList: PpMakItem[] = detail.mak_list || [];
  const permohonan = pengadaan.permohonan || pengadaan.Permohonan || {};
  const unit = permohonan.unit || permohonan.Unit;
  const ppk = pengadaan.ppk || pengadaan.Ppk;
  const jenis = pengadaan.jenis || pengadaan.Jenis;
  const level = pengadaan.level || pengadaan.Level;
  const metode = pengadaan.metode || pengadaan.Metode;

  const formatCurrency = (val?: number | string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusBadge = (st?: string) => {
    switch (st) {
      case 'disetujui':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Disetujui PPK
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Ditolak PPK
          </span>
        );
      case 'diteruskan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Info className="w-3.5 h-3.5" />
            Terverifikasi oleh PP
          </span>
        );
      case 'menunggu_persetujuan':
      case 'menunggu_review':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Info className="w-3.5 h-3.5" />
            Menunggu Review PPK
          </span>
        );
    }
  };

  const perluReviewPp = Boolean(pengadaan.level?.perlu_review_pp);
  const canReview =
    pengadaan.status === 'diteruskan' ||
    (!perluReviewPp &&
      (pengadaan.status === 'menunggu_persetujuan' ||
        pengadaan.status === 'menunggu_review'));

  return (
    <AppLayout
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      roleInitials="PK"
      navItems={navItems}
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
    >
      <div className="space-y-6 pb-12">
        {flashError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-sm">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{flashError}</span>
            </div>
          </div>
        )}

        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/ppk/pengajuan"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
              title="Kembali ke Daftar Pengajuan"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Detail Pengadaan Menunggu Review
                </h1>
                {getStatusBadge(pengadaan.status)}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Tinjau kelengkapan berkas pengadaan sebelum memberikan otorisasi komitmen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/ppk/pengajuan"
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              Kembali
            </Link>
            {canReview && (
              <>
                <button
                  type="button"
                  onClick={onOpenReject}
                  disabled={submitting}
                  className="px-4 py-2.5 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Tolak Dokumen
                </button>
                <button
                  type="button"
                  onClick={onOpenConfirmApprove}
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Setujui Dokumen
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hero Card Ringkasan Pengadaan */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Nomor Surat Permohonan
                  </span>
                  <span className="text-sm font-semibold text-slate-900 block">
                    {permohonan.nomor_surat || '-'}
                  </span>
                  <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {permohonan.judul || 'Tanpa Judul'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Tanggal Pengajuan
                  </span>
                  <span className="text-sm font-semibold text-slate-900 block">
                    {formatDate(pengadaan.created_at || permohonan.created_at)}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Revisi Ke-{(pengadaan.revisi_ke ?? (permohonan as Record<string, unknown>).revisi_ke ?? 0) as number}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Nominal Paket Pengadaan
                  </span>
                  <span className="text-base font-bold text-emerald-600 block">
                    {formatCurrency(pengadaan.nominal)}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {level?.nama ? `Rentang: ${level.nama}` : 'Pagu Terverifikasi'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Unit Pemohon
                  </span>
                  <span className="text-sm font-semibold text-slate-900 block">
                    {unit?.nama || 'Unit Kerja Terkait'}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Metode: {metode?.nama || 'Sesuai Ketentuan'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rincian Tambahan */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
            <div className="flex items-center gap-3">
              <Tag className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-slate-400 block">Jenis Pengadaan</span>
                <span className="text-sm font-medium text-slate-800">
                  {jenis?.nama || 'Barang / Jasa'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <UserCheck className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-slate-400 block">Pejabat Pembuat Komitmen (PPK)</span>
                <span className="text-sm font-medium text-slate-800">
                  {ppk?.nama || (ppk as Record<string, unknown>)?.name as string || 'PPK Penanggung Jawab MAK'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Hash className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-slate-400 block">ID Paket Pengadaan</span>
                <span className="text-sm font-mono font-medium text-slate-800">
                  #{pengadaan.id || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Mata Anggaran Kegiatan (MAK) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Alokasi Mata Anggaran Kegiatan (MAK)
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              {makList.length} Akun Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-600 text-xs uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Kode & Nama MAK</th>
                  <th className="px-6 py-3.5">Keterangan</th>
                  <th className="px-6 py-3.5 text-right">Alokasi Anggaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {makList.length > 0 ? (
                  makList.map((mak, idx) => (
                    <tr key={mak.id || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 block">
                          {mak.nama}
                        </span>
                        {mak.kode && (
                          <span className="text-xs font-mono text-slate-500">
                            {mak.kode}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {((mak as unknown as Record<string, unknown>).keterangan as string) || 'Pembebanan Anggaran Pengadaan'}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {formatCurrency(((mak as unknown as Record<string, unknown>).alokasi_anggaran as number) || ((mak as unknown as Record<string, unknown>).nominal as number) || pengadaan.nominal)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                      Tidak ada rincian MAK khusus yang terlampir.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Dokumen Pengadaan & Berkas Legalitas */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Berkas Dokumen Pengadaan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Surat pengantar, draft SPK / Kontrak / Kwitansi, HPS, serta spesifikasi teknis dari PPBJ.
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
              {(detail.dokumen_pengadaan?.length || 0) + (detail.dokumen_permohonan?.length || 0)} Berkas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-600 text-xs uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Nama Dokumen</th>
                  <th className="px-6 py-3.5">Kategori / Tipe</th>
                  <th className="px-6 py-3.5">Format & Ukuran</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Dokumen Pengadaan */}
                {detail.dokumen_pengadaan && detail.dokumen_pengadaan.length > 0 ? (
                  detail.dokumen_pengadaan.map((doc: PpDokumenItem, idx: number) => {
                    const docInfo: PpDocumentPreviewInfo = {
                      label: doc.nama_asli || 'Dokumen Pengadaan',
                      category: doc.tipe_dokumen || 'Berkas Pengadaan',
                      filename: doc.nama_asli || 'dokumen.pdf',
                      size: doc.ukuran_bytes ? `${Math.round(doc.ukuran_bytes / 1024)} KB` : 'PDF',
                      fileUrl: doc.download_url || `/api/v1/ppk/dokumen/${doc.id}/download`,
                      downloadUrl: doc.download_url || `/api/v1/ppk/dokumen/${doc.id}/download`,
                      download_url: doc.download_url || `/api/v1/ppk/dokumen/${doc.id}/download`,
                    };

                    return (
                      <tr key={`pengadaan-${doc.id || idx}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block">
                                {doc.nama_asli || `Dokumen Pengadaan #${idx + 1}`}
                              </span>
                              <span className="text-xs text-slate-400">
                                Diunggah oleh Tim PPBJ
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {doc.tipe_dokumen ? doc.tipe_dokumen.replace(/_/g, ' ').toUpperCase() : 'BERKAS PENGADAAN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {doc.mime_type || 'application/pdf'} • {docInfo.size}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onSelectPreviewDoc(docInfo)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Pratinjau
                            </button>
                            <a
                              href={docInfo.downloadUrl}
                              download
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Unduh Berkas"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : null}

                {/* Dokumen Permohonan Terkait */}
                {detail.dokumen_permohonan && detail.dokumen_permohonan.length > 0 ? (
                  detail.dokumen_permohonan.map((doc: PpDokumenItem, idx: number) => {
                    const docInfo: PpDocumentPreviewInfo = {
                      label: doc.nama_asli || 'Dokumen Permohonan Induk',
                      category: 'Permohonan Induk',
                      filename: doc.nama_asli || 'dokumen_permohonan.pdf',
                      size: doc.ukuran_bytes ? `${Math.round(doc.ukuran_bytes / 1024)} KB` : 'PDF',
                      fileUrl: doc.download_url || `/api/v1/ppk/dokumen/${doc.id}/download`,
                      downloadUrl: doc.download_url || `/api/v1/ppk/dokumen/${doc.id}/download`,
                      download_url: doc.download_url || `/api/v1/ppk/dokumen/${doc.id}/download`,
                    };

                    return (
                      <tr key={`permohonan-${doc.id || idx}`} className="hover:bg-slate-50/50 transition-colors bg-slate-50/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block">
                                {doc.nama_asli || `Dokumen Pemohon #${idx + 1}`}
                              </span>
                              <span className="text-xs text-slate-400">
                                Berkas Permohonan Awal
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            PERMOHONAN INDUK
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {doc.mime_type || 'application/pdf'} • {docInfo.size}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onSelectPreviewDoc(docInfo)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Pratinjau
                            </button>
                            <a
                              href={docInfo.downloadUrl}
                              download
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Unduh Berkas"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : null}

                {(!detail.dokumen_pengadaan || detail.dokumen_pengadaan.length === 0) &&
                  (!detail.dokumen_permohonan || detail.dokumen_permohonan.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-medium">Belum ada dokumen pengadaan yang dilampirkan.</p>
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Bottom Card */}
        {canReview ? (
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-lg font-bold">Otorisasi Komitmen Pengadaan</h3>
              <p className="text-sm text-indigo-200 max-w-xl">
                Dengan menyetujui, Anda memberikan otorisasi komitmen anggaran atas paket pengadaan ini kepada tim PPBJ untuk dieksekusi.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-center">
              <button
                type="button"
                onClick={onOpenReject}
                disabled={submitting}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-rose-300 font-semibold text-sm transition-colors border border-white/10 inline-flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Tolak Dokumen
              </button>
              <button
                type="button"
                onClick={onOpenConfirmApprove}
                disabled={submitting}
                className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors shadow-md inline-flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Setujui Dokumen
              </button>
            </div>
          </div>
        ) : pengadaan.status === 'draft' ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-700 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-slate-500 shrink-0" />
            <div>
              <strong className="block font-semibold text-slate-900">Dokumen Masih Berstatus Draft</strong>
              <span className="text-xs text-slate-500">
                Paket pengadaan ini belum diajukan oleh PPBJ ke reviewer. Otorisasi komitmen hanya dapat dilakukan setelah paket diajukan.
              </span>
            </div>
          </div>
        ) : perluReviewPp && (pengadaan.status === 'menunggu_persetujuan' || pengadaan.status === 'menunggu_review') ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-800 flex items-center gap-3 text-sm">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="block font-semibold text-amber-900">Menunggu Verifikasi Administratif PP</strong>
              <span className="text-xs text-amber-700">
                Dokumen pengadaan sedang dalam verifikasi oleh Pejabat Pengadaan (PP). Tombol otorisasi komitmen PPK akan aktif setelah PP menyetujui dokumen ini.
              </span>
            </div>
          </div>
        ) : pengadaan.status === 'ditolak' ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700 flex items-center gap-3 text-sm">
            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <strong className="block font-semibold text-rose-900">Dokumen Telah Ditolak</strong>
              <span className="text-xs text-rose-600">
                Dokumen pengadaan ini telah ditolak dan dikembalikan ke PPBJ untuk diperbaiki.
              </span>
            </div>
          </div>
        ) : pengadaan.status === 'disetujui' || pengadaan.status === 'selesai' ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-800 flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="block font-semibold text-emerald-900">Dokumen Telah Diotorisasi</strong>
              <span className="text-xs text-emerald-700">
                Dokumen pengadaan ini telah diotorisasi komitmen oleh PPK dan diteruskan ke PPBJ untuk pembuatan kontrak.
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Modal Dialogs */}
      <KonfirmasiApproveModal
        isOpen={confirmApproveOpen}
        onClose={onCloseConfirmApprove}
        onConfirm={onConfirmApprove}
        pengadaan={{
          nominal: pengadaan.nominal,
          permohonan: {
            nomor_surat: permohonan.nomor_surat,
            judul: permohonan.judul,
          },
        }}
        isSubmitting={submitting}
      />

      <TolakPengadaanModal
        isOpen={rejectOpen}
        onClose={onCloseReject}
        onConfirm={onConfirmReject}
        pengadaan={{
          permohonan: {
            nomor_surat: permohonan.nomor_surat,
          },
        }}
        isSubmitting={submitting}
        error={rejectError}
      />

      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => onSelectPreviewDoc(null)}
        label={previewDoc?.label || previewDoc?.category}
        category={previewDoc?.category}
        filename={previewDoc?.filename}
        size={previewDoc?.size}
        downloadUrl={previewDoc?.downloadUrl || previewDoc?.download_url}
      />
    </AppLayout>
  );
};

export default PpkPengadaanReviewTemplate;
