import { useState, type FC } from 'react';
import { Check, X, Circle, ChevronDown, ChevronUp } from 'lucide-react';

export interface TimelineStepItem {
  key?: string;
  title: string;
  subtitle?: string;
  state: 'done' | 'active' | 'rejected' | 'pending';
}

export interface TimelineLogItem {
  id?: number | string;
  waktu?: string | null;
  deskripsi: string;
  actor_nama?: string | null;
  actor_role?: string | null;
  aktif?: boolean;
}

export interface RiwayatStatusTimelineProps {
  title?: string;
  subtitle?: string;
  steps: TimelineStepItem[];
  logs?: TimelineLogItem[];
  className?: string;
}

export const RiwayatStatusTimeline: FC<RiwayatStatusTimelineProps> = ({
  title = 'Timeline Proses',
  subtitle = 'Tahapan proses permohonan saat ini',
  steps,
  logs = [],
  className = '',
}) => {
  // State: apakah detail log riwayat terbuka atau tertutup semua
  const [showLogs, setShowLogs] = useState<boolean>(true);

  return (
    <div
      className={`bg-white rounded-[22px] md:rounded-[24px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(20,32,28,0.04)] space-y-6 ${className}`}
    >
      {/* Header Timeline */}
      <div>
        <h3 className="text-base font-bold text-[#14201C]">{title}</h3>
        {subtitle && <p className="text-xs text-[#5F6F6A] mt-0.5">{subtitle}</p>}
      </div>

      {/* Stepper Tahapan Permohonan */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4EBE8]">
        {steps.map((step, index) => {
          const isDone = step.state === 'done';
          const isActive = step.state === 'active';
          const isRejected = step.state === 'rejected';

          return (
            <div key={step.key || index} className="relative">
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

      {/* Detail Riwayat Log Proses (Toggle Expand/Collapse) */}
      {logs.length > 0 && (
        <div className="pt-4 border-t border-[#F0F4F2] space-y-3">
          {/* Header Action Log Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#14201C]">
              Log Catatan & Riwayat ({logs.length})
            </span>
            <button
              type="button"
              onClick={() => setShowLogs((prev) => !prev)}
              className="text-xs font-semibold text-[#0E7C5A] hover:text-[#0A5C43] inline-flex items-center gap-1 transition-colors cursor-pointer py-1"
            >
              <span>{showLogs ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Lebih Banyak'}</span>
              {showLogs ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Log Items (Hanya tampil jika showLogs = true) */}
          {showLogs && (
            <div className="space-y-3 pt-2">
              {logs.map((item, idx) => (
                <div key={item.id ?? idx} className="flex items-start gap-3 text-xs">
                  {/* Timestamp */}
                  {item.waktu && (
                    <span className="font-mono text-[11px] text-[#5F6F6A] w-28 shrink-0 pt-0.5">
                      {item.waktu}
                    </span>
                  )}

                  {/* Indicator Dot & Vertical Connector Line */}
                  <div className="flex flex-col items-center pt-1.5 shrink-0">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.aktif
                          ? 'bg-[#0E7C5A] ring-2 ring-[#BDE8D1]'
                          : 'bg-[#0E7C5A]'
                      }`}
                    />
                    {idx < logs.length - 1 && (
                      <span className="w-0.5 h-6 bg-[#CDE9DE] mt-1" />
                    )}
                  </div>

                  {/* Log Description */}
                  <div className="text-[#14201C] font-normal leading-relaxed flex-1">
                    <p>{item.deskripsi}</p>
                    {item.actor_nama && (
                      <p className="text-[10px] text-[#8A9A95] mt-0.5">
                        Oleh: {item.actor_nama} {item.actor_role ? `(${item.actor_role})` : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiwayatStatusTimeline;
