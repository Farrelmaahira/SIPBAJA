import { useState, useEffect, type FC, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import perencanaanService from '../../../services/perencanaanService';
import PerencanaanPengajuanShowTemplate from '../../../components/templates/PerencanaanPengajuanShowTemplate';
import type { PerencanaanPengajuanDetail } from '../../../types/perencanaan';

export interface PerencanaanShowProps {
  initialDetail?: PerencanaanPengajuanDetail | null;
  recentNotifications?: unknown[];
  unreadNotificationsCount?: number;
}

export const PerencanaanPengajuanShow: FC<PerencanaanShowProps> = ({
  initialDetail = null,
  recentNotifications = [],
  unreadNotificationsCount = 0,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<PerencanaanPengajuanDetail | null>(initialDetail);
  const [isLoading, setIsLoading] = useState<boolean>(!initialDetail);
  const [selectedMakIds, setSelectedMakIds] = useState<number[]>([]);
  const [isViewingDoc, setIsViewingDoc] = useState(false);
  const [isDownloadingDoc, setIsDownloadingDoc] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [alasanPenolakan, setAlasanPenolakan] = useState('');
  const [alasanError, setAlasanError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (initialDetail) {
      setDetail(initialDetail);
      if (initialDetail.selected_mak_ids?.length) {
        setSelectedMakIds(initialDetail.selected_mak_ids);
      } else if (initialDetail.maks?.length) {
        setSelectedMakIds([initialDetail.maks[0].id]);
      }
      setIsLoading(false);
      return;
    }

    if (!id) return;

    const controller = new AbortController();
    setIsLoading(true);

    perencanaanService
      .getPengajuanDetail(id, controller.signal)
      .then((res) => {
        setDetail(res.detail);
        if (res.detail.selected_mak_ids?.length) {
          setSelectedMakIds(res.detail.selected_mak_ids);
        } else if (res.detail.maks?.length) {
          setSelectedMakIds([res.detail.maks[0].id]);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error('Gagal mengambil data pengajuan perencanaan:', err);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [id, initialDetail]);

  const permohonan = detail?.permohonan;
  const rawStatus = permohonan?.status || 'diajukan';

  const mode =
    rawStatus === 'diajukan' || rawStatus === 'menunggu_verifikasi'
      ? 'verifikasi'
      : rawStatus === 'pengadaan' || rawStatus === 'disetujui'
        ? 'pengadaan'
        : 'diteruskan';

  const maksList = detail?.maks || [];

  const handleAddMakDropdown = () => {
    if (maksList.length === 0) return;
    const nextUnused =
      maksList.find((m) => !selectedMakIds.includes(m.id))?.id || maksList[0].id;
    setSelectedMakIds((prev) => [...prev, nextUnused]);
  };

  const handleRemoveMakDropdown = (idx: number) => {
    if (selectedMakIds.length > 1) {
      setSelectedMakIds((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleMakDropdownChange = (idx: number, val: number) => {
    setSelectedMakIds((prev) => prev.map((item, i) => (i === idx ? val : item)));
  };

  const handleApproveSubmit = async () => {
    const validIds = selectedMakIds.filter(Boolean);
    if (validIds.length === 0 || !id) return;
    setProcessing(true);
    try {
      await perencanaanService.approvePengajuan(id, validIds);
      setApproveModalOpen(false);
      navigate('/perencanaan/pengajuan');
    } catch (err) {
      console.error('Gagal menyetujui permohonan:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!alasanPenolakan || alasanPenolakan.trim().length < 5) {
      setAlasanError('Catatan penolakan wajib diisi minimal 5 karakter.');
      return;
    }
    setAlasanError('');
    if (!id) return;

    setProcessing(true);
    try {
      await perencanaanService.rejectPengajuan(id, alasanPenolakan.trim());
      setRejectModalOpen(false);
      navigate('/perencanaan/pengajuan');
    } catch (err) {
      console.error('Gagal menolak permohonan:', err);
    } finally {
      setProcessing(false);
    }
  };

  const dokumenUrl =
    detail?.dokumen?.download_url ||
    (permohonan?.id ? `/api/v1/perencanaan/pengajuan/${permohonan.id}/dokumen` : null);

  const handleViewDokumen = async () => {
    if (!dokumenUrl) return;
    setIsViewingDoc(true);
    try {
      const { blob } = await perencanaanService.fetchDokumenBlob(dokumenUrl, 'inline');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error('Gagal membuka dokumen:', err);
    } finally {
      setIsViewingDoc(false);
    }
  };

  const handleDownloadDokumen = async () => {
    if (!dokumenUrl) return;
    setIsDownloadingDoc(true);
    try {
      const { blob } = await perencanaanService.fetchDokumenBlob(dokumenUrl, 'attachment');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = detail?.dokumen?.nama_asli || `Dokumen_Permohonan_${permohonan?.nomor_surat || 'SIPBAJA'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('Gagal mengunduh dokumen:', err);
    } finally {
      setIsDownloadingDoc(false);
    }
  };

  return (
    <PerencanaanPengajuanShowTemplate
      detail={detail}
      isLoading={isLoading}
      mode={mode}
      maksList={maksList}
      selectedMakIds={selectedMakIds}
      onAddMak={handleAddMakDropdown}
      onRemoveMak={handleRemoveMakDropdown}
      onChangeMak={handleMakDropdownChange}
      onApproveClick={() => setApproveModalOpen(true)}
      onRejectClick={() => setRejectModalOpen(true)}
      onViewDokumen={handleViewDokumen}
      onDownloadDokumen={handleDownloadDokumen}
      isViewingDoc={isViewingDoc}
      isDownloadingDoc={isDownloadingDoc}
      processing={processing}
      approveModalOpen={approveModalOpen}
      rejectModalOpen={rejectModalOpen}
      alasanPenolakan={alasanPenolakan}
      alasanError={alasanError}
      onCloseApproveModal={() => setApproveModalOpen(false)}
      onCloseRejectModal={() => setRejectModalOpen(false)}
      onConfirmApprove={handleApproveSubmit}
      onConfirmReject={handleRejectSubmit}
      onAlasanChange={(val) => {
        setAlasanPenolakan(val);
        if (alasanError) setAlasanError('');
      }}
      recentNotifications={recentNotifications}
      unreadNotificationsCount={unreadNotificationsCount}
    />
  );
};

export default PerencanaanPengajuanShow;
