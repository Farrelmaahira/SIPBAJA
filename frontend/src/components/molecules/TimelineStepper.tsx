import type { FC } from 'react';
import {
  Check,
  X,
  FileText,
  ShoppingCart,
  Package,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import type { TimelineStageInfo } from '../../types/permohonan';

export interface TimelineStepperProps {
  stages?: TimelineStageInfo[];
}

const DEFAULT_STAGES: TimelineStageInfo[] = [
  { tahap: 'permohonan', label: 'Permohonan', status: 'active', keterangan: 'Menunggu persetujuan' },
  { tahap: 'pengadaan', label: 'Pengadaan', status: 'pending', keterangan: 'Menunggu proses pengadaan' },
  { tahap: 'pembelian', label: 'Pembelian Barang', status: 'pending', keterangan: 'Menunggu pembelian barang' },
  { tahap: 'penerimaan', label: 'Penerimaan Barang', status: 'pending', keterangan: 'Menunggu barang diterima' },
  { tahap: 'selesai', label: 'Selesai', status: 'pending', keterangan: 'Menunggu penyelesaian' },
];

export const TimelineStepper: FC<TimelineStepperProps> = ({ stages = DEFAULT_STAGES }) => {
  const getStageIcon = (stage: TimelineStageInfo) => {
    if (stage.status === 'rejected') {
      return <X className="w-4 h-4 stroke-[2.5]" />;
    }
    if (stage.status === 'completed') {
      return <Check className="w-4 h-4 stroke-[2.5]" />;
    }

    switch (stage.tahap) {
      case 'permohonan':
        return <Clock className="w-4 h-4 stroke-[2]" />;
      case 'pengadaan':
        return <FileText className="w-4 h-4 stroke-[2]" />;
      case 'pembelian':
        return <ShoppingCart className="w-4 h-4 stroke-[2]" />;
      case 'penerimaan':
        return <Package className="w-4 h-4 stroke-[2]" />;
      case 'selesai':
      default:
        return <CheckCircle2 className="w-4 h-4 stroke-[2]" />;
    }
  };

  const getCircleStyles = (stage: TimelineStageInfo) => {
    if (stage.status === 'rejected') {
      return 'bg-[#E5484D] text-white shadow-sm ring-4 ring-[#FEE4E2]';
    }
    if (stage.status === 'completed') {
      return 'bg-[#12A06B] text-white shadow-sm ring-4 ring-[#E4F6EC]';
    }
    if (stage.status === 'active') {
      return 'bg-[#2F6FED] text-white shadow-sm ring-4 ring-[#E8F0FF]';
    }
    return 'bg-[#F2F4F7] text-[#98A2B3] border border-[#E4EBE8]';
  };

  const getKeteranganColor = (stage: TimelineStageInfo) => {
    if (stage.status === 'rejected') return 'text-[#B42318]';
    if (stage.status === 'completed') return 'text-[#0B7A4E]';
    if (stage.status === 'active') return 'text-[#1F55C7]';
    return 'text-[#8A9A95]';
  };

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-[620px] flex items-start justify-between relative px-4">
        {/* Continuous connector line behind icons */}
        <div
          className="absolute top-5 left-10 right-10 h-[2px] bg-[#E4EBE8] -z-0"
          aria-hidden="true"
        />

        {stages.map((stage) => {
          const circleClass = getCircleStyles(stage);
          const keteranganClass = getKeteranganColor(stage);

          return (
            <div
              key={stage.tahap}
              className="flex flex-col items-center text-center max-w-[110px] z-10"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform shrink-0 ${circleClass}`}
                aria-hidden="true"
              >
                {getStageIcon(stage)}
              </div>

              <div className="mt-2.5 space-y-0.5">
                <p className="text-xs font-bold text-[#14201C] leading-snug">
                  {stage.label}
                </p>
                <p className={`text-[11px] font-medium leading-tight ${keteranganClass}`}>
                  {stage.keterangan}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineStepper;

