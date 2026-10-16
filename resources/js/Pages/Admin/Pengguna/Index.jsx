import { useEffect, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import PenggunaTemplate from '../../../components/templates/PenggunaTemplate';

const EMPTY_FORM = { nama: '', email: '', password: '', role_id: '', unit_id: '' };

function Pager({ links = [] }) {
    if (!links || links.length <= 3) return null;
    return (
        <div className="flex items-center justify-end gap-2">
            {links.map((link, i) => (
                <button
                    key={i}
                    type="button"
                    disabled={!link.url}
                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
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
}

export default function Index() {
    const { users, roles, units, filters } = usePage().props;

    const [query, setQuery] = useState(filters?.q ?? '');
    const [modalMode, setModalMode] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const form = useForm({ ...EMPTY_FORM });
    const { data, setData, errors, processing, clearErrors } = form;

    useEffect(() => {
        const t = setTimeout(() => {
            if (query !== (filters?.q ?? '')) {
                router.get(
                    '/admin/pengguna',
                    { q: query },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        return () => clearTimeout(t);
    }, [query]);

    const openCreate = () => {
        setData({ ...EMPTY_FORM });
        clearErrors();
        setModalMode('create');
    };

    const openEdit = (row) => {
        setData({
            nama: row.nama ?? '',
            email: row.email ?? '',
            password: '',
            role_id: row.role_id ?? row.role?.id ?? '',
            unit_id: row.unit_id ?? row.unit?.id ?? '',
        });
        clearErrors();
        form.setData('editId', row.id);
        setModalMode('edit');
    };

    const closeModal = () => setModalMode(null);

    const submitForm = () => {
        if (modalMode === 'edit') {
            router.put(`/admin/pengguna/${data.editId}`, data, {
                preserveScroll: true,
                onSuccess: () => setModalMode(null),
            });
            return;
        }
        router.post('/admin/pengguna', data, {
            preserveScroll: true,
            onSuccess: () => setModalMode(null),
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/admin/pengguna/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <>
            <Head title="Pengguna - SIPBAJA" />
            <PenggunaTemplate
                rows={users?.data ?? []}
                pagination={<Pager links={users?.links} />}
                roles={roles ?? []}
                units={units ?? []}
                query={query}
                onQueryChange={(e) => setQuery(e.target.value)}
                modalMode={modalMode}
                form={{ data, setData, errors, processing }}
                onOpenCreate={openCreate}
                onOpenEdit={openEdit}
                onCloseModal={closeModal}
                onSubmitForm={submitForm}
                deleteTarget={deleteTarget}
                onAskDelete={setDeleteTarget}
                onCancelDelete={() => setDeleteTarget(null)}
                onConfirmDelete={confirmDelete}
            />
        </>
    );
}
