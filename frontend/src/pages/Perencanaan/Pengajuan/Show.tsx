import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PerencanaanPengajuanShowTemplate from '../../../components/templates/PerencanaanPengajuanShowTemplate';
import { usePerencanaanPengajuan } from '../../../hooks/usePerencanaanPengajuan';
import type { PerencanaanPengajuanDetail } from '../../../types/perencanaan';
import type { NotificationItem } from '../../../types/notification';

export interface PerencanaanShowProps {
  initialDetail?: PerencanaanPengajuanDetail | null;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

export const PerencanaanPengajuanShow: FC<PerencanaanShowProps> = ({
  initialDetail = null,
  recentNotifications = [],
  unreadNotificationsCount = 0,
}) => {
  const { id } = useParams<{ id: string }>();
  const pengajuan = usePerencanaanPengajuan({ id, initialDetail });
  const navigate = useNavigate();

  return (
    <PerencanaanPengajuanShowTemplate
      detail={pengajuan.detail}
      dokumenList={pengajuan.allDocuments}
      isLoading={pengajuan.isLoading}
      mode={pengajuan.mode}
      maksList={pengajuan.maksList}
      selectedMakIds={pengajuan.selectedMakIds}
      catatanVerifikasi={pengajuan.catatanVerifikasi}
      makError={pengajuan.makError}
      catatanError={pengajuan.catatanError}
      flashSuccess={pengajuan.flashSuccess}
      flashError={pengajuan.flashError}
      onAddMak={pengajuan.handleAddMakDropdown}
      onRemoveMak={pengajuan.handleRemoveMakDropdown}
      onChangeMak={pengajuan.handleMakDropdownChange}
      onCatatanChange={pengajuan.setCatatanVerifikasi}
      onApproveClick={() => pengajuan.setApproveModalOpen(true)}
      onRejectClick={() => pengajuan.setRejectModalOpen(true)}
      onViewDokumen={pengajuan.handleViewDokumen}
      onDownloadDokumen={pengajuan.handleDownloadDokumen}
      isViewingDocId={pengajuan.isViewingDocId}
      isDownloadingDocId={pengajuan.isDownloadingDocId}
      previewBlobUrl={pengajuan.previewBlobUrl}
      previewDocId={pengajuan.previewDocId}
      isLoadingPreview={pengajuan.isLoadingPreview}
      rkaklPreviewBlobUrl={pengajuan.rkaklPreviewBlobUrl}
      isLoadingRkaklPreview={pengajuan.isLoadingRkaklPreview}
      processing={pengajuan.processing}
      pengadaanMakDrafts={pengajuan.pengadaanMakDrafts}
      updatingPengadaanId={pengajuan.updatingPengadaanId}
      pengadaanMakErrors={pengajuan.pengadaanMakErrors}
      onPengadaanMakDraftChange={pengajuan.handlePengadaanMakDraftChange}
      onSavePengadaanMak={pengajuan.handleSavePengadaanMak}
      approveModalOpen={pengajuan.approveModalOpen}
      rejectModalOpen={pengajuan.rejectModalOpen}
      alasanPenolakan={pengajuan.alasanPenolakan}
      alasanError={pengajuan.alasanError}
      catatanApprove={pengajuan.catatanApprove}
      onChangeCatatanApprove={pengajuan.setCatatanApprove}
      onCloseApproveModal={() => pengajuan.setApproveModalOpen(false)}
      onCloseRejectModal={() => pengajuan.setRejectModalOpen(false)}
      onConfirmApprove={pengajuan.handleApproveSubmit}
      onConfirmReject={pengajuan.handleRejectSubmit}
      onAlasanChange={(val) => {
        pengajuan.setAlasanPenolakan(val);
        if (pengajuan.alasanError) pengajuan.setAlasanError('');
      }}
      onBack={() => navigate('/perencanaan/pengajuan')}
      recentNotifications={recentNotifications}
      unreadNotificationsCount={unreadNotificationsCount}
    />
  );
};

export default PerencanaanPengajuanShow;
