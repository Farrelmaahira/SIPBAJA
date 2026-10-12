import ErrorTemplate from '../../components/templates/ErrorTemplate';

export default function Error403({ status = 403 }) {
    return (
        <ErrorTemplate
            status={status}
            title="Akses Ditolak"
            message="Akun ini tidak punya izin membuka halaman tersebut."
        />
    );
}
