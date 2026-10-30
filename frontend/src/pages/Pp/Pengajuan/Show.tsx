import { useState, useEffect, type FC } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  Activity,
  Banknote,
  Eye,
  Download,
  Tag,
  Hash,
  Image as ImageIcon,
} from 'lucide-react';
import api from '../../../services/api';
import PpLayout, { type PpNavItem } from '../../../components/templates/PpLayout';
import DokumentasiGalleryModal from '../../../components/organisms/DokumentasiGalleryModal';

interface DocumentCardProps {
  category: string;
  filename: string;
  size?: string;
  onView?: () => void;
  onDownload?: () => void;
}

function DocumentCard({
  category,
  filename,
  size = 'PDF • 2 MB',
  onView,
  onDownload,
}: DocumentCardProps) {
  return (
    <div className="p-4 rounded-2xl border border-[#E4EBE8] bg-white flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#0E7C5A]">{category}</p>
            <p className="text-xs font-bold text-[#14201C] truncate mt-0.5">{filename}</p>
            <p className="text-[11px] text-[#8A9A95]">{size}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDownload}
          className="w-9 h-9 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F7F5] text-[#5F6F6A] flex items-center justify-center shrink-0 cursor-pointer"
          title={`Unduh ${category}`}
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onView}
        className="w-full mt-3.5 py-2.5 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F9F6] text-xs font-bold text-[#0E7C5A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>Lihat Dokumen</span>
      </button>
    </div>
  );
}

export interface PpShowProps {
  detail?: any;
  recentNotifications?: any[];
  unreadNotificationsCount?: number;
  basePath?: string;
  roleInitials?: string;
  roleTitle?: string | null;
  roleSubtitle?: string | null;
  navItems?: PpNavItem[] | null;
}

export const PpPengajuanShow: FC<PpShowProps> = ({
  detail: initialDetail,
  recentNotifications = [],
  unreadNotificationsCount = 0,
  basePath = '/pp',
  roleInitials = 'PP',
  roleTitle = null,
  roleSubtitle = null,
  navItems = null,
}) => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<any>(initialDetail || {});
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    if (!initialDetail && id) {
      api
        .get<{ detail?: any; data?: any }>(`${basePath}/pengajuan/${id}`)
        .then((res) => {
          setDetail(res.data.detail || res.data.data || res.data);
        })
        .catch((err) => {
          console.error('Failed to fetch pengajuan detail:', err);
        });
    }
  }, [id, initialDetail, basePath]);

  const { pengadaan = {}, mak_list = [] } = detail;
  const permohonan = pengadaan?.permohonan || {};
  const kontrak = pengadaan?.kontrak;
  const penerimaan = pengadaan?.penerimaan;

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateString?: string, fallback = '04 Maret 2027') => {
    if (!dateString) return fallback;
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const nomorSurat = permohonan.nomor_surat || '111-FFF-111';
  const judulPermohonan = permohonan.judul || 'Pengadaan Komputer';
  const unitNama = permohonan.unit?.nama || 'Jurusan Teknik Informatika & Komputer';

  return (
    <PpLayout
      activeRoute="pengajuan"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      roleInitials={roleInitials}
      roleTitle={roleTitle}
      roleSubtitle={roleSubtitle}
      navItems={navItems}
      profileHref={`${basePath}/profil`}
      notifikasiHref={`${basePath}/notifikasi`}
      readAllHref={`${basePath}/notifikasi/read-all`}
      breadcrumb={[
        { label: 'LIST PENGAJUAN', href: `${basePath}/pengajuan` },
        { label: 'REKAP PENGAJUAN' },
      ]}
    >
      {/* Hero Top Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-7 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 block mb-1">
              ARSIP PENGAJUAN
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight">
                Rekap Pengajuan
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12A06B]" />
                Selesai
              </span>
            </div>
            <p className="text-xs text-white/85 mt-1.5">
              Nomor {nomorSurat} · Diajukan {formatDate(permohonan.created_at)} · Seluruh tahapan selesai
            </p>
          </div>

          <Link
            to={`${basePath}/pengajuan`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold transition-colors shrink-0 self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
        </div>
        <div
          className="absolute -right-10 -top-20 w-[260px] h-[260px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute right-28 -bottom-20 w-[180px] h-[180px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Ringkasan Header Card */}
      <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] mb-6">
        <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
          <h3 className="text-base font-bold text-[#14201C]">Informasi Permohonan</h3>
          <p className="text-xs text-[#8A9A95] mt-0.5">Ringkasan data yang diajukan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-xs">
          <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Nomor Permohonan</p>
              <p className="font-bold text-[#0E7C5A] text-[13px] mt-0.5">{nomorSurat}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Tanggal Pengajuan</p>
              <p className="font-bold text-[#14201C] text-[13px] mt-0.5">
                {formatDate(permohonan.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Judul Permohonan</p>
              <p className="font-bold text-[#14201C] text-[13px] mt-0.5">{judulPermohonan}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Diajukan Oleh</p>
              <p className="font-bold text-[#14201C] text-[13px] mt-0.5">{unitNama}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Nominal/Estimasi</p>
              <p className="font-bold text-[#14201C] text-[13px] mt-0.5">
                {formatCurrency(pengadaan.nominal)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Status</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E] mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12A06B]" />
                Selesai
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Stages Lifecycle Cards */}
      <div className="space-y-6">
        {/* 1. Permohonan */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
            <h3 className="text-base font-bold text-[#14201C]">1. Permohonan</h3>
            <p className="text-xs text-[#8A9A95] mt-0.5">
              Surat permohonan awal dari Pemohon, jenis MAK dari Perencanaan, dan memo persetujuan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <DocumentCard
              category="Surat Permohonan"
              filename={`Surat_Permohonan_${nomorSurat}.pdf`}
              size="PDF • 8 MB"
            />
            <DocumentCard
              category="Memo Persetujuan"
              filename={`Memo_Persetujuan_${nomorSurat}.pdf`}
              size="PDF • 1 MB"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[#EAF6F1] flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-white text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs">
              <Tag className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="text-[11px] font-semibold text-[#0E7C5A]">Jenis MAK dari Perencanaan</p>
              <div className="font-bold text-[#14201C] mt-0.5 space-y-0.5">
                {mak_list.length > 0 ? (
                  mak_list.map((m: any) => (
                    <p key={m.id}>
                      {m.kode || m.id} – {m.nama}
                    </p>
                  ))
                ) : (
                  <p>532111 – Belanja Modal Peralatan dan Mesin</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Pengadaan */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
            <h3 className="text-base font-bold text-[#14201C]">2. Pengadaan</h3>
            <p className="text-xs text-[#8A9A95] mt-0.5">
              Dokumen pengadaan dan persetujuan pengadaan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <DocumentCard
              category="Dokumen Pengadaan"
              filename={`Dokumen_Pengadaan_${nomorSurat}.pdf`}
              size="PDF • 5 MB"
            />
            <DocumentCard
              category="Persetujuan Dokumen Pengadaan"
              filename={`Persetujuan_Dokumen_${nomorSurat}.pdf`}
              size="PDF • 1 MB · Disetujui PP & PPK"
            />
          </div>
        </div>

        {/* 3. Kontrak dan Pembelian */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
            <h3 className="text-base font-bold text-[#14201C]">3. Kontrak dan Pembelian</h3>
            <p className="text-xs text-[#8A9A95] mt-0.5">
              Dokumen hasil negosiasi, SPK, dan surat pesanan pengadaan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentCard
              category="Hasil Negosiasi"
              filename="Hasil_Negosiasi.pdf"
              size="PDF • 2 MB"
            />
            <DocumentCard
              category="SPK"
              filename="SPK.pdf"
              size="PDF • 1 MB"
            />
            <DocumentCard
              category="Surat Pesanan"
              filename="Surat_Pesanan.pdf"
              size="PDF • 3 MB"
            />
            <div className="p-5 rounded-2xl bg-[#EAF6F1] flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-white text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="text-[11px] font-semibold text-[#0E7C5A]">Informasi Kontrak</p>
                <p className="font-bold text-[#14201C] mt-0.5">
                  {formatDate(kontrak?.tanggal, '14 Maret 2027')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Penerimaan Barang */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
            <h3 className="text-base font-bold text-[#14201C]">4. Penerimaan Barang</h3>
            <p className="text-xs text-[#8A9A95] mt-0.5">
              Berita acara dan dokumentasi penerimaan barang dari Perlengkapan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-[#E4EBE8] bg-white flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[#0E7C5A]">
                      Berita Acara &amp; Dokumentasi Penerimaan Barang
                    </p>
                    <p className="text-xs font-bold text-[#14201C] truncate mt-0.5">
                      Penerimaan_Barang.pdf
                    </p>
                    <p className="text-[11px] text-[#8A9A95]">PDF • 4 MB • 4 foto terlampir</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mt-3.5">
                <button
                  type="button"
                  className="py-2.5 px-3 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F9F6] text-xs font-bold text-[#0E7C5A] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Berita Acara</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryOpen(true)}
                  className="py-2.5 px-3 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F9F6] text-xs font-bold text-[#0E7C5A] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Lihat Foto (4)</span>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#EAF6F1] flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-white text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="text-[11px] font-semibold text-[#0E7C5A]">Penerimaan Barang</p>
                <p className="font-bold text-[#14201C] mt-0.5">
                  {formatDate(penerimaan?.tanggal_terima, '25 Maret 2027')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Pembayaran */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
            <h3 className="text-base font-bold text-[#14201C]">5. Pembayaran</h3>
            <p className="text-xs text-[#8A9A95] mt-0.5">
              Dokumen pembayaran dari Keuangan, memo persetujuan pembayaran, dan bukti pencairan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentCard
              category="Dokumen Pembayaran"
              filename="Dokumen_Pembayaran.pdf"
              size="PDF • 2 MB"
            />
            <DocumentCard
              category="Memo Persetujuan PPK"
              filename={`Memo_Pembayaran_PPK_${nomorSurat}.pdf`}
              size="PDF • 1 MB"
            />
            <DocumentCard
              category="Memo Persetujuan Bidang 2"
              filename={`Memo_Pembayaran_Bidang2_${nomorSurat}.pdf`}
              size="PDF • 1 MB"
            />
            <DocumentCard
              category="Bukti Pencairan"
              filename="Bukti_Pencairan.pdf"
              size="PDF • 1 MB"
            />
          </div>
        </div>
      </div>

      <DokumentasiGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        judul={judulPermohonan}
        unitName={unitNama}
        totalPhotos={4}
      />
    </PpLayout>
  );
};

export default PpPengajuanShow;
