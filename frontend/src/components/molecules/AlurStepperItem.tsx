import type { FC, ReactNode } from 'react';

export type StepperBadgeVariant = 'success' | 'info' | 'warning' | 'neutral';

export interface AlurStepperItemProps {
  stepNumber: number | string;
  title?: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  badgeVariant?: StepperBadgeVariant;
  isActive?: boolean;
  isLast?: boolean;
}

export const AlurStepperItem: FC<AlurStepperItemProps> = ({
  stepNumber,
  title,
  description,
  badge,
  badgeVariant = 'neutral',
  isActive = false,
  isLast = false,
}) => {
  const badgeColors: Record<StepperBadgeVariant, string> = {
    success: 'bg-[#E4F6EC] text-[#0B7A4E]',
    info: 'bg-[#E8F0FF] text-[#1F55C7]',
    warning: 'bg-[#FEF3E2] text-[#B45309]',
    neutral: 'bg-[#F2F4F7] text-[#344054]',
  };

  return (
    <div className="flex gap-3 relative">
      {/* Indikator nomor dan garis vertikal */}
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 select-none ${
            isActive
              ? 'bg-[#0E7C5A] text-white shadow-sm'
              : 'bg-[#F2F4F7] text-[#667085] border border-[#EAECF0]'
          }`}
        >
          {stepNumber}
        </div>
        {!isLast && <div className="w-[1.5px] bg-[#EAECF0] flex-1 my-1 min-h-[32px]" />}
      </div>

      {/* Konten teks & badge */}
      <div className={`flex-1 ${!isLast ? 'pb-6' : 'pb-1'}`}>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {title && <span className="text-sm font-semibold text-[#1D2939]">{title}</span>}
          {badge && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium leading-none ${
                badgeColors[badgeVariant] || badgeColors.neutral
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-[#667085] leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
};

export default AlurStepperItem;
