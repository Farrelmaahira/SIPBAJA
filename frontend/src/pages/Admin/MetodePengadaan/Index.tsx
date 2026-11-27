import { useEffect, useState, type FC } from 'react';
import axios from 'axios';
import { adminService } from '../../../services/adminService';
import AdminMetodePengadaanTemplate from '../../../components/templates/Admin/AdminMetodePengadaanTemplate';
import type { AdminMetodePengadaanItem, MetodePengadaanFormData } from '../../../types/admin';
import Pagination, { type PaginationMeta } from '../../../components/molecules/Pagination';

const EMPTY_FORM: MetodePengadaanFormData = {
  nama: '',
};

export const AdminMetodePengadaanIndex: FC = () => {
  const [items, setItems] = useState<AdminMetodePengadaanItem[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | number | null>(null);
  const [toggleTarget, setToggleTarget] = useState<AdminMetodePengadaanItem | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const [formData, setFormData] = useState<MetodePengadaanFormData>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [processing, setProcessing] = useState(false);

  const setFormField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchMetode = async (
    searchQuery = query,
    page = currentPage,
    statuses = selectedStatuses,
    signal?: AbortSignal
  ) => {
    setIsLoading(true);
    try {
      const res = await adminService.getMetodePengadaan({ q: searchQuery, page, statuses }, signal);

      if (res.metode_pengadaan?.data) {
        setItems(res.metode_pengadaan.data);
        setPaginationMeta({
          current_page: res.metode_pengadaan.current_page,
          last_page: res.metode_pengadaan.last_page,
          total: res.metode_pengadaan.total,
          from: res.metode_pengadaan.from,
          to: res.metode_pengadaan.to,
        });
      }
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      console.error('Failed to fetch metode pengadaan list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void fetchMetode(query, currentPage, selectedStatuses, controller.signal);
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

  const openEdit = (row: AdminMetodePengadaanItem) => {
    setFormData({
      nama: row.nama ?? '',
    });
    setErrors({});
    setEditId(row.id);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setErrors({});
  };

  const submitForm = async () => {
    setProcessing(true);
    setErrors({});

    try {
      if (modalMode === 'create') {
        await adminService.createMetodePengadaan({ nama: formData.nama });
      } else if (modalMode === 'edit' && editId) {
        await adminService.updateMetodePengadaan(editId, { nama: formData.nama });
      }
      closeModal();
      void fetchMetode();
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

  const askToggle = (row: AdminMetodePengadaanItem) => {
    setToggleTarget(row);
  };

  const cancelToggle = () => {
    setToggleTarget(null);
  };

  const confirmToggle = async () => {
    if (!toggleTarget?.id) return;

    setIsToggling(true);
    try {
      await adminService.toggleStatusMetodePengadaan(toggleTarget.id);
      setToggleTarget(null);
      void fetchMetode();
    } catch (err: unknown) {
      console.error('Failed to toggle status metode pengadaan:', err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <AdminMetodePengadaanTemplate
      rows={items}
      pagination={
        <Pagination
          meta={paginationMeta}
          onPageChange={(page) => setCurrentPage(page)}
        />
      }
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
    />
  );
};

export default AdminMetodePengadaanIndex;
