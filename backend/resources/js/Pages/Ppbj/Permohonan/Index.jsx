import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import PermohonanIndexTemplate from '../../../components/templates/PermohonanIndexTemplate';

export default function PermohonanIndex({ permohonanList = [] }) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Daftar Permohonan Pengadaan - SIPBAJA" />
            <PermohonanIndexTemplate
                user={auth?.user}
                items={permohonanList}
            />
        </>
    );
}
