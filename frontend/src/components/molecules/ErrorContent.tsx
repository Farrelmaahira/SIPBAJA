import type { FC, ReactNode } from 'react';
import ErrorAction from '../atoms/ErrorAction';
import ErrorMessage from '../atoms/ErrorMessage';
import ErrorTitle from '../atoms/ErrorTitle';

export interface ErrorContentProps {
  title: ReactNode;
  message: ReactNode;
  actionHref?: string;
  actionLabel: ReactNode;
  titleId?: string;
  titlePrefix?: string;
}

export const ErrorContent: FC<ErrorContentProps> = ({
  title,
  message,
  actionHref,
  actionLabel,
  titleId,
  titlePrefix,
}) => {
  return (
    <div>
      <ErrorTitle id={titleId} prefix={titlePrefix}>
        {title}
      </ErrorTitle>
      <ErrorMessage>{message}</ErrorMessage>
      <ErrorAction to={actionHref} href={actionHref}>
        {actionLabel}
      </ErrorAction>
    </div>
  );
};

export default ErrorContent;
