import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PpkPermohonanReviewTemplate from '../../../components/templates/PPK/PpkPermohonanReviewTemplate';
import { usePpkPermohonanReview } from '../../../hooks/usePpkPermohonanReview';
import { useNotifications } from '../../../hooks/useNotifications';
import { PPK_NAV_ITEMS } from '@/constants/ppkNav';

export const PpkPermohonanReview: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recentNotifications, unreadCount } = useNotifications();

  const review = usePpkPermohonanReview(id, () => navigate('/ppk/permohonan'));

  return (
    <PpkPermohonanReviewTemplate
      navItems={PPK_NAV_ITEMS}
      viewModel={review.viewModel}
      isLoading={review.isLoading}
      error={review.error}
      onViewDokumen={review.viewDokumen}
      onDownloadDokumen={review.downloadDokumen}
      isViewingDocId={review.viewingDocId}
      isDownloadingDocId={review.downloadingDocId}
      previewBlobUrl={review.previewBlobUrl}
      previewDocId={review.previewDocId}
      isLoadingPreview={review.isLoadingPreview}
      approveModalOpen={review.approveModalOpen}
      onOpenApproveModal={review.openApproveModal}
      onCloseApproveModal={review.closeApproveModal}
      selectedMemoFile={review.selectedMemoFile}
      memoFileError={review.memoFileError}
      onSelectMemoFile={review.selectMemoFile}
      onApproveSubmit={review.submitApprove}
      rejectModalOpen={review.rejectModalOpen}
      onOpenRejectModal={review.openRejectModal}
      onCloseRejectModal={review.closeRejectModal}
      alasanTolak={review.alasanTolak}
      alasanError={review.alasanError}
      onAlasanTolakChange={review.setAlasanTolak}
      onRejectSubmit={review.submitReject}
      isSubmitting={review.isSubmitting}
      recentNotifications={recentNotifications}
      unreadNotificationsCount={unreadCount}
    />
  );
};

export default PpkPermohonanReview;
