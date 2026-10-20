import { Head, usePage } from '@inertiajs/react';
import RoleDashboardTemplate from '../../components/templates/RoleDashboardTemplate';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Dashboard Perencanaan - SIPBAJA" />
            <RoleDashboardTemplate
                roleTitle="Dashboard Perencanaan"
                roleDescription="Verifikasi anggaran dan penentuan MAK (Mata Anggaran Kegiatan) permohonan pengadaan."
                user={auth?.user}
            />
        </>
    );
}
