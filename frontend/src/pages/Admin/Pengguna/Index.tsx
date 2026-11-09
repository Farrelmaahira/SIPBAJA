import { useEffect, useState, type FC, type ChangeEvent } from 'react';
import axios from 'axios';
import { adminService } from '../../../services/adminService';
import PenggunaTemplate, {
  type UserRowItem,
  type PenggunaFormData,
} from '../../../components/templates/PenggunaTemplate';
import Pagination, { type PaginationMeta } from '../../../components/molecules/Pagination';

const EMPTY_FORM: PenggunaFormData = {
  nama: '',
  email: '',
  password: '',
  role_id: '',
  unit_id: '',
};

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

  return (
    <PenggunaTemplate
      rows={users}
      pagination={
        <Pagination
          meta={paginationMeta}
          onPageChange={(page) => setCurrentPage(page)}
        />
      }
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
