import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import PermohonanShowTemplate from '../../../components/templates/PermohonanShowTemplate';

export default function PermohonanShow({ permohonan }) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title={`${permohonan?.nomorSurat || 'Detail'} — Detail Permohonan`} />
            <PermohonanShowTemplate
                user={auth?.user}
                permohonan={permohonan}
            />
        </>
    );
}