import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Edit,
  FileCheck2,
  Lock,
} from 'lucide-react';
import AppLayout, { type AppTopbarUser } from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatusPill from '../../atoms/StatusPill';
import DokumenListCard from '../../organisms/DokumenListCard';
import DocumentPreviewModal from '../../organisms/DocumentPreviewModal';
import CatatanPenolakanCard from '../../molecules/CatatanPenolakanCard';
import KontrakVendorCard from '../../molecules/KontrakVendorCard';
import KontrakVendorFormModal from '../../organisms/KontrakVendorFormModal';
import EditPengadaanModal from '../../organisms/EditPengadaanModal';
import { PPBJ_NAV_ITEMS } from '../../../constants/ppbjNav';
import { formatRupiah } from '../../../utils/formatters';
import type {
  PpbjPengadaanDetail,
  PpbjSimpanKontrakPayload,
  PpbjUpdateKlasifikasiPayload,
} from '../../../types/ppbj';
import type { DokumenItem } from '../../../types/dokumen';

export interface PpbjPengadaanShowTemplateProps {
  user?: AppTopbarUser | null;
  pengadaan?: PpbjPengadaanDetail | null;
  dokumenList?: DokumenItem[];
  isLoading?: boolean;
  flash?: {
    success?: string;
    error?: string;
  };
  isEditKlasifikasiOpen?: boolean;
  isKontrakModalOpen?: boolean;
  onOpenEditKlasifikasi?: () => void;
  onCloseEditKlasifikasi?: () => void;
  onOpenKontrakModal?: () => void;
  onCloseKontrakModal?: () => void;
  onSubmitEditKlasifikasi?: (payload: PpbjUpdateKlasifikasiPayload) => Promise<void> | void;
  onSubmitKontrak?: (payload: PpbjSimpanKontrakPayload) => Promise<void> | void;
  onViewDokumen?: (doc: DokumenItem) => void;
  onDownloadDokumen?: (doc: DokumenItem) => void;
  previewBlobUrl?: string | null;
  previewDocId?: number | string | null;
  isLoadingPreview?: boolean;
  onClosePreview?: () => void;
}

export const PpbjPengadaanShowTemplate: FC<PpbjPengadaanShowTemplateProps> = ({
  user = null,
  pengadaan = null,
  dokumenList = [],
  isLoading = false,
  flash = {},
  isEditKlasifikasiOpen = false,
  isKontrakModalOpen = false,
  onOpenEditKlasifikasi,
  onCloseEditKlasifikasi,
  onOpenKontrakModal,
  onCloseKontrakModal,
  onSubmitEditKlasifikasi,
  onSubmitKontrak,
  onViewDokumen,
  onDownloadDokumen,
  previewBlobUrl = null,
  previewDocId = null,
  isLoadingPreview: _isLoadingPreview = false,
  onClosePreview,
}) => {
  const navigate = useNavigate();

  const isDitolak = pengadaan?.status === 'ditolak';
  const latestRejection = pengadaan?.approvals?.find((a) => a.keputusan === 'ditolak');

  return (
    <AppLayout
      activeRoute="pengadaan"
      navItems={PPBJ_NAV_ITEMS}
      roleInitials="PB"
      roleTitle="PPBJ"
      roleSubtitle="Pengadaan Barang & Jasa"
      user={user}
      breadcrumb={[
        { label: 'DASHBOARD', href: '/ppbj/dashboard' },
        { label: 'DAFTAR PENGADAAN', href: '/ppbj/pengadaan' },
        { label: pengadaan ? `PENGADAAN #${pengadaan.id}` : 'DETAIL PENGADAAN' },
      ]}
    >
      <div className="space-y-6">
        {/* Flash Notifications */}
        {flash.success && (
          <div className="p-4 rounded-2xl bg-[#EBF7F2] border border-[#D0EAE0] flex items-center gap-3 text-sm font-semibold text-[#0E7C5A]">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{flash.success}</span>
          </div>
        )}
        {flash.error && (
          <div className="p-4 rounded-2xl bg-[#FEF3F2] border border-[#FECDCA] flex items-center gap-3 text-sm font-semibold text-[#B42318]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{flash.error}</span>
          </div>
        )}

        {isLoading || !pengadaan ? (
          <div className="bg-white rounded-2xl border border-[#E4EBE8] p-16 text-center shadow-xs">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-[#5F6F6A]">Memuat detail pengadaan...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Banner */}
            <HeroBanner
              eyebrow="PENGADAAN BARANG & JASA"
              title={
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xl md:text-2xl font-bold tracking-tight text-white">
                    Pengadaan #{pengadaan.id}
                  </span>
                  <StatusPill
                    status={pengadaan.status}
                    label={pengadaan.status === 'disetujui' ? 'Review PPBJ' : undefined}
                  />
                  {pengadaan.revisi_ke > 0 && (
                    <span className="inline-flex items-center text-xs font-semibold text-[#B54708] bg-[#FEF6EE] border border-[#FECDCA] px-2 py-0.5 rounded-full">
                      Revisi ke-{pengadaan.revisi_ke}
                    </span>
                  )}
                </div>
              }
              description={`Asal Permohonan: ${pengadaan.permohonan?.nomor_surat || '-'} · ${pengadaan.permohonan?.judul || '-'}`}
              ctaLabel="Kembali"
              ctaIcon={ArrowLeft}
              ctaVariant="translucent"
              onCta={() => navigate('/ppbj/pengadaan')}
            />

            {/* Catatan Penolakan (bila status ditolak) */}
            {isDitolak && latestRejection && (
              <CatatanPenolakanCard
                catatan={{
                  alasan: latestRejection.catatan || 'Dokumen pengadaan memerlukan perbaikan.',
                  pemeriksa_nama: latestRejection.actor_nama,
                  pemeriksa_peran: latestRejection.tahap,
                  diperiksa_at: latestRejection.created_at || null,
                }}
              />
            )}

            {/* Card 1: Informasi Paket & Klasifikasi */}
            <section className="bg-white rounded-[22px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.05)] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-5 border-b border-[#F0F4F2] gap-3">
                <div>
                  <h2 className="text-base font-bold text-[#14201C]">
                    Klasifikasi Paket Pengadaan
                  </h2>
                  <p className="text-xs text-[#5F6F6A] mt-0.5">
                    Detail alokasi anggaran, metode, jenis, dan level pengadaan
                  </p>
                </div>

                {pengadaan.bisa_edit_draft && onOpenEditKlasifikasi && (
                  <button
                    type="button"
                    onClick={onOpenEditKlasifikasi}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl border border-[#0E7C5A] text-[#0E7C5A] hover:bg-[#F7FBF9] text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Perbarui Klasifikasi</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-8 text-xs">
                <div>
                  <span className="block text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider mb-1">
                    Nomor & Asal Permohonan
                  </span>
                  <p className="text-sm font-bold text-[#14201C]">
                    {pengadaan.permohonan?.nomor_surat || '-'}
                  </p>
                  <p className="text-xs text-[#5F6F6A] mt-0.5">
                    {pengadaan.permohonan?.unit_nama || '-'}
                  </p>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider mb-1">
                    Nilai Alokasi Pengadaan
                  </span>
                  <p className="text-base font-extrabold text-[#0E7C5A] tabular-nums">
                    {formatRupiah(pengadaan.nominal)}
                  </p>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider mb-1">
                    Mata Anggaran (MAK)
                  </span>
                  <p className="text-sm font-semibold text-[#14201C]">
                    {pengadaan.mak?.nama || '-'}
                  </p>
                  <p className="text-xs text-[#5F6F6A] mt-0.5">
                    PPK: {pengadaan.mak?.ppk_nama || '-'}
                  </p>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider mb-1">
                    Jenis Pengadaan
                  </span>
                  <p className="text-sm font-medium text-[#14201C]">{pengadaan.jenis?.nama || '-'}</p>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider mb-1">
                    Metode Pengadaan
                  </span>
                  <p className="text-sm font-medium text-[#14201C]">{pengadaan.metode?.nama || '-'}</p>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider mb-1">
                    Level & Batas Kewenangan
                  </span>
                  <p className="text-sm font-semibold text-[#14201C]">{pengadaan.level?.nama || '-'}</p>
                  <span className="text-[11px] text-[#5F6F6A]">
                    {pengadaan.level?.perlu_review_pp ? 'Memerlukan Verifikasi Pejabat Pengadaan (PP)' : 'Bypass PP'}
                  </span>
                </div>
              </div>
            </section>

            {/* Card 2: Rekanan Vendor & Instrumen Pembelian (FR-37, FR-38, FR-39) */}
            {pengadaan.kontrak ? (
              <KontrakVendorCard
                tipe={pengadaan.kontrak.tipe}
                nomor={pengadaan.kontrak.nomor}
                tanggal={pengadaan.kontrak.tanggal}
                vendorNama={pengadaan.kontrak.vendor_nama}
                nominalKontrak={pengadaan.kontrak.nominal_kontrak}
                tanggalJatuhTempo={pengadaan.kontrak.tanggal_jatuh_tempo}
                tanggalReminder={pengadaan.kontrak.tanggal_reminder}
                dokumenNama={pengadaan.kontrak.dokumen?.nama_asli}
                bisaEdit={pengadaan.bisa_edit_kontrak}
                onEdit={onOpenKontrakModal}
                onPreviewDokumen={() => {
                  if (pengadaan.kontrak?.dokumen) {
                    onViewDokumen?.({
                      id: pengadaan.kontrak.dokumen.id,
                      nama_asli: pengadaan.kontrak.dokumen.nama_asli,
                      tipe_dokumen: 'dokumen_kontrak',
                      ukuran_bytes: 0,
                      mime_type: 'application/pdf',
                      download_url: pengadaan.kontrak.dokumen.download_url,
                    });
                  }
                }}
              />
            ) : (
              <section className="bg-white rounded-[22px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.05)] p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-[#F0F4F2] gap-3">
                  <div>
                    <h2 className="text-base font-bold text-[#14201C]">
                      Dokumen Pembelian & Rekanan Vendor
                    </h2>
                    <p className="text-xs text-[#5F6F6A] mt-0.5">
                      Penerbitan Kontrak, SPK, Surat Pesanan, atau Kwitansi untuk rekanan penyedia
                    </p>
                  </div>

                  {pengadaan.bisa_edit_kontrak && onOpenKontrakModal && (
                    <button
                      type="button"
                      onClick={onOpenKontrakModal}
                      className="px-5 py-2.5 rounded-xl bg-[#0E7C5A] text-white hover:bg-[#0B664A] text-xs font-semibold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Input Kontrak & Vendor</span>
                    </button>
                  )}
                </div>

                {!pengadaan.bisa_edit_kontrak ? (
                  <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E4EBE8] flex items-center gap-3 text-xs text-[#5F6F6A]">
                    <Lock className="w-4 h-4 text-[#8A9A95] shrink-0" />
                    <span>
                      Data kontrak dan rekanan vendor belum dapat diinput karena dokumen pengadaan belum disetujui penuh oleh peninjau (PP/PPK).
                    </span>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#EBF7F2] border border-[#D0EAE0] flex items-center gap-3 text-xs text-[#0E7C5A]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Dokumen pengadaan telah disetujui! Silakan input data rekanan vendor, biaya riil, dan instrumen pembelian.
                    </span>
                  </div>
                )}
              </section>
            )}

            {/* Card 3: Dokumen Lampiran Pengadaan */}
            <DokumenListCard
              title="Berkas & Lampiran Pengadaan"
              dokumenList={dokumenList}
              nomorSurat={pengadaan.permohonan?.nomor_surat}
              judul={pengadaan.permohonan?.judul}
              unitNama={pengadaan.permohonan?.unit_nama}
              onViewNewTab={onViewDokumen}
              onDownload={onDownloadDokumen}
            />

            {/* Modal Input/Edit Kontrak & Vendor (FR-38, FR-39) */}
            {isKontrakModalOpen && (
              <KontrakVendorFormModal
                isOpen={isKontrakModalOpen}
                onClose={onCloseKontrakModal || (() => {})}
                onSubmit={onSubmitKontrak || (() => {})}
                isUpdate={Boolean(pengadaan.kontrak)}
                initialData={
                  pengadaan.kontrak
                    ? {
                        tipe: pengadaan.kontrak.tipe as any,
                        nomor: pengadaan.kontrak.nomor,
                        tanggal: pengadaan.kontrak.tanggal || '',
                        vendor_nama: pengadaan.kontrak.vendor_nama,
                        nominal_kontrak: pengadaan.kontrak.nominal_kontrak,
                        tanggal_jatuh_tempo: pengadaan.kontrak.tanggal_jatuh_tempo || '',
                        tanggal_reminder: pengadaan.kontrak.tanggal_reminder || '',
                      }
                    : {
                        nominal_kontrak: pengadaan.nominal,
                      }
                }
              />
            )}

            {/* Modal Edit Klasifikasi Pengadaan (FR-36) */}
            {isEditKlasifikasiOpen && (
              <EditPengadaanModal
                isOpen={isEditKlasifikasiOpen}
                onClose={onCloseEditKlasifikasi || (() => {})}
                onSubmit={onSubmitEditKlasifikasi || (() => {})}
                initialData={{
                  permohonan_mak_id: pengadaan.mak?.id,
                  jenis_id: pengadaan.jenis?.id,
                  metode_id: pengadaan.metode?.id,
                  level_id: pengadaan.level?.id,
                  nominal: pengadaan.nominal,
                }}
                availableMak={
                  pengadaan.mak?.id
                    ? [{ id: pengadaan.mak.id, nama: pengadaan.mak.nama, kode: pengadaan.mak.kode }]
                    : []
                }
                referenceData={{
                  jenis: [pengadaan.jenis],
                  metode: [pengadaan.metode],
                  level: [pengadaan.level],
                }}
              />
            )}

            {/* Modal Pratinjau Dokumen */}
            {previewDocId && previewBlobUrl && (
              <DocumentPreviewModal
                open={Boolean(previewDocId)}
                onClose={onClosePreview || (() => {})}
                blobUrl={previewBlobUrl}
                label="Pratinjau Dokumen"
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default PpbjPengadaanShowTemplate;
