import { Head, usePage } from '@inertiajs/react';
import RoleDashboardTemplate from '../../components/templates/RoleDashboardTemplate';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Dashboard Pemohon - SIPBAJA" />
            <RoleDashboardTemplate
                roleTitle="Dashboard Pemohon"
                roleDescription="Pengajuan permohonan pengadaan barang dan jasa serta pemantauan status permohonan unit Anda."
                user={auth?.user}
            />
        </>
    );
}
