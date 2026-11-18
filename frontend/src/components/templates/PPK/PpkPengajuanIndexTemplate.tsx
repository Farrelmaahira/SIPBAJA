import { type FC, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye } from 'lucide-react';
import AppLayout, { type AppNavItem } from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import CrudTable, { type CrudColumn } from '../../organisms/CrudTable';
import FilterPengajuanModal from '../../organisms/FilterPengajuanModal';
import TableToolbar from '../../molecules/TableToolbar';
import TableFooter from '../../molecules/TableFooter';
import StatusPill from '../../atoms/StatusPill';
import { formatRupiah, formatTanggal } from '../../../utils/formatters';
import type { NotificationItem } from '../../../types/notification';
import type { PpPaginationMeta, PpkRkaklDoc, PpkTableRow } from '../../../types/ppk';

export interface PpkPengajuanIndexTemplateProps {
  navItems: AppNavItem[];
  rows: PpkTableRow[];
  meta: PpPaginationMeta;
  search: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  selectedStatuses: string[];
  bulan: string;
  tahun: string;
  onBulanChange: (val: string) => void;
  onTahunChange: (val: string) => void;
  filterOpen: boolean;
  onOpenFilter: () => void;
  onCloseFilter: () => void;
  onApplyFilter: (statuses: string[]) => void;
  onPageChange: (page: number) => void;
  activeRkakl: PpkRkaklDoc | null;
  onPreviewRkakl: (doc: PpkRkaklDoc) => void;
  isLoading: boolean;
  recentNotifications: NotificationItem[];
  unreadNotificationsCount: number;
}

export const PpkPengajuanIndexTemplate: FC<PpkPengajuanIndexTemplateProps> = ({
  navItems,
  rows,
  meta,
  search,
  onSearchChange,
  onSearchSubmit,
  selectedStatuses,
  bulan,
  tahun,
  onBulanChange,
  onTahunChange,
  filterOpen,
  onOpenFilter,
  onCloseFilter,
  onApplyFilter,
  onPageChange,
  activeRkakl,
  onPreviewRkakl,
  isLoading,
  recentNotifications,
  unreadNotificationsCount,
}) => {
  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;

  const columns: CrudColumn<PpkTableRow>[] = [
    {
      key: 'nomor_surat',
      header: 'No Permohonan',
      className: 'font-bold text-[#0E7C5A] whitespace-nowrap',
      render: (row) => (
        <Link to={`/ppk/pengajuan/${row.id}/review?type=permohonan`} className="hover:underline">
          {row.nomor_surat || '-'}
        </Link>
      ),
    },
    {
      key: 'judul',
      header: 'Judul Pengadaan',
      className: 'font-bold text-[#14201C]',
      render: (row) => row.judul || '-',
    },
    {
      key: 'tanggal',
      header: 'Tanggal',
      className: 'text-[#5F6F6A] whitespace-nowrap',
      render: (row) => formatTanggal(row.tanggal),
    },
    {
      key: 'nominal',
      header: 'Nilai Pengajuan',
      className: 'font-bold text-[#14201C] whitespace-nowrap',
      render: (row) => formatRupiah(row.nominal),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'whitespace-nowrap',
      render: (row) => <StatusPill status={row.status} />,
    },
  ];

  const toolbar = (
    <TableToolbar
      searchValue={search}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      filterStatusCount={selectedStatuses.length}
      onFilterStatusClick={onOpenFilter}
      selectedBulan={bulan}
      onBulanChange={onBulanChange}
      selectedTahun={tahun}
      onTahunChange={onTahunChange}
      total={`${meta.total ?? rows.length} permohonan`}
    />
  );

  const footer = (
    <TableFooter
      currentPage={currentPage}
      lastPage={lastPage}
      isLoading={isLoading}
      onPageChange={onPageChange}
    />
  );

  return (
    <AppLayout
      activeRoute="pengajuan"
      navItems={navItems}
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      profileHref="/ppk/profil"
      notifikasiHref="/ppk/notifikasi"
      readAllHref="/ppk/notifikasi/read-all"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      breadcrumb={[
        { label: 'PPK', href: '/ppk/dashboard' },
        { label: 'DAFTAR PENGAJUAN' },
      ]}
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="DAFTAR PERMOHONAN"
          title="Daftar Permohonan PPK"
          description="Pantau dan verifikasi permohonan pengadaan yang terikat dengan Jenis MAK dalam wewenang Anda."
        />

        {/* Banner RKAKL Aktif */}
        {activeRkakl && (
          <div className="bg-white rounded-[22px] border border-[#E4EBE8] p-5 shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E4F6EC] text-[#0B7A4E]">
                    RKAKL AKTIF {activeRkakl.tahun_anggaran || '2026'}
                  </span>
                  <span className="text-xs text-[#8A9A95]">v{activeRkakl.versi ?? 1}</span>
                </div>
                <p className="text-sm font-bold text-[#14201C] mt-1">{activeRkakl.nama_asli}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onPreviewRkakl(activeRkakl)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E7C5A] hover:bg-[#0B684A] text-white text-xs font-bold transition shadow-[0_4px_12px_rgba(14,124,90,0.2)] cursor-pointer self-start sm:self-auto"
            >
              <Eye className="w-4 h-4" />
              <span>Pratinjau RKAKL</span>
            </button>
          </div>
        )}

        <CrudTable
          title="Daftar Permohonan Pengadaan"
          subtitle="Permohonan pengadaan yang terikat Jenis MAK dalam wewenang PPK"
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          toolbar={toolbar}
          footer={footer}
          actions={[
            {
              key: 'view',
              label: 'Detail / Review',
              href: (row) => `/ppk/pengajuan/${row.id}/review?type=permohonan`,
            },
          ]}
        />
      </div>

      <FilterPengajuanModal
        isOpen={filterOpen}
        onClose={onCloseFilter}
        selectedStatuses={selectedStatuses}
        onApplyFilter={onApplyFilter}
      />
    </AppLayout>
  );
};

export default PpkPengajuanIndexTemplate;
