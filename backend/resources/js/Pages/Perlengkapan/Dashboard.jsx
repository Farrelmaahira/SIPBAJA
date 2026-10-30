import { Head, usePage } from '@inertiajs/react';
import RoleDashboardTemplate from '../../components/templates/RoleDashboardTemplate';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Dashboard Perlengkapan - SIPBAJA" />
            <RoleDashboardTemplate
                roleTitle="Dashboard Perlengkapan"
                roleDescription="Pencatatan penerimaan barang, dokumentasi fisik, dan berita acara penerimaan."
                user={auth?.user}
            />
        </>
    );
}
