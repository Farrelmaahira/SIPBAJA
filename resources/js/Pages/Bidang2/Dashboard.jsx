import { Head, usePage } from '@inertiajs/react';
import RoleDashboardTemplate from '../../components/templates/RoleDashboardTemplate';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Dashboard Bidang 2 - SIPBAJA" />
            <RoleDashboardTemplate
                roleTitle="Dashboard Bidang 2"
                roleDescription="Persetujuan awal bertingkat permohonan pengadaan dan persetujuan ganda pembayaran termin."
                user={auth?.user}
            />
        </>
    );
}
