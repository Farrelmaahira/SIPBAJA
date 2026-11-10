import { useState, useEffect, type FC, type FormEvent } from 'react';
import PerencanaanJenisMakTemplate from '../../../components/templates/PerencanaanJenisMakTemplate';
import perencanaanService from '../../../services/perencanaanService';
import { extractServerErrors } from '../../../utils/fileValidation';
import type {
  JenisMakRow,
  PpkOption,
  PerencanaanMakRawItem,
} from '../../../types/perencanaan';

function parseMakRow(item: PerencanaanMakRawItem): JenisMakRow {
  const raw = item.nama || '';
  const parts = raw.split(' - ');
  const kode =
    item.kode ||
    (parts.length > 1 && /^\d+$/.test(parts[0].trim()) ? parts[0].trim() : '-');
  const namaBersih = parts.length > 1 ? parts.slice(1).join(' - ').trim() : raw;
  const ppkNama =
    item.ppk_user?.nama || item.ppk?.nama || item.Ppk?.nama || 'Belum Ditugaskan';

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
  const [rawMaks, setRawMaks] = useState<PerencanaanMakRawItem[]>([]);
  const [ppkOptions, setPpkOptions] = useState<PpkOption[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [flashSuccess, setFlashSuccess] = useState('');
  const [flashError, setFlashError] = useState('');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formKode, setFormKode] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formPpkId, setFormPpkId] = useState<number>(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<JenisMakRow | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchJenisMak = async (
    q = search,
    page = currentPage,
    signal?: AbortSignal
  ) => {
    setIsLoading(true);
    setFlashError('');
    try {
      const res = await perencanaanService.getJenisMakList(q, signal, page);
      if (Array.isArray(res.maks)) {
        setRawMaks(res.maks);
        setCurrentPage(1);
        setLastPage(1);
      } else if (res.maks && Array.isArray(res.maks.data)) {
        setRawMaks(res.maks.data);
        setCurrentPage(res.maks.current_page ?? page);
        setLastPage(res.maks.last_page ?? 1);
      } else {
        setRawMaks([]);
      }

      if (res.ppkOptions && Array.isArray(res.ppkOptions)) {
        setPpkOptions(res.ppkOptions);
        if (res.ppkOptions.length > 0 && formPpkId === 1) {
          setFormPpkId(res.ppkOptions[0].id);
        }
      }
    } catch (err: unknown) {
      if (!signal?.aborted) {
        console.error('Failed to fetch Jenis MAK:', err);
        setFlashError('Gagal memuat daftar Jenis MAK.');
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchJenisMak(search, currentPage, controller.signal);
    return () => controller.abort();
  }, [currentPage]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    void fetchJenisMak(search, 1);
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditId(null);
    setFormKode('');
    setFormNama('');
    setFieldErrors({});
    setFormError('');
    if (ppkOptions.length > 0) {
      setFormPpkId(ppkOptions[0].id);
    }
    setFormModalOpen(true);
  };

  const handleOpenEdit = (row: JenisMakRow) => {
    setIsEdit(true);
    setEditId(row.id);
    setFormKode(row.kode === '-' ? '' : row.kode);
    setFormNama(row.nama);
    setFormPpkId(row.ppk_user_id || (ppkOptions[0]?.id ?? 1));
    setFieldErrors({});
    setFormError('');
    setFormModalOpen(true);
  };

  const handleOpenDelete = (row: JenisMakRow) => {
    setDeleteTarget(row);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formKode.trim() || !formNama.trim()) return;

    setProcessing(true);
    setFieldErrors({});
    setFormError('');
    setFlashSuccess('');
    try {
      const payload = {
        kode: formKode.trim(),
        nama: `${formKode.trim()} - ${formNama.trim()}`,
        ppk_user_id: formPpkId,
      };

      if (isEdit && editId) {
        const res = await perencanaanService.updateJenisMak(editId, payload);
        setFlashSuccess(res.message || 'Jenis MAK berhasil diperbarui.');
      } else {
        const res = await perencanaanService.storeJenisMak(payload);
        setFlashSuccess(res.message || 'Jenis MAK berhasil ditambahkan.');
      }

      setFormModalOpen(false);
      await fetchJenisMak(search, currentPage);
    } catch (err: unknown) {
      const serverErr = extractServerErrors(err);
      setFieldErrors(serverErr.fieldErrors);
      setFormError(serverErr.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setProcessing(true);
    setDeleteError('');
    setFlashSuccess('');
    try {
      const res = await perencanaanService.deleteJenisMak(deleteTarget.id);
      setFlashSuccess(res.message || 'Jenis MAK berhasil dihapus.');
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      await fetchJenisMak(search, currentPage);
    } catch (err: unknown) {
      const serverErr = extractServerErrors(err);
      setDeleteError(
        serverErr.fieldErrors.mak_id ||
          serverErr.message ||
          'Jenis MAK tidak dapat dihapus karena sedang digunakan pada pengadaan aktif.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const rows: JenisMakRow[] = rawMaks.map(parseMakRow);

  return (
    <PerencanaanJenisMakTemplate
      rows={rows}
      searchQuery={search}
      currentPage={currentPage}
      lastPage={lastPage}
      isLoading={isLoading}
      processing={processing}
      flashSuccess={flashSuccess}
      flashError={flashError}
      onSearchChange={setSearch}
      onSearchSubmit={handleSearchSubmit}
      onPageChange={setCurrentPage}
      onOpenAddModal={handleOpenAdd}
      onOpenEditModal={handleOpenEdit}
      onOpenDeleteModal={handleOpenDelete}
      formModalOpen={formModalOpen}
      isEdit={isEdit}
      formKode={formKode}
      formNama={formNama}
      formPpkId={formPpkId}
      ppkOptions={ppkOptions}
      fieldErrors={fieldErrors}
      formError={formError}
      onCloseFormModal={() => setFormModalOpen(false)}
      onFormKodeChange={setFormKode}
      onFormNamaChange={setFormNama}
      onFormPpkChange={setFormPpkId}
      onFormSubmit={handleFormSubmit}
      deleteModalOpen={deleteModalOpen}
      deleteTarget={deleteTarget}
      deleteError={deleteError}
      onCloseDeleteModal={() => setDeleteModalOpen(false)}
      onConfirmDelete={handleConfirmDelete}
    />
  );
};

export default PerencanaanJenisMakIndex;
