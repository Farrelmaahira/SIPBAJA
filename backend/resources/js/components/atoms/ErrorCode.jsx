export default function ErrorCode({ code }) {
    return (
        <p aria-hidden="true" className="text-6xl font-bold tracking-tight text-slate-900">
            {code}
        </p>
    );
}
