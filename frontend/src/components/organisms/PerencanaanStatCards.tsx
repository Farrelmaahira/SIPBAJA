import type { FC } from 'react';
import { FileText, Hourglass, CheckCircle2, XCircle } from 'lucide-react';
import type { PerencanaanDashboardStats } from '../../types/perencanaan';

export interface PerencanaanStatCardsProps {
  stats?: PerencanaanDashboardStats;
  isLoading?: boolean;
}

export const PerencanaanStatCards: FC<PerencanaanStatCardsProps> = ({
  stats,
  isLoading = false,
}) => {
  const cards = [
    {
      label: 'Total Permohonan',
      value: stats?.total ?? 0,
      icon: FileText,
      iconBg: 'bg-[#E4F6EC]',
      iconColor: 'text-[#0E7C5A]',
      badgeText: '+3 bulan ini',
      badgeBg: 'bg-[#E4F6EC]',
      badgeColor: 'text-[#0B7A4E]',
    },
    {
      label: 'Diajukan',
      value: stats?.diajukan ?? 0,
      icon: Hourglass,
      iconBg: 'bg-[#E8F0FF]',
      iconColor: 'text-[#2F68D6]',
      badgeText: 'Dalam antrean',
      badgeBg: 'bg-[#E8F0FF]',
      badgeColor: 'text-[#2F68D6]',
    },
    {
      label: 'Selesai',
      value: stats?.selesai ?? 0,
      icon: CheckCircle2,
      iconBg: 'bg-[#E4F6EC]',
      iconColor: 'text-[#0E7C5A]',
      badgeText: '+2 bulan ini',
      badgeBg: 'bg-[#E4F6EC]',
      badgeColor: 'text-[#0B7A4E]',
    },
    {
      label: 'Ditolak',
      value: stats?.ditolak ?? 0,
      icon: XCircle,
      iconBg: 'bg-[#FDECEC]',
      iconColor: 'text-[#E5484D]',
      badgeText: 'Perlu revisi',
      badgeBg: 'bg-[#FDECEC]',
      badgeColor: 'text-[#D92D20]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-[20px] p-5 border border-[#E4EBE8] shadow-[0_4px_14px_rgba(13,51,38,0.04)]"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center ${card.iconColor}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${card.badgeBg} ${card.badgeColor}`}
              >
                {card.badgeText}
              </span>
            </div>
            <p className="text-xs text-[#5F6F6A] font-medium mt-4">{card.label}</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-[#EEF2F0] rounded-lg animate-pulse mt-1" />
            ) : (
              <p className="text-[28px] font-extrabold text-[#14201C] mt-0.5 leading-tight">
                {card.value}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PerencanaanStatCards;
