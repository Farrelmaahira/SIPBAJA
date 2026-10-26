import { Head, useForm, router } from '@inertiajs/react';
import PermohonanCreateTemplate from '../../../components/templates/PermohonanCreateTemplate';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        judul: '',
        estimasi_anggaran: '',
        file_dokumen: null,
        nomor_surat: '',
        ringkasan_tujuan: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/pemohon/permohonan', {
            forceFormData: true,
        });
    };

    const handleKembali = () => {
        router.visit('/pemohon/dashboard');
    };

    return (
        <>
            <Head title="Buat Permohonan Pengadaan - SIPBAJA" />
            <PermohonanCreateTemplate
                user={auth?.user}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleSubmit}
                onKembali={handleKembali}
            />
        </>
    );
}
