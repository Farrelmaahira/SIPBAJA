import { useEffect, useState, type FC, type ChangeEvent } from 'react';
import axios from 'axios';
import { adminService } from '../../../services/adminService';
import RoleTemplate, {
  type RoleRowItem,
  type RoleFormData,
} from '../../../components/templates/RoleTemplate';

const EMPTY_FORM: RoleFormData = {
  nama: '',
};

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export const RoleIndex: FC = () => {
  const [roles, setRoles] = useState<RoleRowItem[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleRowItem | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState<RoleFormData>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const setFormField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchRoles = async (searchQuery = query, page = currentPage, signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const data = await adminService.getRoles({ q: searchQuery, page }, signal);

      if (data.roles?.data) {
        setRoles(data.roles.data as unknown as RoleRowItem[]);
        setPaginationMeta({
          current_page: data.roles.current_page,
          last_page: data.roles.last_page,
          total: data.roles.total,
          from: data.roles.from,
          to: data.roles.to,
        });
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error('Failed to fetch role list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchRoles(query, currentPage, controller.signal);
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

  const openEdit = (row: RoleRowItem) => {
    setFormData({ nama: row.nama ?? '' });
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
      if (modalMode === 'edit' && editId) {
        await adminService.updateRole(editId, formData);
      } else if (modalMode === 'create') {
        await adminService.createRole(formData);
      }
      closeModal();
      fetchRoles();
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

  const askDelete = (row: RoleRowItem) => {
    setDeleteTarget(row);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await adminService.deleteRole(deleteTarget.id);
      setDeleteTarget(null);
      fetchRoles();
    } catch (err) {
      console.error('Failed to delete role:', err);
    }
  };

  const paginationComponent = paginationMeta && paginationMeta.last_page > 1 ? (
    <div className="flex items-center justify-between text-xs text-[#5F6F6A] pt-4">
      <span>
        Menampilkan {paginationMeta.from ?? 0}-{paginationMeta.to ?? 0} dari {paginationMeta.total}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={paginationMeta.current_page <= 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1.5 rounded-lg border border-[#E4EBE8] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EEF5F2]"
        >
          Sebelumnya
        </button>
        <span className="px-2">Halaman {paginationMeta.current_page} dari {paginationMeta.last_page}</span>
        <button
          type="button"
          disabled={paginationMeta.current_page >= paginationMeta.last_page}
          onClick={() => setCurrentPage((p) => Math.min(paginationMeta.last_page, p + 1))}
          className="px-3 py-1.5 rounded-lg border border-[#E4EBE8] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EEF5F2]"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  ) : null;

  return (
    <RoleTemplate
      rows={roles}
      pagination={paginationComponent}
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
      deleteTarget={deleteTarget}
      onAskDelete={askDelete}
      onCancelDelete={cancelDelete}
      onConfirmDelete={confirmDelete}
      isLoading={isLoading}
    />
  );
};

export default RoleIndex;
