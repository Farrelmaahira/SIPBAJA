import { useEffect, useState, type FC, type ChangeEvent } from 'react';
import axios from 'axios';
import api from '../../../services/api';
import RoleTemplate, {
  type RoleRowItem,
  type RoleFormData,
} from '../../../components/templates/RoleTemplate';

const EMPTY_FORM: RoleFormData = {
  nama: '',
};

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export const RoleIndex: FC = () => {
  const [roles, setRoles] = useState<RoleRowItem[]>([]);
  const [paginationLinks, setPaginationLinks] = useState<PaginationLink[]>([]);
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

  const fetchRoles = async (searchQuery = query, page = currentPage) => {
    setIsLoading(true);
    try {
      const res = await api.get<{
        roles?: {
          data?: RoleRowItem[];
          links?: PaginationLink[];
        };
        data?: RoleRowItem[];
      }>('/v1/admin/role', {
        params: { q: searchQuery, page },
      });

      const data = res.data;
      if (data.roles?.data) {
        setRoles(data.roles.data);
        setPaginationLinks(data.roles.links || []);
      } else if (Array.isArray(data.data)) {
        setRoles(data.data);
      } else if (Array.isArray(data)) {
        setRoles(data as RoleRowItem[]);
      }
    } catch (err) {
      console.error('Failed to fetch role list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRoles(query, 1);
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
        await api.put(`/v1/admin/role/${editId}`, formData);
      } else {
        await api.post('/v1/admin/role', formData);
      }
      setModalMode(null);
      await fetchRoles(query, currentPage);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.errors) {
        const valErrors: Record<string, string> = {};
        Object.entries(err.response.data.errors).forEach(([field, msg]) => {
          valErrors[field] = Array.isArray(msg) ? msg[0] : String(msg);
        });
        setErrors(valErrors);
      } else {
        setErrors({ general: 'Terjadi kesalahan saat menyimpan peran.' });
      }
    } finally {
      setProcessing(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/v1/admin/role/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchRoles(query, currentPage);
    } catch (err) {
      console.error('Failed to delete role:', err);
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
                fetchRoles(query, pageParam);
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
    <RoleTemplate
      rows={roles}
      pagination={renderPagination()}
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

export default RoleIndex;
