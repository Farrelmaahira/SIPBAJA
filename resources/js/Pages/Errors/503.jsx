import ErrorTemplate from '../../components/templates/ErrorTemplate';

export default function Error503({ status = 503 }) {
    return (
        <ErrorTemplate
            status={status}
            title="Perawatan Sistem"
            message="SIPBAJA sedang perawatan. Coba lagi nanti."
        />
    );
}
