import { Head, usePage } from '@inertiajs/react';
import RoleDashboardTemplate from '../../components/templates/RoleDashboardTemplate';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Dashboard PP - SIPBAJA" />
            <RoleDashboardTemplate
                roleTitle="Dashboard PP"
                roleDescription="Review dokumen pengadaan barang dan jasa bernilai 50 sampai 200 juta rupiah."
                user={auth?.user}
            />
        </>
    );
}
