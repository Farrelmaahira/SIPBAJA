import ErrorTemplate from '../../components/templates/ErrorTemplate';

export default function Error429({ status = 429 }) {
    return (
        <ErrorTemplate
            status={status}
            title="Terlalu Banyak Permintaan"
            message="Kurangi kecepatan lalu coba lagi sesaat."
        />
    );
}
