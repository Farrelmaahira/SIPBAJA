import type { ComponentType, FC, MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';

export interface SidebarNavItemProps {
  icon?: ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  to?: string;
  active?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export const SidebarNavItem: FC<SidebarNavItemProps> = ({
  icon: Icon,
  label,
  href = '#',
  to,
  active = false,
  onClick,
}) => {
  const target = to || href;
  const baseClasses =
    'flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150 min-h-[44px]';
  const activeClasses = 'bg-[#0E7C5A] text-white font-semibold shadow-sm';
  const inactiveClasses =
    'text-[#5F6F6A] hover:bg-[#EEF5F2] hover:text-[#14201C]';

  return (
    <Link
      to={target}
      onClick={onClick}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
      aria-current={active ? 'page' : undefined}
    >
      {Icon && (
        <Icon
          className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-[#5F6F6A]'}`}
        />
      )}
      <span>{label}</span>
    </Link>
  );
};

export default SidebarNavItem;
