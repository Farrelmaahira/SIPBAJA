import { useState, useEffect, type FC, type FormEvent } from 'react';
import PerencanaanJenisMakTemplate from '../../../components/templates/PerencanaanJenisMakTemplate';
import perencanaanService from '../../../services/perencanaanService';
import type { JenisMakRow, PpkOption } from '../../../types/perencanaan';

function parseMakRow(item: any): JenisMakRow {
  const raw = item.nama || '';
  const parts = raw.split(' - ');
  const kode =
    item.kode ||
    (parts.length > 1 && /^\d+$/.test(parts[0].trim()) ? parts[0].trim() : '-');
  const namaBersih = parts.length > 1 ? parts.slice(1).join(' - ').trim() : raw;
  const ppkNama = item.ppk?.nama || item.Ppk?.nama || 'Belum Ditugaskan';

  return {
    id: item.id,
    kode,
    nama: namaBersih,
    penanggung_jawab: ppkNama,
    digunakan: item.permohonan_mak_count || 0,
    ppk_user_id: item.ppk_user_id || 1,
  };
}

export const PerencanaanJenisMakIndex: FC = () => {
  const [search, setSearch] = useState('');
  const [rawMaks, setRawMaks] = useState<any[]>([]);
  const [ppkOptions, setPpkOptions] = useState<PpkOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formKode, setFormKode] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formPpkId, setFormPpkId] = useState<number>(1);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<JenisMakRow | null>(null);

  const fetchJenisMak = async (q = search, signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const res = await perencanaanService.getJenisMakList(q, signal);
      if (Array.isArray(res.maks)) {
        setRawMaks(res.maks);
      } else if (res.maks && Array.isArray((res.maks as any).data)) {
        setRawMaks((res.maks as any).data);
      } else {
        setRawMaks([]);
      }

      if (res.ppkOptions && Array.isArray(res.ppkOptions)) {
        setPpkOptions(res.ppkOptions);
        if (res.ppkOptions.length > 0 && formPpkId === 1) {
          setFormPpkId(res.ppkOptions[0].id);
        }
      }
    } catch (err: any) {
      if (!signal?.aborted) {
        console.error('Failed to fetch Jenis MAK:', err);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchJenisMak(search, controller.signal);
    return () => controller.abort();
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    void fetchJenisMak(search);
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditId(null);
    setFormKode('');
    setFormNama('');
    if (ppkOptions.length > 0) {
      setFormPpkId(ppkOptions[0].id);
    }
    setFormModalOpen(true);
  };

  const handleOpenEdit = (row: JenisMakRow) => {
    setIsEdit(true);
    setEditId(row.id);
    setFormKode(row.kode);
    setFormNama(row.nama);
    setFormPpkId(row.ppk_user_id || (ppkOptions[0]?.id ?? 1));
    setFormModalOpen(true);
  };

  const handleOpenDelete = (row: JenisMakRow) => {
    setDeleteTarget(row);
    setDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formKode.trim() || !formNama.trim()) return;

    setProcessing(true);
    try {
      const payload = {
        kode: formKode.trim(),
        nama: `${formKode.trim()} - ${formNama.trim()}`,
        ppk_user_id: formPpkId,
      };

      if (isEdit && editId) {
        await perencanaanService.updateJenisMak(editId, payload);
      } else {
        await perencanaanService.storeJenisMak(payload);
      }

      setFormModalOpen(false);
      await fetchJenisMak(search);
    } catch (err) {
      console.error('Failed to save Jenis MAK:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setProcessing(true);
    try {
      await perencanaanService.deleteJenisMak(deleteTarget.id);
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      await fetchJenisMak(search);
    } catch (err) {
      console.error('Failed to delete Jenis MAK:', err);
    } finally {
      setProcessing(false);
    }
  };

  const rows: JenisMakRow[] = rawMaks.map(parseMakRow);

  return (
    <PerencanaanJenisMakTemplate
      rows={rows}
      searchQuery={search}
      isLoading={isLoading}
      processing={processing}
      onSearchChange={setSearch}
      onSearchSubmit={handleSearchSubmit}
      onOpenAddModal={handleOpenAdd}
      onOpenEditModal={handleOpenEdit}
      onOpenDeleteModal={handleOpenDelete}
      formModalOpen={formModalOpen}
      isEdit={isEdit}
      formKode={formKode}
      formNama={formNama}
      formPpkId={formPpkId}
      ppkOptions={ppkOptions}
      onCloseFormModal={() => setFormModalOpen(false)}
      onFormKodeChange={setFormKode}
      onFormNamaChange={setFormNama}
      onFormPpkChange={setFormPpkId}
      onFormSubmit={handleFormSubmit}
      deleteModalOpen={deleteModalOpen}
      deleteTarget={deleteTarget}
      onCloseDeleteModal={() => setDeleteModalOpen(false)}
      onConfirmDelete={handleConfirmDelete}
    />
  );
};

export default PerencanaanJenisMakIndex;
