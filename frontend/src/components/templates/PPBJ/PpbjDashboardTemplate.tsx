import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Hourglass,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatCard from '../../molecules/StatCard';
import StatistikChart, { type ChartDatum } from '../../organisms/StatistikChart';
import PpbjDashboardTableCard, { type PpbjDashboardTableRow } from '../../organisms/PpbjDashboardTableCard';
import type { PpbjStatItem } from '../../../types/ppbj';
import type { AppTopbarUser } from '../../organisms/AppTopbar';
import { PPBJ_NAV_ITEMS } from '../../../constants/ppbjNav';

export interface PpbjDashboardTemplateProps {
  user?: AppTopbarUser | null;
  stats?: PpbjStatItem[];
  permohonanRows?: PpbjDashboardTableRow[];
  pengadaanRows?: PpbjDashboardTableRow[];
  chartData?: ChartDatum[];
  viewMode: 'bulan' | 'tahun';
  onViewModeChange: (mode: 'bulan' | 'tahun') => void;
  isLoading?: boolean;
  errorMessage?: string;
}

export const PpbjDashboardTemplate: FC<PpbjDashboardTemplateProps> = ({
  user = null,
  stats = [],
  permohonanRows = [],
  pengadaanRows = [],
  chartData,
  viewMode,
  onViewModeChange,
  isLoading = false,
  errorMessage = '',
}) => {
  const navigate = useNavigate();

  const statIcons = [FileText, Hourglass, CheckCircle2, XCircle];
  const statBgColors = ['bg-[#E4F6EC]', 'bg-[#E8F0FF]', 'bg-[#E4F6EC]', 'bg-[#FDECEC]'];
  const statTextColors = ['text-[#0E7C5A]', 'text-[#2F68D6]', 'text-[#0E7C5A]', 'text-[#D92D20]'];
  const badgeVariants: Array<'success' | 'info' | 'danger'> = ['success', 'info', 'success', 'danger'];

  const totalDisetujui = Number(stats[2]?.value ?? 0);
  const totalDitolak = Number(stats[3]?.value ?? 0);

  return (
    <AppLayout
      activeRoute="dashboard"
      navItems={PPBJ_NAV_ITEMS}
      roleInitials="PB"
      roleTitle="PPBJ"
      roleSubtitle="Unit PPBJ"
      user={user}
      flash={errorMessage ? { error: errorMessage } : undefined}
      breadcrumb={[
        { label: 'DASHBOARD', href: '/ppbj/dashboard' },
      ]}
    >
      <div className="space-y-6">
        {/* Hero Banner Organism */}
        <HeroBanner
          eyebrow="DASHBOARD"
          title="Selamat datang, PPBJ"
          description="Pantau, verifikasi, dan kelola seluruh permohonan pengadaan yang masuk dalam satu tempat."
          ctaLabel="Lihat Pengajuan"
          ctaIcon={FileText}
          onCta={() => navigate('/ppbj/pengadaan')}
        />

        {/* Stat Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Ringkasan Statistik">
          {stats.slice(0, 4).map((item, index) => (
            <StatCard
              key={index}
              icon={statIcons[index] || FileText}
              label={item.label}
              value={isLoading ? '-' : item.value}
              iconBg={statBgColors[index] || 'bg-[#E4F6EC]'}
              iconColor={statTextColors[index] || 'text-[#0E7C5A]'}
              badge={{
                label: item.unit,
                variant: badgeVariants[index] || 'info',
              }}
            />
          ))}
        </section>

        {/* Statistik Permohonan Chart */}
        <StatistikChart
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          chartData={chartData}
          totalDisetujui={totalDisetujui}
          totalDitolak={totalDitolak}
          isLoading={isLoading}
        />

        {/* Permohonan Masuk Terbaru */}
        <PpbjDashboardTableCard
          title="Permohonan Masuk Terbaru"
          subtitle="4 permohonan terbaru · diperbarui hari ini"
          lihatSemuaHref="/ppbj/permohonan"
          numberColumnLabel="NO PERMOHONAN"
          rows={permohonanRows}
          isLoading={isLoading}
          emptyMessage="Belum ada permohonan masuk."
        />

        {/* Pengadaan Terbaru */}
        <PpbjDashboardTableCard
          title="Pengadaan Terbaru"
          subtitle="4 pengadaan terbaru · diperbarui hari ini"
          lihatSemuaHref="/ppbj/pengadaan"
          numberColumnLabel="NO PENGADAAN"
          rows={pengadaanRows}
          isLoading={isLoading}
          emptyMessage="Belum ada pengadaan terbaru."
        />
      </div>
    </AppLayout>
  );
};

export default PpbjDashboardTemplate;
