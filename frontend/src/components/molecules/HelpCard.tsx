import type { FC, ReactNode } from 'react';

export interface HelpCardProps {
  title?: ReactNode;
  description?: ReactNode;
  linkText?: ReactNode;
  href?: string;
  className?: string;
}

export const HelpCard: FC<HelpCardProps> = ({
  title = 'Pusat Bantuan',
  description = 'Butuh bantuan panduan administrasi atau pengaturan sistem?',
  linkText = 'Buka dokumentasi',
  href = '#bantuan',
  className = '',
}) => {
  return (
    <div
      className={`p-4 rounded-2xl bg-[#EAF5F1] border border-[#D5EAE1] ${className}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-2 h-2 rounded-full bg-[#0E7C5A]" />
        <h3 className="text-[13px] font-semibold text-[#0A5C43]">{title}</h3>
      </div>
      <p className="text-xs text-[#5F6F6A] leading-relaxed mb-3">{description}</p>
      <a
        href={href}
        className="inline-flex items-center text-xs font-semibold text-[#0E7C5A] hover:text-[#0A5C43] transition-colors"
      >
        {linkText} &rarr;
      </a>
    </div>
  );
};

export default HelpCard;
