import { useEffect, useState, useMemo, type FC } from 'react';
import ppbjService from '../../../services/ppbjService';
import { useAuth } from '../../../hooks/useAuth';
import PermohonanIndexTemplate from '../../../components/templates/PermohonanIndexTemplate';
import type { PpbjPermohonanItem } from '../../../types/ppbj';
import type { AppTopbarUser } from '../../../components/organisms/AppTopbar';

export const PpbjPermohonanIndex: FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<PpbjPermohonanItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true);

    ppbjService
      .getPermohonanList(controller.signal)
      .then((data) => {
        if (!isMounted) return;
        setItems(data);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch PPBJ permohonan:', err);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const nomor = (item.nomorSurat || '').toLowerCase();
      const judul = (item.judul || '').toLowerCase();
      const unit = (item.unitNama || '').toLowerCase();
      return nomor.includes(q) || judul.includes(q) || unit.includes(q);
    });
  }, [items, searchQuery]);

  return (
    <PermohonanIndexTemplate
      user={user as AppTopbarUser | null}
      items={filteredItems}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      isLoading={isLoading}
    />
  );
};

export default PpbjPermohonanIndex;
