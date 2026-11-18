import type { FC } from 'react';
import { Check, X, Circle } from 'lucide-react';

export interface TimelineStepItem {
  title: string;
  subtitle?: string;
  state: 'done' | 'active' | 'rejected' | 'pending';
}

export interface RiwayatStatusTimelineProps {
  steps: TimelineStepItem[];
}

export const RiwayatStatusTimeline: FC<RiwayatStatusTimelineProps> = ({ steps }) => {
  return (
    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
      <h3 className="text-base font-bold text-[#14201C] mb-1">Riwayat Status</h3>
      <p className="text-xs text-[#8A9A95] mb-5">Tahapan proses permohonan saat ini</p>
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4EBE8]">
        {steps.map((step, index) => {
          const isDone = step.state === 'done';
          const isActive = step.state === 'active';
          const isRejected = step.state === 'rejected';

          return (
            <div key={index} className="relative">
              <span
                className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white ring-4 ${
                  isRejected
                    ? 'bg-[#E5484D] ring-[#FEE4E2]'
                    : isDone
                    ? 'bg-[#0E7C5A] ring-[#E4F6EC]'
                    : isActive
                    ? 'bg-[#2F68D6] ring-[#EFF4FE]'
                    : 'bg-[#C5D2CD] ring-white'
                }`}
              >
                {isRejected ? (
                  <X className="h-3 w-3 stroke-[3]" />
                ) : isDone ? (
                  <Check className="h-3 w-3 stroke-[3]" />
                ) : (
                  <Circle className="h-2 w-2 fill-current" />
                )}
              </span>
              <p
                className={`text-xs font-bold ${
                  isRejected
                    ? 'text-[#E5484D]'
                    : isActive
                    ? 'text-[#2F68D6]'
                    : 'text-[#14201C]'
                }`}
              >
                {step.title}
              </p>
              {step.subtitle && (
                <p className="text-[11px] text-[#8A9A95] mt-0.5 leading-relaxed">
                  {step.subtitle}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiwayatStatusTimeline;
