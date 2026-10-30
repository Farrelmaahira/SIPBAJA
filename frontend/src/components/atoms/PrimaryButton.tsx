import type { ButtonHTMLAttributes, ComponentType, FC, ReactNode } from 'react';

export interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ComponentType<{ className?: string }>;
}

export const PrimaryButton: FC<PrimaryButtonProps> = ({
  children,
  onClick,
  type = 'button',
  className = '',
  icon: Icon,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] active:bg-[#084A36] text-white text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export default PrimaryButton;
