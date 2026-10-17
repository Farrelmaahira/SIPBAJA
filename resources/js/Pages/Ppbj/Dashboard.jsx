import { Head, usePage } from '@inertiajs/react';
import RoleDashboardTemplate from '../../components/templates/RoleDashboardTemplate';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Dashboard PPBJ - SIPBAJA" />
            <RoleDashboardTemplate
                roleTitle="Dashboard PPBJ"
                roleDescription="Penyusunan paket pengadaan, penentuan metode pengadaan, dan penerbitan kontrak per termin."
                user={auth?.user}
            />
        </>
    );
}
