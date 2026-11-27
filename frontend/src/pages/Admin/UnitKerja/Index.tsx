import { useEffect, useState, type FC } from 'react';
import axios from 'axios';
import { adminService } from '../../../services/adminService';
import UnitKerjaTemplate from '../../../components/templates/Admin/UnitKerjaTemplate';
import type { UnitKerjaFormData, UnitKerjaItem } from '../../../types/admin';
import Pagination, { type PaginationMeta } from '../../../components/molecules/Pagination';

const EMPTY_FORM: UnitKerjaFormData = {
  nama: '',
};

export const UnitKerjaIndex: FC = () => {
  const [units, setUnits] = useState<UnitKerjaItem[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [toggleTarget, setToggleTarget] = useState<UnitKerjaItem | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [editId, setEditId] = useState<string | number | null>(null);

  const [formData, setFormData] = useState<UnitKerjaFormData>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [processing, setProcessing] = useState(false);

  const setFormField = (fieldOrObj: any, value?: any) => {
    if (typeof fieldOrObj === 'string') {
      setFormData((prev) => ({ ...prev, [fieldOrObj]: value }));
    } else if (typeof fieldOrObj === 'object' && fieldOrObj !== null) {
      setFormData((prev) => ({ ...prev, ...fieldOrObj }));
    }
  };

  const fetchUnits = async (
    searchQuery = query,
    page = currentPage,
    statuses = selectedStatuses,
    signal?: AbortSignal
  ) => {
    setIsLoading(true);
    try {
      const data = await adminService.getUnits({ q: searchQuery, page, statuses }, signal);

      if (data.units?.data) {
        setUnits(data.units.data);
        setPaginationMeta({
          current_page: data.units.current_page,
          last_page: data.units.last_page,
          total: data.units.total,
          from: data.units.from,
          to: data.units.to,
        });
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error('Failed to fetch unit kerja list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchUnits(query, currentPage, selectedStatuses, controller.signal);
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

  const openEdit = (row: UnitKerjaItem) => {
    setFormData({ nama: row.nama ?? '' });
    setErrors({});
    setEditId(row.id ?? null);
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
        await adminService.createUnit(formData);
      } else if (modalMode === 'edit' && editId) {
        await adminService.updateUnit(editId, formData);
      }
      closeModal();
      fetchUnits();
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

  const askToggle = (row: UnitKerjaItem) => {
    setToggleTarget(row);
  };

  const cancelToggle = () => {
    setToggleTarget(null);
  };

  const confirmToggle = async () => {
    if (!toggleTarget || !toggleTarget.id) return;

    setIsToggling(true);
    try {
      await adminService.toggleStatusUnit(toggleTarget.id);
      setToggleTarget(null);
      fetchUnits();
    } catch (err) {
      console.error('Failed to toggle status unit kerja:', err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <UnitKerjaTemplate
      rows={units}
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

export default UnitKerjaIndex;
