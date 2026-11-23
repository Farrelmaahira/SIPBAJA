import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Edit,
  Lock,
} from 'lucide-react';
import AppLayout, { type AppTopbarUser } from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatusPill from '../../atoms/StatusPill';
import InformasiPengadaanCard from '../../organisms/PP/InformasiPengadaanCard';
import TrackingPengadaanCard from '../../organisms/TrackingPengadaanCard';
import DokumenListCard from '../../organisms/DokumenListCard';
import DocumentPreviewModal from '../../organisms/DocumentPreviewModal';
import CatatanPenolakanCard from '../../molecules/CatatanPenolakanCard';
import KontrakVendorCard from '../../molecules/KontrakVendorCard';
import PelengkapPengadaanInlineForm from '../../organisms/PPBJ/PelengkapPengadaanInlineForm';
import EditPengadaanModal from '../../organisms/EditPengadaanModal';
import { PPBJ_NAV_ITEMS } from '../../../constants/ppbjNav';
import { formatRupiah, formatTanggalIndo } from '../../../utils/formatters';
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
  isSubmittingKlasifikasi?: boolean;
  isKontrakModalOpen?: boolean;
  isSubmittingKontrak?: boolean;
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
  isSubmittingKlasifikasi = false,
  isSubmittingKontrak = false,
  onOpenEditKlasifikasi,
  onCloseEditKlasifikasi,
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
                  alasan: latestRejection.alasan || latestRejection.catatan || 'Dokumen pengadaan memerlukan perbaikan.',
                  pemeriksa_nama: latestRejection.actor?.nama || latestRejection.actor_nama || '-',
                  pemeriksa_peran: latestRejection.tahap,
                  diperiksa_at: latestRejection.created_at || null,
                }}
              />
            )}

            {/* Banner Paket Draft */}
            {pengadaan.status === 'draft' && (
              <div className="p-4 rounded-2xl bg-[#F0F4F2] border border-[#CFDAD6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#0E7C5A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm font-bold text-[#14201C] mb-0.5">
                      Paket Pengadaan Berstatus Draft
                    </strong>
                    <span className="text-[#5F6F6A]">
                      Paket pengadaan ini belum diajukan ke reviewer. Anda dapat memperbarui klasifikasi atau membuka permohonan induk untuk mengirim seluruh draft ke reviewer.
                    </span>
                  </div>
                </div>
                {Boolean(pengadaan.permohonan?.id) && (
                  <button
                    type="button"
                    onClick={() => navigate(`/ppbj/permohonan/${pengadaan.permohonan.id}`)}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                  >
                    <span>Buka Permohonan Induk</span>
                  </button>
                )}
              </div>
            )}

            {/* Card 1: Informasi Paket & Klasifikasi */}
            <div className="relative">
              {pengadaan.bisa_edit_draft && onOpenEditKlasifikasi && (
                <div className="flex justify-end mb-3">
                  <button
                    type="button"
                    onClick={onOpenEditKlasifikasi}
                    className="px-4 py-2 rounded-xl border border-[#0E7C5A] text-[#0E7C5A] hover:bg-[#F7FBF9] text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{isDitolak ? 'Revisi Dokumen Pengadaan' : 'Perbarui Klasifikasi'}</span>
                  </button>
                </div>
              )}
              <InformasiPengadaanCard
                judul={pengadaan.permohonan?.judul || 'Pengadaan Barang & Jasa'}
                unitNama={pengadaan.permohonan?.unit_nama || 'Unit Kerja'}
                nomorPengadaan={`#${pengadaan.id}`}
                nomorPermohonan={pengadaan.permohonan?.nomor_surat || '-'}
                tanggalPengajuan={
                  pengadaan.permohonan?.tanggal_pengajuan
                    ? formatTanggalIndo(pengadaan.permohonan.tanggal_pengajuan, true)
                    : pengadaan.created_at
                      ? formatTanggalIndo(pengadaan.created_at, true)
                      : '-'
                }
                jenisPengadaan={pengadaan.jenis?.nama || '-'}
                metodePengadaan={pengadaan.metode?.nama || '-'}
                levelPengadaan={pengadaan.level?.nama || '-'}
                nominal={formatRupiah(pengadaan.nominal)}
                statusPpLabel={pengadaan.level?.perlu_review_pp ? 'Memerlukan Verifikasi PP' : 'Bypass PP'}
                statusPengadaanPill={<StatusPill status={pengadaan.status} label={pengadaan.status === 'disetujui' ? 'Review PPBJ' : undefined} />}
              />
            </div>

            {/* Tracking Pengadaan (FR-05) */}
            <TrackingPengadaanCard
              statusPengadaan={pengadaan.status}
              stepper={pengadaan.tracking?.stepper}
              timeline={pengadaan.tracking?.timeline}
            />

            {/* Card 2: Dokumen Lampiran Pengadaan */}
            <DokumenListCard
              title="Berkas & Lampiran Pengadaan"
              dokumenList={dokumenList}
              nomorSurat={pengadaan.permohonan?.nomor_surat}
              judul={pengadaan.permohonan?.judul}
              unitNama={pengadaan.permohonan?.unit_nama}
              onViewNewTab={onViewDokumen}
              onDownload={onDownloadDokumen}
            />

            {/* Card 3: Form Pelengkap Informasi Pengadaan & Rekanan Vendor (FR-37) */}
            {!pengadaan.bisa_edit_kontrak && !pengadaan.kontrak ? (
              <section className="bg-white rounded-[22px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.05)] p-6">
                <div className="pb-4 mb-4 border-b border-[#F0F4F2]">
                  <h2 className="text-base font-bold text-[#14201C]">
                    Dokumen Pembelian & Rekanan Vendor
                  </h2>
                  <p className="text-xs text-[#5F6F6A] mt-0.5">
                    Informasi penyedia barang/jasa, pengingat masa berlaku, dan instrumen pembelian
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E4EBE8] flex items-center gap-3 text-xs text-[#5F6F6A]">
                  <Lock className="w-4 h-4 text-[#8A9A95] shrink-0" />
                  <span>
                    Data rekanan vendor dan instrumen pembelian belum dapat diisi karena dokumen pengadaan belum disetujui penuh oleh peninjau (PP/PPK).
                  </span>
                </div>
              </section>
            ) : pengadaan.bisa_edit_kontrak ? (
              <PelengkapPengadaanInlineForm
                initialVendorNama={pengadaan.kontrak?.vendor_nama || ''}
                initialBiayaRiil={pengadaan.kontrak?.nominal_kontrak || pengadaan.nominal || ''}
                initialTanggalPengingat={pengadaan.kontrak?.tanggal_reminder || ''}
                initialDokumenList={pengadaan.kontrak?.dokumen_items || []}
                existingSingleDokumen={pengadaan.kontrak?.dokumen || null}
                isSubmitting={isSubmittingKontrak}
                onSubmit={onSubmitKontrak || (() => {})}
                onPreviewDokumen={onViewDokumen}
                isUpdate={Boolean(pengadaan.kontrak)}
              />
            ) : (
              /* Ketika barang sudah diterima perlengkapan / read-only */
              pengadaan.kontrak && (
                <KontrakVendorCard
                  tipe={pengadaan.kontrak.tipe}
                  nomor={pengadaan.kontrak.nomor}
                  tanggal={pengadaan.kontrak.tanggal}
                  vendorNama={pengadaan.kontrak.vendor_nama}
                  nominalKontrak={pengadaan.kontrak.nominal_kontrak}
                  tanggalJatuhTempo={pengadaan.kontrak.tanggal_jatuh_tempo}
                  tanggalReminder={pengadaan.kontrak.tanggal_reminder}
                  dokumenNama={pengadaan.kontrak.dokumen?.nama_asli}
                  bisaEdit={false}
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
              )
            )}

            {/* Modal Edit Klasifikasi Pengadaan (FR-36) */}
            {isEditKlasifikasiOpen && (
              <EditPengadaanModal
                isOpen={isEditKlasifikasiOpen}
                isDitolak={isDitolak}
                isSubmitting={isSubmittingKlasifikasi}
                onClose={onCloseEditKlasifikasi || (() => {})}
                onSubmit={onSubmitEditKlasifikasi || (() => {})}
                initialData={{
                  permohonan_mak_id: pengadaan.permohonan_mak_id || pengadaan.mak?.id,
                  jenis_id: pengadaan.jenis?.id,
                  metode_id: pengadaan.metode?.id,
                  level_id: pengadaan.level?.id,
                  nominal: pengadaan.nominal,
                }}
                availableMak={
                  pengadaan.available_mak && pengadaan.available_mak.length > 0
                    ? pengadaan.available_mak
                    : (pengadaan.mak?.id
                        ? [{ id: pengadaan.permohonan_mak_id || pengadaan.mak.id, nama: pengadaan.mak.nama, kode: pengadaan.mak.kode }]
                        : [])
                }
                referenceData={
                  pengadaan.reference_data || {
                    jenis: [pengadaan.jenis],
                    metode: [pengadaan.metode],
                    level: [pengadaan.level],
                  }
                }
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
