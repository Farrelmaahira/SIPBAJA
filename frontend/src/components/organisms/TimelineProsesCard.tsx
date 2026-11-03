import { useState, type FC } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TimelineStepper from '../molecules/TimelineStepper';
import type { TimelineHistoryItem, TimelineStageInfo } from '../../types/permohonan';

export interface TimelineProsesCardProps {
  stages?: TimelineStageInfo[];
  history?: TimelineHistoryItem[];
}

export const TimelineProsesCard: FC<TimelineProsesCardProps> = ({
  stages,
  history = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedHistory = isExpanded ? history : history.slice(0, 4);
  const canToggle = history.length > 4;

  const getDotColor = (item: TimelineHistoryItem, index: number) => {
    if (item.status_baru === 'ditolak') {
      return 'bg-[#E5484D] ring-4 ring-[#FEE4E2]';
    }
    if (index === 0) {
      return 'bg-[#0E7C5A] ring-4 ring-[#EEF5F2]';
    }
    return 'bg-[#98A2B3]';
  };

  return (
    <section
      className="bg-white rounded-[24px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(20,32,28,0.04)] p-6 md:p-8 space-y-6"
      aria-labelledby="timeline-proses-title"
    >
      <div>
        <h2 id="timeline-proses-title" className="text-lg md:text-xl font-bold text-[#14201C]">
          Timeline Proses
        </h2>
        <p className="text-xs md:text-sm text-[#5F6F6A] mt-0.5">
          Riwayat tahapan permohonan
        </p>
      </div>

      <div className="py-2">
        <TimelineStepper stages={stages} />
      </div>

      <div className="pt-4 border-t border-[#E4EBE8]">
        <div className="relative pl-2 space-y-5">
          {displayedHistory.map((item, idx) => {
            const isLast = idx === displayedHistory.length - 1;
            const dotClass = getDotColor(item, idx);

            return (
              <div key={item.id ?? idx} className="relative flex items-start gap-4 sm:gap-6">
                {!isLast && (
                  <div
                    className="absolute left-[134px] sm:left-[146px] top-4 bottom-0 w-[2px] bg-[#E4EBE8]"
                    aria-hidden="true"
                  />
                )}

                <div className="w-28 sm:w-32 shrink-0 text-left">
                  <span className="text-xs font-semibold text-[#5F6F6A] tabular-nums">
                    {item.waktu || '-'}
                  </span>
                </div>

                <div className="relative flex items-center justify-center pt-1 z-10 shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${dotClass}`} aria-hidden="true" />
                </div>

                <div className="flex-1 pb-1">
                  <p className="text-xs md:text-sm text-[#14201C] leading-snug">
                    {item.deskripsi}
                  </p>
                  {item.actor_nama && (
                    <p className="text-[11px] text-[#8A9A95] mt-0.5">
                      Oleh: {item.actor_nama} {item.actor_role ? `(${item.actor_role})` : ''}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {canToggle && (
          <div className="mt-5 text-center pt-2">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7C5A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded px-2 py-1 cursor-pointer"
            >
              <span>{isExpanded ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Lebih Banyak'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TimelineProsesCard;

