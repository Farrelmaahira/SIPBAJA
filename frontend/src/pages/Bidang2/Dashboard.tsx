import type { FC } from 'react';
import { useAuth } from '../../hooks/useAuth';
import useBidang2Dashboard from '../../hooks/useBidang2Dashboard';
import Bidang2DashboardTemplate from '../../components/templates/Bidang2DashboardTemplate';
import type { PermohonanDetailData } from '../../components/organisms/DetailPermohonanModal';
import type { Bidang2PermohonanItem } from '../../components/molecules/Bidang2PermohonanRow';

export const Bidang2Dashboard: FC = () => {
  const { user } = useAuth();

  const {
    ringkasan,
    riwayatTerbaru,
    chartData,
    totalDisetujui,
    totalDitolak,
    tahunAktif,
    viewMode,
    setViewMode,
    gantiTahun,
    selectedPermohonan,
    setSelectedPermohonan,
    isLoading,
    isError,
  } = useBidang2Dashboard();

  const detailModalData: PermohonanDetailData | null = selectedPermohonan
    ? {
        id: selectedPermohonan.id,
        nomor_surat: selectedPermohonan.nomor_surat ?? '-',
        judul: selectedPermohonan.judul ?? 'Tanpa Judul',
        status: (selectedPermohonan.status as any) ?? 'diajukan',
        tanggal: selectedPermohonan.created_at ?? null,
        nilai_pengajuan: Number(selectedPermohonan.estimasi_anggaran ?? 0),
        deskripsi: selectedPermohonan.ringkasan_tujuan ?? '',
        dokumen: Array.isArray(selectedPermohonan.dokumen) ? selectedPermohonan.dokumen : [],
      }
    : null;

  return (
    <Bidang2DashboardTemplate
      user={user}
      ringkasan={ringkasan}
      riwayatTerbaru={riwayatTerbaru}
      chartData={chartData ?? undefined}
      totalDisetujui={totalDisetujui}
      totalDitolak={totalDitolak}
      tahunAktif={tahunAktif}
      viewMode={viewMode as 'bulan' | 'tahun'}
      onViewModeChange={(m) => setViewMode(m)}
      gantiTahun={(t) => void gantiTahun(t)}
      selectedPermohonan={detailModalData}
      onSelectPermohonan={(item: Bidang2PermohonanItem) => setSelectedPermohonan(item as any)}
      onCloseDetail={() => setSelectedPermohonan(null)}
      isLoading={isLoading}
      isError={isError}
    />
  );
};

export default Bidang2Dashboard;
