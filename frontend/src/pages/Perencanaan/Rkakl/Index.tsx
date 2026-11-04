import { useState, useEffect, useCallback, type FC, type FormEvent } from 'react';
import { perencanaanService } from '../../../services/perencanaanService';
import PerencanaanRkaklTemplate from '../../../components/templates/PerencanaanRkaklTemplate';
import type { RkaklActiveDoc, RkaklHistoryItem } from '../../../types/perencanaan';

export const PerencanaanRkaklIndex: FC = () => {
  const [activeDoc, setActiveDoc] = useState<RkaklActiveDoc | null>(null);
  const [historyList, setHistoryList] = useState<RkaklHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState('RKAKL_TA_2026_Satker_Politeknik_v4.pdf');
  const [processing, setProcessing] = useState(false);

  const fetchRkakl = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await perencanaanService.getRkaklData();
      const rkaklData = (res.rkakl || res.data || res) as {
        active_doc?: RkaklActiveDoc | null;
        history?: RkaklHistoryItem[];
      };
      setActiveDoc(rkaklData.active_doc || null);
      setHistoryList(rkaklData.history || []);
    } catch (err) {
      console.error('Failed to fetch RKAKL data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRkakl();
  }, [fetchRkakl]);

  const activeFilename =
    activeDoc?.nama_asli ||
    (activeDoc?.path ? activeDoc.path.split('/').pop() : '') ||
    'RKAKL_TA_2026_Satker_Politeknik_v3.pdf';

  const activeVersion = activeDoc?.versi ?? 3;

  const handleReplaceSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setProcessing(true);
    try {
      await perencanaanService.replaceRkakl(selectedFile);
      setReplaceModalOpen(false);
      await fetchRkakl();
    } catch (err) {
      console.error('Failed to update RKAKL:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PerencanaanRkaklTemplate
      activeFilename={activeFilename}
      activeVersion={activeVersion}
      historyList={historyList}
      isLoading={isLoading}
      replaceModalOpen={replaceModalOpen}
      fullPreviewOpen={fullPreviewOpen}
      selectedFile={selectedFile}
      processing={processing}
      onOpenReplaceModal={() => setReplaceModalOpen(true)}
      onCloseReplaceModal={() => setReplaceModalOpen(false)}
      onOpenFullPreview={() => setFullPreviewOpen(true)}
      onCloseFullPreview={() => setFullPreviewOpen(false)}
      onFileChange={(fileName) => setSelectedFile(fileName)}
      onReplaceSubmit={handleReplaceSubmit}
    />
  );
};

export default PerencanaanRkaklIndex;
