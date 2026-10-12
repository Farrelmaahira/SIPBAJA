import ErrorTemplate from '../../components/templates/ErrorTemplate';

export default function Error404({ status = 404 }) {
    return (
        <ErrorTemplate
            status={status}
            title="Halaman Tidak Ditemukan"
            message="Alamat yang dibuka tidak tersedia atau sudah dipindahkan."
        />
    );
}
