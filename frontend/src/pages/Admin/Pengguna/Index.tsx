import { useEffect, useState, type FC, type ChangeEvent } from 'react';
import axios from 'axios';
import { adminService } from '../../../services/adminService';
import PenggunaTemplate, {
  type UserRowItem,
  type PenggunaFormData,
} from '../../../components/templates/PenggunaTemplate';

const EMPTY_FORM: PenggunaFormData = {
  nama: '',
  email: '',
  password: '',
  role_id: '',
  unit_id: '',
};

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export const PenggunaIndex: FC = () => {
  const [users, setUsers] = useState<UserRowItem[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [roles, setRoles] = useState<Array<{ id: number; nama: string }>>([]);
  const [units, setUnits] = useState<Array<{ id: number; nama: string }>>([]);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRowItem | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState<PenggunaFormData>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const setFormField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchUsers = async (searchQuery = query, page = currentPage, signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const data = await adminService.getUsers({ q: searchQuery, page }, signal);

      if (data.users?.data) {
        setUsers(data.users.data);
        setPaginationMeta({
          current_page: data.users.current_page,
          last_page: data.users.last_page,
          total: data.users.total,
          from: data.users.from,
          to: data.users.to,
        });
      }

      if (data.roles) setRoles(data.roles);
      if (data.units) setUnits(data.units);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error('Failed to fetch pengguna list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchUsers(query, currentPage, controller.signal);
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

  const openEdit = (row: UserRowItem) => {
    setFormData({
      nama: row.nama ?? '',
      email: row.email ?? '',
      password: '',
      role_id: (row as any).role_id ?? (row.role as any)?.id ?? '',
      unit_id: (row as any).unit_id ?? (row.unit as any)?.id ?? '',
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
        await adminService.createUser(formData);
      } else if (modalMode === 'edit' && editId) {
        const payload = { ...formData };
        if (!payload.password) {
          delete payload.password;
        }
        await adminService.updateUser(editId, payload);
      }
      closeModal();
      fetchUsers();
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

  const askDelete = (row: UserRowItem) => {
    setDeleteTarget(row);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await adminService.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete pengguna:', err);
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
    <PenggunaTemplate
      rows={users}
      pagination={paginationComponent}
      roles={roles}
      units={units}
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

export default PenggunaIndex;
