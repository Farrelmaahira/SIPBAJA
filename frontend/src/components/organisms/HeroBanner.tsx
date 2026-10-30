import type { ComponentType, FC, ReactNode } from 'react';
import { Plus } from 'lucide-react';

export type HeroBannerCtaVariant = 'primary' | 'translucent';

export interface HeroBannerProps {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  ctaLabel?: ReactNode;
  ctaIcon?: ComponentType<{ className?: string }> | null;
  ctaVariant?: HeroBannerCtaVariant;
  onCta?: () => void;
  // Legacy aliases kept for backward compatibility
  userName?: string;
  onAddUser?: () => void;
  className?: string;
}

export const HeroBanner: FC<HeroBannerProps> = ({
  eyebrow = 'Dashboard Administrator',
  title = 'Selamat datang',
  description = 'Kelola akun pengguna, unit kerja, dan konfigurasi master data pengadaan.',
  ctaLabel = 'Tambah Pengguna',
  ctaIcon: CtaIcon = Plus,
  ctaVariant = 'primary',
  onCta,
  userName,
  onAddUser,
  className = '',
}) => {
  const resolvedTitle = userName ? `Selamat datang, ${userName}` : title;
  const resolvedOnCta = onCta ?? onAddUser;

  return (
    <section
      className={`relative overflow-hidden bg-[#0E7C5A] text-white rounded-[24px] p-6 md:p-8 min-h-[148px] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(14,124,90,0.15)] ${className}`}
      aria-labelledby="hero-title"
    >
      {/* Decorative concentric circles */}
      <div
        className="absolute -right-16 -top-16 w-[260px] h-[260px] rounded-full border border-white/10 pointer-events-none hidden sm:block"
        aria-hidden="true"
      />
      <div
        className="absolute -right-6 -bottom-12 w-[170px] h-[170px] rounded-full border border-white/15 pointer-events-none hidden sm:block"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-xl">
        <p className="text-[11px] font-bold text-white/75 tracking-wider uppercase mb-1">
          {eyebrow}
        </p>
        <h1
          id="hero-title"
          className="text-xl md:text-2xl font-bold tracking-tight text-white"
        >
          {resolvedTitle}
        </h1>
        <p className="text-xs md:text-sm text-white/80 mt-1 leading-relaxed">
          {description}
        </p>
      </div>

      {resolvedOnCta && (
        <div className="relative z-10 shrink-0">
          <button
            type="button"
            onClick={resolvedOnCta}
            className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E7C5A] cursor-pointer ${
              ctaVariant === 'translucent'
                ? 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                : 'bg-white text-[#0E7C5A] hover:bg-[#EEF5F2] active:bg-[#D6EFE4]'
            }`}
          >
            {CtaIcon && (
              <CtaIcon
                className={`w-5 h-5 ${
                  ctaVariant === 'translucent' ? 'text-white' : 'text-[#0E7C5A]'
                }`}
              />
            )}
            <span>{ctaLabel}</span>
          </button>
        </div>
      )}
    </section>
  );
};

export default HeroBanner;
