import { useEffect, useState, type FC, type ChangeEvent } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [toggleTarget, setToggleTarget] = useState<MakRowItem | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState<MakFormData>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const setFormField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchMaks = async (searchQuery = query, page = currentPage, signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const data = await adminService.getMaks({ q: searchQuery, page }, signal);

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
      fetchMaks(query, currentPage, controller.signal);
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, currentPage]);

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
      } else if (modalMode === 'edit' && editId) {
        await adminService.updateMak(editId, formData);
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
      fetchMaks();
    } catch (err) {
      console.error('Failed to toggle status MAK:', err);
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
      onQueryChange={(e: ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
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
    />
  );
};

export default MakIndex;
