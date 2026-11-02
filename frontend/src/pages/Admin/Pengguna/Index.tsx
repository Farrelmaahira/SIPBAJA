import { useEffect, useState, type FC, type ChangeEvent } from 'react';
import axios from 'axios';
import api from '../../../services/api';
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

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export const PenggunaIndex: FC = () => {
  const [users, setUsers] = useState<UserRowItem[]>([]);
  const [paginationLinks, setPaginationLinks] = useState<PaginationLink[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
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

  const fetchUsers = async (searchQuery = query, page = currentPage) => {
    setIsLoading(true);
    try {
      const res = await api.get<{
        users?: {
          data?: UserRowItem[];
          links?: PaginationLink[];
          current_page?: number;
        };
        data?: UserRowItem[];
        roles?: any[];
        units?: any[];
      }>('/v1/admin/pengguna', {
        params: { q: searchQuery, page },
      });

      const data = res.data;
      if (data.users?.data) {
        setUsers(data.users.data);
        setPaginationLinks(data.users.links || []);
      } else if (Array.isArray(data.data)) {
        setUsers(data.data);
      } else if (Array.isArray(data)) {
        setUsers(data as UserRowItem[]);
      }

      if (data.roles) setRoles(data.roles);
      if (data.units) setUnits(data.units);
    } catch (err) {
      console.error('Failed to fetch pengguna list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(query, 1);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

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
    setErrors({});
  };

  const submitForm = async () => {
    setProcessing(true);
    setErrors({});

    try {
      if (modalMode === 'edit' && editId) {
        await api.put(`/v1/admin/pengguna/${editId}`, formData);
      } else {
        await api.post('/v1/admin/pengguna', formData);
      }
      setModalMode(null);
      await fetchUsers(query, currentPage);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.errors) {
        const valErrors: Record<string, string> = {};
        Object.entries(err.response.data.errors).forEach(([field, msg]) => {
          valErrors[field] = Array.isArray(msg) ? msg[0] : String(msg);
        });
        setErrors(valErrors);
      } else {
        setErrors({ general: 'Terjadi kesalahan saat menyimpan data.' });
      }
    } finally {
      setProcessing(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/v1/admin/pengguna/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchUsers(query, currentPage);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const renderPagination = () => {
    if (!paginationLinks || paginationLinks.length <= 3) return null;
    return (
      <div className="flex items-center justify-end gap-2">
        {paginationLinks.map((link, i) => (
          <button
            key={i}
            type="button"
            disabled={!link.url}
            onClick={() => {
              if (link.url) {
                const urlParams = new URL(link.url, window.location.origin).searchParams;
                const pageParam = parseInt(urlParams.get('page') || '1', 10);
                setCurrentPage(pageParam);
                fetchUsers(query, pageParam);
              }
            }}
            dangerouslySetInnerHTML={{ __html: link.label }}
            className={`min-w-[44px] min-h-[44px] px-3 rounded-xl border text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40 ${
              link.active
                ? 'bg-[#0E7C5A] border-[#0E7C5A] text-white'
                : 'bg-white border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#EEF5F2]'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <PenggunaTemplate
      rows={users}
      pagination={renderPagination()}
      roles={roles}
      units={units}
      query={query}
      onQueryChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
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
      onAskDelete={setDeleteTarget}
      onCancelDelete={() => setDeleteTarget(null)}
      onConfirmDelete={confirmDelete}
      isLoading={isLoading}
    />
  );
};

export default PenggunaIndex;
