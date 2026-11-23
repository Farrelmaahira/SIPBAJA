import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatusPill from '../../atoms/StatusPill';
import DokumenListCard from '../../organisms/DokumenListCard';
import { PermohonanInfoSection } from '../../organisms/PermohonanInfoSection';
import PermohonanShowMakList from '../../molecules/PermohonanShowMakList';
import PermohonanShowPaketList from '../../molecules/PermohonanShowPaketList';
import PengadaanSplitForm from '../../organisms/PengadaanSplitForm';
import { PPBJ_NAV_ITEMS } from '../../../constants/ppbjNav';
import { formatTanggalIndo } from '../../../utils/formatters';
import type { PpbjPermohonanDetail } from '../../../types/ppbj';
import type { DokumenItem } from '../../../types/dokumen';
import type { AppTopbarUser } from '../../organisms/AppTopbar';

export interface PpbjPermohonanShowTemplateProps {
  user?: AppTopbarUser | null;
  permohonan?: PpbjPermohonanDetail | null;
  dokumenList?: DokumenItem[];
  isLoading?: boolean;
  flash?: {
    success?: string;
    error?: string;
  };
  errors?: Record<string, string>;
  onSaveDraft?: (data: { items: any[] }) => Promise<void> | void;
  onDeleteDraft?: (paketId: number | string) => Promise<void> | void;
  onSubmitToReviewer?: () => Promise<void> | void;
  onViewDokumen?: (doc: DokumenItem) => void;
  onDownloadDokumen?: (doc: DokumenItem) => void;
  previewBlobUrl?: string | null;
  previewDocId?: number | string | null;
  isLoadingPreview?: boolean;
  isViewingId?: number | string | null;
  isDownloadingId?: number | string | null;
}

export const PpbjPermohonanShowTemplate: FC<PpbjPermohonanShowTemplateProps> = ({
  user = null,
  permohonan = null,
  dokumenList = [],
  isLoading = false,
  flash = {},
  onSaveDraft,
  onDeleteDraft,
  onSubmitToReviewer: _onSubmitToReviewer,
  onViewDokumen,
  onDownloadDokumen,
  previewBlobUrl = null,
  previewDocId = null,
  isLoadingPreview = false,
  isViewingId = null,
  isDownloadingId = null,
}) => {
  const navigate = useNavigate();
  const isRevised = (permohonan?.revisiKe ?? 0) > 0;
  const canSplit = Boolean(permohonan?.bisaDipecah);
  const isLocked = Boolean(permohonan?.sudahDikunci);
  const hasPaket = Boolean(permohonan?.paketList && permohonan.paketList.length > 0);
  const hasDitolak = Boolean(permohonan?.paketList?.some((p) => p.status === 'ditolak'));

  return (
    <AppLayout
      activeRoute="permohonan"
      navItems={PPBJ_NAV_ITEMS}
      roleInitials="PB"
      roleTitle="PPBJ"
      roleSubtitle="Pengadaan Barang & Jasa"
      user={user}
      breadcrumb={[
        { label: 'PPBJ', href: '/ppbj/dashboard' },
        { label: 'DAFTAR PERMOHONAN', href: '/ppbj/permohonan' },
        { label: permohonan?.nomorSurat || 'DETAIL PERMOHONAN' },
      ]}
    >
      <div className="space-y-6">
        {/* Flash Messages */}
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

        {isLoading || !permohonan ? (
          <div className="bg-white rounded-2xl border border-[#E4EBE8] p-16 text-center shadow-xs">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-[#5F6F6A]">Memuat detail permohonan pengadaan...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Banner with Status Pill & Back CTA */}
            <HeroBanner
              eyebrow="PENGADAAN"
              title={
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xl md:text-2xl font-bold tracking-tight text-white">Detail Permohonan</span>
                  <StatusPill
                    status={permohonan.status}
                    label={permohonan.status === 'disetujui' ? 'Review PPBJ' : undefined}
                  />
                  {isRevised && (
                    <span className="inline-flex items-center text-xs font-semibold text-[#B54708] bg-[#FEF6EE] border border-[#FECDCA] px-2 py-0.5 rounded-full">
                      Revisi ke-{permohonan.revisiKe}
                    </span>
                  )}
                </div>
              }
              description={`Nomor ${permohonan.nomorSurat || '-'} · Diajukan ${formatTanggalIndo(permohonan.tanggalPengajuan, true)}`}
              ctaLabel="Kembali"
              ctaIcon={ArrowLeft}
              ctaVariant="translucent"
              onCta={() => navigate('/ppbj/dashboard')}
            />

            {/* Card 1: Informasi Permohonan */}
            <PermohonanInfoSection
              permohonan={{
                nomor_surat: permohonan.nomorSurat,
                created_at: permohonan.tanggalPengajuan,
                judul: permohonan.judul,
                unit_nama: permohonan.unitNama,
                pembuat_nama: permohonan.pembuatNama,
                estimasi_anggaran: permohonan.estimasiAnggaran,
                status: permohonan.status,
              }}
            />

            {/* Card 2: Dokumen Proses Sebelumnya */}
            <div className="space-y-4">
              <DokumenListCard
                title="Dokumen Proses Sebelumnya"
                dokumenList={dokumenList}
                nomorSurat={permohonan.nomorSurat}
                judul={permohonan.judul}
                unitNama={permohonan.unitNama}
                tanggal={permohonan.tanggalPengajuan}
                onViewNewTab={onViewDokumen}
                onDownload={onDownloadDokumen}
                isViewingId={isViewingId}
                isDownloadingId={isDownloadingId}
                previewBlobUrl={previewBlobUrl}
                previewDocId={previewDocId}
                isLoadingPreview={isLoadingPreview}
              />

              {/* MAK & Catatan dari Perencanaan */}
              <section
                className="bg-white rounded-[22px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.05)] p-6"
                aria-labelledby="heading-mak"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0F4F2]">
                  <div>
                    <h3 id="heading-mak" className="text-sm font-bold text-[#14201C]">
                      Jenis MAK & Penanggung Jawab dari Perencanaan
                    </h3>
                    <p className="text-xs text-[#5F6F6A] mt-0.5">
                      Sumber mata anggaran dan catatan verifikasi tim perencanaan
                    </p>
                  </div>
                  {permohonan.makList && permohonan.makList.length > 0 && (
                    <span className="text-xs font-semibold text-[#5F6F6A] bg-[#F1F7F4] px-2.5 py-1 rounded-full">
                      {permohonan.makList.length} Mata Anggaran
                    </span>
                  )}
                </div>

                <PermohonanShowMakList makList={permohonan.makList} />

                {/* Catatan dari Perencanaan */}
                {permohonan.catatanPerencanaan && (
                  <div className="mt-4 p-4 rounded-2xl bg-[#EBF7F2] border border-[#D0EAE0] flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#0E7C5A] shrink-0 mt-0.5" />
                    <div className="text-left text-xs">
                      <span className="block text-[11px] font-bold text-[#0E7C5A] uppercase tracking-wider mb-1">
                        Catatan dari Perencanaan
                      </span>
                      <p className="text-xs text-[#14201C] leading-relaxed whitespace-pre-line">
                        {permohonan.catatanPerencanaan}
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Card 3: Dokumen Pengadaan */}
            <section
              className="bg-white rounded-[22px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.05)] p-6 space-y-6"
              aria-labelledby="heading-split"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[#F0F4F2] gap-3">
                <div>
                  <h2 id="heading-split" className="text-base font-bold text-[#14201C]">
                    Dokumen Pengadaan
                  </h2>
                  <p className="text-xs text-[#5F6F6A] mt-0.5">
                    Unggah dokumen pengadaan, tentukan MAK, lalu submit langsung ke reviewer
                  </p>
                </div>
              </div>

              {!canSplit && (
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E4EBE8] flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#5F6F6A] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#5F6F6A] leading-relaxed">
                    Permohonan belum dapat diproses dokumen pengadaannya karena belum memperoleh persetujuan lengkap dari{' '}
                    <strong className="text-[#14201C]">Bidang 2</strong> dan{' '}
                    <strong className="text-[#14201C]">PPK</strong>.
                  </div>
                </div>
              )}

              {canSplit && (
                <>
                  {/* Alert jika ada paket yang ditolak */}
                  {hasDitolak && (
                    <div className="p-4 rounded-2xl bg-[#FEF3F2] border border-[#FECDCA] flex items-start gap-3 text-xs text-[#B42318]">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#D92D20]" />
                      <div className="leading-relaxed">
                        <strong className="block text-sm font-bold text-[#B42318] mb-1">
                          Terdapat Paket Pengadaan yang Ditolak oleh Reviewer
                        </strong>
                        <span>
                          Reviewer mengembalikan paket dokumen pengadaan untuk diperbaiki. Silakan klik tombol{' '}
                          <strong className="font-bold underline">Revisi</strong> pada tabel paket di bawah untuk melihat alasan penolakan dan memperbarui dokumen pengadaan.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Daftar Paket Pengadaan yang Telah Dibuat */}
                  {hasPaket && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#14201C]">
                          Daftar Paket Pengadaan ({permohonan.paketList?.length || 0})
                        </h3>
                      </div>
                      <PermohonanShowPaketList
                        paketList={permohonan.paketList || []}
                        sudahDikunci={isLocked}
                        onDelete={onDeleteDraft}
                      />
                    </div>
                  )}

                  {/* Form Pembuatan Pengadaan atau Status Terkunci */}
                  {isLocked ? (
                    <div className="p-4 rounded-2xl bg-[#F0F4F2] border border-[#CFDAD6] flex items-start gap-3">
                      <Lock className="w-5 h-5 text-[#0E7C5A] shrink-0 mt-0.5" />
                      <div className="text-xs text-[#14201C] leading-relaxed">
                        <strong className="block text-[#0E7C5A] mb-0.5">
                          Paket Pengadaan Telah Terkunci
                        </strong>
                        Dokumen paket pengadaan telah disubmit ke reviewer. Permohonan ini telah dikunci sehingga penambahan paket baru tidak diperbolehkan.
                      </div>
                    </div>
                  ) : (
                    <div>
                      <PengadaanSplitForm
                        permohonanId={permohonan.id}
                        estimasiAnggaran={Number(permohonan.estimasiAnggaran) || 0}
                        sisaAnggaran={permohonan.sisaAnggaran}
                        availableMak={permohonan.availableMak || []}
                        referenceData={permohonan.referenceData || { jenis: [], metode: [], level: [] }}
                        onSubmit={onSaveDraft}
                      />
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default PpbjPermohonanShowTemplate;
