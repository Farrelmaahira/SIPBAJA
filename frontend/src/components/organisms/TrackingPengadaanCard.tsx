import { useState, type FC } from 'react';
import {
  Check,
  FileText,
  ShoppingCart,
  Package,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatPermohonan';

export type TrackingStepStatus = 'selesai' | 'sedang_berlangsung' | 'belum_dimulai';

export interface TrackingStepItem {
  key: string;
  label: string;
  status: TrackingStepStatus;
}

export interface TrackingTimelineEvent {
  id?: number | string;
  tanggal: string; // e.g. "12-03-2027 10:20"
  keterangan: string; // e.g. "Surat kontrak dan SPK diterbitkan oleh PPBJ"
  actor_nama?: string;
  aktif?: boolean;
}

export interface TrackingPengadaanCardProps {
  nomorPengadaan?: string; // e.g. "PGD-2027-0001"
  judulPengadaan?: string; // e.g. "Pengadaan Komputer"
  nominal?: number | string | null; // e.g. 100000000
  statusPengadaan?: string;
  statusLabel?: string;
  stepper?: TrackingStepItem[];
  timeline?: TrackingTimelineEvent[];
  className?: string;
}

export const TrackingPengadaanCard: FC<TrackingPengadaanCardProps> = ({
  nomorPengadaan = 'PGD-2027-0001',
  judulPengadaan = 'Pengadaan Barang & Jasa',
  nominal,
  statusPengadaan = 'menunggu_review',
  statusLabel: customStatusLabel,
  stepper: customStepper,
  timeline = [],
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const isSelesai = statusPengadaan === 'selesai' || statusPengadaan === 'barang_diterima';
  const isKontrak = ['kontrak_terbit', 'siap_spk', 'berjalan', 'barang_diterima', 'selesai'].includes(statusPengadaan);
  const isReviewAtauLebih = !['draft', 'menunggu_review'].includes(statusPengadaan);

  const defaultStepper: TrackingStepItem[] = [
    {
      key: 'permohonan',
      label: 'Permohonan',
      status: 'selesai',
    },
    {
      key: 'pengadaan',
      label: 'Pengadaan',
      status: isReviewAtauLebih ? 'selesai' : 'sedang_berlangsung',
    },
    {
      key: 'pembelian_barang',
      label: 'Pembelian Barang',
      status: isSelesai
        ? 'selesai'
        : isKontrak
        ? 'sedang_berlangsung'
        : statusPengadaan === 'disetujui'
        ? 'sedang_berlangsung'
        : 'belum_dimulai',
    },
    {
      key: 'penerimaan_barang',
      label: 'Penerimaan Barang',
      status: isSelesai
        ? 'selesai'
        : statusPengadaan === 'barang_diterima'
        ? 'sedang_berlangsung'
        : 'belum_dimulai',
    },
    {
      key: 'selesai',
      label: 'Selesai',
      status: statusPengadaan === 'selesai' ? 'selesai' : 'belum_dimulai',
    },
  ];

  const stepperItems = customStepper && customStepper.length > 0 ? customStepper : defaultStepper;

  const displayStatusLabel = customStatusLabel || (isSelesai ? 'Selesai' : 'Sedang Berlangsung');

  // Format nominal e.g. "Rp100.000.000"
  const formattedNominal = nominal != null && nominal !== ''
    ? formatRupiah(nominal).replace('Rp ', 'Rp')
    : null;

  // Timeline list (collapse / expand if > 5 items)
  const visibleTimeline = isExpanded || timeline.length <= 5 ? timeline : timeline.slice(0, 5);

  return (
    <section
      className={`bg-white rounded-[22px] md:rounded-[24px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.05)] p-6 md:p-8 transition-all ${className}`}
    >
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-base font-bold text-[#14201C]">
            Tracking Proses · {nomorPengadaan}
          </h3>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isSelesai
                ? 'bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5]'
                : 'bg-[#FEF6EE] text-[#B54708] border border-[#FEDF89]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSelesai ? 'bg-[#12B76A]' : 'bg-[#F79009]'
              }`}
            />
            {displayStatusLabel}
          </span>
        </div>
        <p className="text-xs text-[#5F6F6A] mt-1">
          {judulPengadaan} {formattedNominal ? `· ${formattedNominal}` : ''}
        </p>
      </div>

      {/* Stepper Horizontal */}
      <div className="mt-8 pt-2 pb-6 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[620px] relative">
          {stepperItems.map((step, idx) => {
            const isStepSelesai = step.status === 'selesai';
            const isStepActive = step.status === 'sedang_berlangsung';

            let StepIcon = Check;
            if (step.key === 'permohonan') StepIcon = Check;
            else if (step.key === 'pengadaan') StepIcon = FileText;
            else if (step.key === 'pembelian_barang') StepIcon = ShoppingCart;
            else if (step.key === 'penerimaan_barang') StepIcon = Package;
            else if (step.key === 'selesai') StepIcon = CheckCircle2;

            // Connecting line: next step reached
            const nextStep = stepperItems[idx + 1];
            const isLineActive =
              nextStep && (nextStep.status === 'selesai' || nextStep.status === 'sedang_berlangsung');

            return (
              <div key={step.key} className="flex-1 flex flex-col items-center relative group">
                {/* Line Connector */}
                {idx < stepperItems.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-[2.5px] -z-0 ${
                      isLineActive ? 'bg-[#0E7C5A]' : 'bg-[#E4EBE8]'
                    }`}
                  />
                )}

                {/* Step Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center relative z-10 transition-transform ${
                    isStepSelesai
                      ? 'bg-[#0E7C5A] text-white shadow-xs'
                      : isStepActive
                      ? 'bg-[#0E7C5A] text-white ring-4 ring-[#E8F5EF]'
                      : 'bg-white border-2 border-[#D5DFDC] text-[#8A9A95]'
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                </div>

                {/* Label & Status */}
                <p className="text-xs font-bold text-[#14201C] mt-2.5 text-center whitespace-nowrap">
                  {step.label}
                </p>
                <p
                  className={`text-[11px] font-medium mt-0.5 text-center whitespace-nowrap ${
                    isStepSelesai
                      ? 'text-[#0E7C5A]'
                      : isStepActive
                      ? 'text-[#0E7C5A]'
                      : 'text-[#8A9A95]'
                  }`}
                >
                  {isStepSelesai
                    ? 'Selesai'
                    : isStepActive
                    ? 'Sedang berlangsung'
                    : 'Belum dimulai'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical Timeline Riwayat Status */}
      {timeline && timeline.length > 0 && (
        <div className="mt-4 pt-6 border-t border-[#F0F4F2]">
          <div className="space-y-3.5">
            {visibleTimeline.map((item, idx) => (
              <div key={item.id ?? idx} className="flex items-start gap-4 text-xs">
                {/* Timestamp */}
                <span className="font-mono text-[#5F6F6A] w-32 sm:w-36 shrink-0 pt-0.5">
                  {item.tanggal}
                </span>

                {/* Indicator Dot & Vertical Connector */}
                <div className="flex flex-col items-center pt-1.5 shrink-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      item.aktif
                        ? 'bg-[#0E7C5A] ring-2 ring-[#BDE8D1]'
                        : 'bg-[#D5DFDC]'
                    }`}
                  />
                  {idx < visibleTimeline.length - 1 && (
                    <span className="w-0.5 h-5 bg-[#E4EBE8] mt-1" />
                  )}
                </div>

                {/* Event Description */}
                <div className="text-[#14201C] font-normal leading-relaxed flex-1">
                  <span>{item.keterangan}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Toggle Selengkapnya / Lebih Sedikit */}
          {timeline.length > 5 && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-semibold text-[#0E7C5A] hover:text-[#0A5C43] inline-flex items-center gap-1 transition-colors cursor-pointer py-1"
              >
                <span>{isExpanded ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Selengkapnya'}</span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default TrackingPengadaanCard;
