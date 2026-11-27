import { useEffect, useState, type FC } from 'react';
import axios from 'axios';
import { adminService } from '../../../services/adminService';
import AdminMakTemplate, { type MakFormData } from '../../../components/templates/Admin/AdminMakTemplate';
import type { MakRowItem, PpkOptionUser } from '../../../types/admin';
import Pagination, { type PaginationMeta } from '../../../components/molecules/Pagination';

const EMPTY_FORM: MakFormData = {
  nama: '',
  ppk_id: '',
};

export const MakIndex: FC = () => {
  const [maks, setMaks] = useState<MakRowItem[]>([]);
  const [ppkOptions, setPpkOptions] = useState<PpkOptionUser[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [toggleTarget, setToggleTarget] = useState<MakRowItem | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [flash, setFlash] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState<MakFormData>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const setFormField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchMaks = async (
    searchQuery = query,
    page = currentPage,
    statuses = selectedStatuses,
    signal?: AbortSignal
  ) => {
    setIsLoading(true);
    try {
      const data = await adminService.getMaks({ q: searchQuery, page, statuses }, signal);

      if (data.maks?.data) {
        setMaks(data.maks.data as unknown as MakRowItem[]);
        setPaginationMeta({
          current_page: data.maks.current_page,
          last_page: data.maks.last_page,
          total: data.maks.total,
          from: data.maks.from,
          to: data.maks.to,
        });
      }

      if (data.ppkOptions) {
        setPpkOptions(data.ppkOptions);
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error('Failed to fetch MAK list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchMaks(query, currentPage, selectedStatuses, controller.signal);
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, currentPage, selectedStatuses]);

  const openCreate = () => {
    setFormData({ ...EMPTY_FORM });
    setErrors({});
    setEditId(null);
    setModalMode('create');
  };

  const openEdit = (row: MakRowItem) => {
    setFormData({
      nama: row.nama ?? '',
      ppk_id: (row as any).ppk_id ?? row.ppk?.id ?? '',
    });
    setErrors({});
    setEditId(row.id);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditId(null);
  };

  const submitForm = async () => {
    setProcessing(true);
    setErrors({});

    try {
      if (modalMode === 'create') {
        await adminService.createMak(formData);
        setFlash({ type: 'success', message: 'MAK berhasil ditambahkan.' });
      } else if (modalMode === 'edit' && editId) {
        await adminService.updateMak(editId, formData);
        setFlash({ type: 'success', message: 'MAK berhasil diperbarui.' });
      }
      closeModal();
      fetchMaks();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(err.response.data.errors)) {
          flat[k] = Array.isArray(v) ? (v[0] as string) : String(v);
        }
        setErrors(flat);
      } else {
        setFlash({ type: 'error', message: err.response?.data?.message || 'Gagal menyimpan MAK.' });
      }
    } finally {
      setProcessing(false);
    }
  };

  const askToggle = (row: MakRowItem) => {
    setToggleTarget(row);
  };

  const cancelToggle = () => {
    setToggleTarget(null);
  };

  const confirmToggle = async () => {
    if (!toggleTarget) return;

    setIsToggling(true);
    try {
      await adminService.toggleStatusMak(toggleTarget.id);
      setToggleTarget(null);
      setFlash({ type: 'success', message: 'Status MAK berhasil diperbarui.' });
      fetchMaks();
    } catch (err: any) {
      console.error('Failed to toggle status MAK:', err);
      setFlash({ type: 'error', message: err.response?.data?.message || 'Gagal mengubah status MAK.' });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <AdminMakTemplate
      rows={maks}
      pagination={
        <Pagination
          meta={paginationMeta}
          onPageChange={(page) => setCurrentPage(page)}
        />
      }
      ppkOptions={ppkOptions}
      query={query}
      onQueryChange={(value: string) => {
        setQuery(value);
        setCurrentPage(1);
      }}
      selectedStatuses={selectedStatuses}
      filterModalOpen={filterModalOpen}
      onToggleFilterModal={setFilterModalOpen}
      onApplyFilters={(statuses) => {
        setSelectedStatuses(statuses);
        setCurrentPage(1);
      }}
      modalMode={modalMode}
      form={{
        data: formData,
        setData: setFormField,
        errors,
        processing,
      }}
      onOpenCreate={openCreate}
      onOpenEdit={openEdit}
      onCloseModal={closeModal}
      onSubmitForm={submitForm}
      toggleTarget={toggleTarget}
      onAskToggle={askToggle}
      onCancelToggle={cancelToggle}
      onConfirmToggle={confirmToggle}
      isToggling={isToggling}
      isLoading={isLoading}
      flashType={flash?.type}
      flashMessage={flash?.message ?? null}
      onDismissFlash={() => setFlash(null)}
    />
  );
};

export default MakIndex;
