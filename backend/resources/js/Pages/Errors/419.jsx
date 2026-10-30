import ErrorTemplate from '../../components/templates/ErrorTemplate';

export default function Error419({ status = 419 }) {
    return (
        <ErrorTemplate
            status={status}
            title="Sesi Kedaluwarsa"
            message="Sesi habis. Buka kembali halaman login lalu coba lagi."
            actionHref="/login"
            actionLabel="Kembali ke Login"
        />
    );
}
