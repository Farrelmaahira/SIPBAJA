export default function ErrorTitle({ id, prefix, children }) {
    return (
        <h1
            id={id}
            tabIndex={-1}
            className="mt-4 text-lg font-semibold text-slate-900 focus:outline-none"
        >
            {prefix ? <span className="sr-only">{prefix}: </span> : null}
            {children}
        </h1>
    );
}
