import type { FC } from 'react';
import {
  Check,
  FileText,
  ShoppingCart,
  Package,
  Clock,
} from 'lucide-react';

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
  statusPengadaan?: string;
  stepper?: TrackingStepItem[];
  timeline?: TrackingTimelineEvent[];
  className?: string;
}

export const TrackingPengadaanCard: FC<TrackingPengadaanCardProps> = ({
  statusPengadaan = 'menunggu_review',
  stepper: customStepper,
  timeline = [],
  className = '',
}) => {
  // Evaluasi 5 tahapan default jika stepper tidak dipass eksplisit
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
      status: isKontrak
        ? (isSelesai ? 'selesai' : 'sedang_berlangsung')
        : (statusPengadaan === 'disetujui' ? 'sedang_berlangsung' : 'belum_dimulai'),
    },
    {
      key: 'penerimaan_barang',
      label: 'Penerimaan Barang',
      status: isSelesai
        ? 'selesai'
        : (isKontrak ? 'sedang_berlangsung' : 'belum_dimulai'),
    },
    {
      key: 'selesai',
      label: 'Selesai',
      status: statusPengadaan === 'selesai' ? 'selesai' : 'belum_dimulai',
    },
  ];

  const stepperItems = customStepper && customStepper.length > 0 ? customStepper : defaultStepper;

  return (
    <section
      className={`bg-white rounded-[22px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.05)] p-6 transition-all ${className}`}
    >
      {/* Header */}
      <div className="pb-4 border-b border-[#F0F4F2]">
        <h3 className="text-base font-bold text-[#14201C]">Tracking Proses</h3>
        <p className="text-xs text-[#5F6F6A] mt-0.5">
          Posisi pengadaan dalam alur proses saat ini
        </p>
      </div>

      {/* Stepper Horizontal */}
      <div className="mt-6 pt-2 pb-6 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[620px] relative">
          {stepperItems.map((step, idx) => {
            const isStepSelesai = step.status === 'selesai';
            const isStepActive = step.status === 'sedang_berlangsung';

            let StepIcon = Check;
            if (step.key === 'permohonan') StepIcon = Check;
            else if (step.key === 'pengadaan') StepIcon = isStepSelesai ? Check : FileText;
            else if (step.key === 'pembelian_barang') StepIcon = isStepSelesai ? Check : ShoppingCart;
            else if (step.key === 'penerimaan_barang') StepIcon = isStepSelesai ? Check : Package;
            else if (step.key === 'selesai') StepIcon = isStepSelesai ? Check : Clock;

            return (
              <div key={step.key} className="flex-1 flex flex-col items-center relative group">
                {/* Line Connector */}
                {idx < stepperItems.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-[2.5px] -z-0 ${
                      isStepSelesai ? 'bg-[#0E7C5A]' : 'bg-[#E4EBE8]'
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
                <p className="text-xs font-bold text-[#14201C] mt-2 text-center">
                  {step.label}
                </p>
                <p
                  className={`text-[11px] font-medium mt-0.5 ${
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

      {/* Vertical Timeline Riwayat Status (FR-05) */}
      {timeline && timeline.length > 0 && (
        <div className="mt-4 pt-5 border-t border-[#F0F4F2] space-y-3.5">
          {timeline.map((item, idx) => (
            <div key={item.id ?? idx} className="flex items-start gap-4 text-xs">
              {/* Timestamp */}
              <span className="font-mono text-[#5F6F6A] w-36 shrink-0 pt-0.5">
                {item.tanggal}
              </span>

              {/* Indicator Dot & Connector */}
              <div className="flex flex-col items-center pt-1.5 shrink-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    item.aktif ? 'bg-[#0E7C5A] ring-2 ring-[#BDE8D1]' : 'bg-[#D5DFDC]'
                  }`}
                />
                {idx < timeline.length - 1 && (
                  <span className="w-0.5 h-4 bg-[#E4EBE8] mt-1" />
                )}
              </div>

              {/* Event Description & Actor */}
              <div className="text-[#14201C] font-medium leading-relaxed flex-1">
                <span>{item.keterangan}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TrackingPengadaanCard;
