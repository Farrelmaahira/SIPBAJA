import { Head, usePage } from '@inertiajs/react';
import RoleDashboardTemplate from '../../components/templates/RoleDashboardTemplate';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Dashboard PPK - SIPBAJA" />
            <RoleDashboardTemplate
                roleTitle="Dashboard PPK"
                roleDescription="Review dan penandatanganan dokumen pengadaan serta persetujuan pembayaran termin."
                user={auth?.user}
            />
        </>
    );
}
