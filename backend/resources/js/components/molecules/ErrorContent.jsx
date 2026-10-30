import ErrorAction from '../atoms/ErrorAction';
import ErrorMessage from '../atoms/ErrorMessage';
import ErrorTitle from '../atoms/ErrorTitle';

export default function ErrorContent({
    title,
    message,
    actionHref,
    actionLabel,
    titleId,
    titlePrefix,
}) {
    return (
        <div>
            <ErrorTitle id={titleId} prefix={titlePrefix}>
                {title}
            </ErrorTitle>
            <ErrorMessage>{message}</ErrorMessage>
            <ErrorAction href={actionHref}>{actionLabel}</ErrorAction>
        </div>
    );
}
