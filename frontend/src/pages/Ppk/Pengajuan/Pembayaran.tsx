import { useState, useRef, useEffect, type FC, type FormEvent } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
  Info,
  Hash,
  Image as ImageIcon,
  Upload,
  X,
} from 'lucide-react';
import api from '../../../services/api';
import PpLayout from '../../../components/templates/PpLayout';
import DokumentasiGalleryModal from '../../../components/organisms/DokumentasiGalleryModal';
import DocumentPreviewModal from '../../../components/organisms/DocumentPreviewModal';
import { PPK_NAV_ITEMS } from '../Dashboard';

export interface PpkPembayaranProps {
  detail?: any;
  recentNotifications?: any[];
  unreadNotificationsCount?: number;
}

export const PpkPengajuanPembayaran: FC<PpkPembayaranProps> = ({
  detail: initialDetail,
  recentNotifications = [],
  unreadNotificationsCount = 0,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<any>(initialDetail || {});
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [memoFile, setMemoFile] = useState<string>('Memo_Persetujuan_Pembayaran.pdf');
  const [alasanTolak, setAlasanTolak] = useState('');
  const [alasanError, setAlasanError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialDetail && id) {
      api
        .get<{ detail?: any; data?: any }>(`/v1/ppk/pengajuan/${id}/pembayaran`)
        .then((res) => {
          setDetail(res.data.detail || res.data.data || res.data);
        })
        .catch((err) => {
          console.error('Failed to fetch PPK pembayaran:', err);
        });
    }
  }, [id, initialDetail]);

  const { pengadaan = {}, mak_list = [] } = detail;
  const permohonan = pengadaan?.permohonan || {};

  const nomorSurat = permohonan.nomor_surat || '111-FFF-111';
  const judulPermohonan = permohonan.judul || 'Pengadaan Komputer';
  const unitNama = permohonan.unit?.nama || 'Jurusan Teknik Informatika & Komputer';
  const nominalNilai = pengadaan.nilai_kontrak || permohonan.nominal || 100000000;

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 100000000);
  };

  const formatDate = (dateString?: string, fallback = '04 Maret 2027') => {
    if (!dateString) return fallback;
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleApproveSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/v1/ppk/pengajuan/${pengadaan.id || id}/pembayaran/approve`, {
        filename: memoFile || `Memo_Persetujuan_${nomorSurat.replace(/\//g, '-')}.pdf`,
      });
      setApproveModalOpen(false);
      navigate('/ppk/pengajuan');
    } catch (err) {
      console.error('Failed to approve payment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!alasanTolak || alasanTolak.trim().length < 5) {
      setAlasanError('Catatan penolakan wajib diisi minimal 5 karakter.');
      return;
    }
    setAlasanError('');
    setSubmitting(true);
    try {
      await api.post(`/v1/ppk/pengajuan/${pengadaan.id || id}/pembayaran/reject`, {
        alasan: alasanTolak,
      });
      setRejectModalOpen(false);
      navigate('/ppk/pengajuan');
    } catch (err) {
      console.error('Failed to reject payment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const paymentFiles = [
    {
      id: 'pay-1',
      label: 'Dokumen Pembayaran',
      filename: 'Dokumen_Pembayaran_Komputer_TIK.pdf',
      meta: 'Dokumen Pembayaran • PDF • 2 MB',
    },
    {
      id: 'pay-2',
      label: 'BAP (Berita Acara Pembayaran)',
      filename: 'BAP_Pembayaran_Komputer_TIK.pdf',
      meta: 'Berita Acara • PDF • 1 MB',
    },
  ];

  const renderDocBox = (doc: {
    id: string;
    label: string;
    filename: string;
    size: string;
    withGallery?: boolean;
  }) => (
    <div key={doc.id || doc.label} className="p-5 rounded-2xl border border-[#E3EAE6] bg-white shadow-2xs">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-[#FDE6E4] text-[#D92D20] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#0F6A49]">{doc.label}</p>
            <p className="text-sm font-semibold text-[#0E1B16] truncate mt-0.5">{doc.filename}</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">{doc.size}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPreviewDoc(doc)}
          className="w-10 h-10 rounded-xl border border-[#CBD6D0] bg-white hover:bg-[#F4F7F5] text-[#3F4E47] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          title={`Unduh ${doc.label}`}
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {doc.withGallery ? (
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={() => setPreviewDoc(doc)}
            className="py-3 px-4 rounded-xl border border-[#CBD6D0] bg-white hover:bg-[#F4F9F6] text-xs font-semibold text-[#0F6A49] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Lihat Dokumen</span>
          </button>
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="py-3 px-4 rounded-xl border border-[#CBD6D0] bg-white hover:bg-[#F4F9F6] text-xs font-semibold text-[#0F6A49] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Lihat Foto</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPreviewDoc(doc)}
          className="w-full mt-4 py-3 px-4 rounded-xl border border-[#CBD6D0] bg-white hover:bg-[#F4F9F6] text-xs font-semibold text-[#0F6A49] flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>Lihat Dokumen</span>
        </button>
      )}
    </div>
  );

  return (
    <PpLayout
      activeRoute="pengajuan"
      navItems={PPK_NAV_ITEMS}
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      profileHref="/ppk/profil"
      notifikasiHref="/ppk/notifikasi"
      readAllHref="/ppk/notifikasi/read-all"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      breadcrumb={[
        { label: 'LIST PENGAJUAN', href: '/ppk/pengajuan' },
        { label: 'DETAIL DOKUMEN PEMBAYARAN' },
      ]}
    >
      {/* Hero Top Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0A5C42] to-[#17A373] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/75 block mb-2">
              PEMBAYARAN
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight leading-9">
                Detail Dokumen Pembayaran
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF7F1] text-[#16825C]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16825C]" />
                Review Pembayaran
              </span>
            </div>
            <p className="text-sm text-white/85 mt-2">
              Nomor {nomorSurat} · Diajukan {formatDate(permohonan.created_at)}
            </p>
          </div>

          <Link
            to="/ppk/pengajuan"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-[14px] bg-white/16 hover:bg-white/25 border border-white/35 text-white text-sm font-semibold transition-colors shrink-0 self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
        </div>
        <div
          className="absolute -right-10 -top-24 w-[260px] h-[260px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute right-24 -bottom-20 w-[170px] h-[170px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Card 1: Informasi Permohonan */}
      <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)] mb-6">
        <div className="mb-6 pb-4 border-b border-[#E3EAE6]">
          <h3 className="text-lg font-bold text-[#0E1B16]">Informasi Permohonan</h3>
          <p className="text-xs text-[#6B7A73] mt-0.5">Ringkasan data yang diajukan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
          <div className="flex items-center gap-3.5 pb-4 border-b border-[#E3EAE6]">
            <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-[#6B7A73]">Nomor Permohonan</p>
              <p className="font-semibold text-sm text-[#0F6A49] mt-0.5">{nomorSurat}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pb-4 border-b border-[#E3EAE6]">
            <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-[#6B7A73]">Tanggal Pengajuan</p>
              <p className="font-semibold text-sm text-[#0E1B16] mt-0.5">
                {formatDate(permohonan.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pb-4 border-b border-[#E3EAE6]">
            <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-[#6B7A73]">Judul Permohonan</p>
              <p className="font-semibold text-sm text-[#0E1B16] mt-0.5">{judulPermohonan}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pb-4 border-b border-[#E3EAE6]">
            <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-[#6B7A73]">Diajukan Oleh</p>
              <p className="font-semibold text-sm text-[#0E1B16] mt-0.5">{unitNama}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-[#6B7A73]">Nominal Nilai Pengadaan</p>
              <p className="font-semibold text-sm text-[#0E1B16] mt-0.5">
                {formatCurrency(nominalNilai)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-[#6B7A73]">Status</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8] mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                Review Pembayaran
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dokumen Sebelumnya */}
      <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)] mb-6">
        <div className="mb-6 pb-4 border-b border-[#E3EAE6]">
          <h3 className="text-lg font-bold text-[#0E1B16]">Dokumen Sebelumnya</h3>
          <p className="text-xs text-[#6B7A73] mt-0.5">
            Dokumen dari tahapan sebelumnya yang telah disetujui
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {renderDocBox({
            id: 'prev-1',
            label: 'Surat Permohonan',
            filename: `Surat_Permohonan_${nomorSurat}.pdf`,
            size: 'PDF • 8 MB',
          })}
          {renderDocBox({
            id: 'prev-2',
            label: 'Dokumen Pengadaan',
            filename: `Dokumen_Pengadaan_${nomorSurat}.pdf`,
            size: 'PDF • 5 MB',
          })}
        </div>

        <div className="px-4 py-3 rounded-xl bg-[#EBF7F1] border border-[#DDF3E6] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white text-[#0F6A49] flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="text-xs font-medium text-[#3F4E47]">Jenis MAK dari Perencanaan</p>
            <div className="font-semibold text-sm text-[#0E1B16] mt-0.5 space-y-0.5">
              {mak_list.length > 0 ? (
                mak_list.map((m: any) => (
                  <p key={m.id}>
                    {m.kode || m.id} · {m.nama}
                  </p>
                ))
              ) : (
                <p>532111 · Belanja Modal Peralatan dan Mesin</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Body: Dokumen Pembayaran + Keputusan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)]">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-[#0E1B16]">Dokumen Pembayaran</h3>
              <p className="text-xs text-[#6B7A73] mt-0.5">
                Pratinjau dokumen pembayaran yang diunggah PPBJ
              </p>
            </div>

            <div className="space-y-4">
              {paymentFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-4 rounded-[14px] bg-[#F5F8F6] border border-[#E3EAE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-[#FDE6E4] text-[#D92D20] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0E1B16] truncate">{file.filename}</p>
                      <p className="text-xs text-[#6B7A73] mt-1">{file.meta}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewDoc({
                          label: file.label,
                          filename: file.filename,
                          size: file.meta,
                        })
                      }
                      className="px-4 py-3 rounded-xl border border-[#CBD6D0] bg-white hover:bg-[#F4F7F5] text-sm font-semibold text-[#3F4E47] inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Lihat</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)]">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-[#0E1B16]">Keputusan PPK</h3>
              <p className="text-xs text-[#6B7A73] mt-0.5">
                Tinjau dokumen pembayaran sebelum menandatangani persetujuan
              </p>
            </div>

            <div className="p-4 rounded-[14px] bg-[#F5F8F6] border border-[#E3EAE6] flex items-start gap-2.5 mb-6 text-xs text-[#3F4E47]">
              <Info className="w-4 h-4 text-[#3F4E47] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Persetujuan PPK akan meneruskan dokumen pembayaran ke Bidang 2 untuk verifikasi
                akhir pencairan dana.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRejectModalOpen(true)}
                className="py-3 px-3 rounded-xl border border-[#FECDCA] bg-[#FEE4E2]/70 hover:bg-[#FEE4E2] text-xs font-bold text-[#D92D20] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                <span>Tolak Pembayaran</span>
              </button>
              <button
                type="button"
                onClick={() => setApproveModalOpen(true)}
                className="py-3 px-3 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Setujui Pembayaran</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Unggah Memo Persetujuan */}
      {approveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <form
            onSubmit={handleApproveSubmit}
            className="bg-white rounded-[24px] border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)] w-full max-w-[520px] p-8 flex flex-col gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-[14px] bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#0E1B16]">Unggah Memo Persetujuan</h3>
                <p className="text-xs text-[#6B7A73] mt-0.5">
                  Lampirkan memo untuk menyetujui dokumen pembayaran
                </p>
              </div>
              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                className="text-[#6B7A73] hover:text-[#0E1B16] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setMemoFile(file.name);
              }}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-[14px] bg-[#F5F8F6] border-[1.5px] border-dashed border-[#E3EAE6] hover:border-[#16825C] px-6 py-7 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition"
            >
              <div className="w-12 h-12 rounded-[14px] bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#0E1B16]">{memoFile}</p>
              <p className="text-xs text-[#6B7A73]">Klik untuk ganti file PDF (maks. 10 MB)</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                className="px-5 py-3 rounded-xl border border-[#CBD6D0] text-sm font-semibold text-[#3F4E47] hover:bg-[#F4F7F5] transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-3 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-sm font-semibold text-white transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Menyimpan...' : 'Setujui & Teruskan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Tolak */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <form
            onSubmit={handleRejectSubmit}
            className="bg-white rounded-[24px] border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)] w-full max-w-[500px] p-8 flex flex-col gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-[14px] bg-[#FDE6E4] text-[#D92D20] flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#0E1B16]">Tolak Dokumen Pembayaran</h3>
                <p className="text-xs text-[#6B7A73] mt-0.5">
                  Berikan alasan penolakan untuk dikoreksi kembali
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="text-[#6B7A73] hover:text-[#0E1B16] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0E1B16] mb-2">
                Alasan Penolakan
              </label>
              <textarea
                rows={4}
                value={alasanTolak}
                onChange={(e) => setAlasanTolak(e.target.value)}
                placeholder="Tuliskan catatan perbaikan dokumen pembayaran..."
                className="w-full p-3 rounded-xl border border-[#CBD6D0] text-xs text-[#0E1B16] focus:outline-none focus:ring-1 focus:ring-[#0E7C5A]"
              />
              {alasanError && <p className="text-xs text-red-600 mt-1">{alasanError}</p>}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-5 py-3 rounded-xl border border-[#CBD6D0] text-sm font-semibold text-[#3F4E47] hover:bg-[#F4F7F5] transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-3 rounded-xl bg-[#D92D20] hover:bg-[#B42318] text-sm font-semibold text-white transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Memproses...' : 'Tolak Pembayaran'}
              </button>
            </div>
          </form>
        </div>
      )}

      <DokumentasiGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        judul={judulPermohonan}
        unitName={unitNama}
        totalPhotos={4}
      />

      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        category={previewDoc?.label || previewDoc?.category}
        filename={previewDoc?.filename}
        size={previewDoc?.size}
      />
    </PpLayout>
  );
};

export default PpkPengajuanPembayaran;
