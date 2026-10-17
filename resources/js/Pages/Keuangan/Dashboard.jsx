import { Head, usePage } from '@inertiajs/react';
import RoleDashboardTemplate from '../../components/templates/RoleDashboardTemplate';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Dashboard Keuangan - SIPBAJA" />
            <RoleDashboardTemplate
                roleTitle="Dashboard Keuangan"
                roleDescription="Pemrosesan pembayaran termin yang telah disetujui lengkap oleh PPK dan Bidang 2."
                user={auth?.user}
            />
        </>
    );
}
