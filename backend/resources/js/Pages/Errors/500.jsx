import ErrorTemplate from '../../components/templates/ErrorTemplate';

export default function Error500({ status = 500 }) {
    return (
        <ErrorTemplate
            status={status}
            title="Gangguan Server"
            message="Terjadi kesalahan di server. Coba lagi. Bila berlanjut, hubungi admin."
        />
    );
}
