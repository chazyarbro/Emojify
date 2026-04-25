import { COPY } from "../copy";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <p className="error">
      <span className="error-x" aria-hidden>✕</span>
      <span className="error-msg">{message}</span>
      {onRetry && (
        <button type="button" className="error-retry" onClick={onRetry}>
          {COPY.errors.retry} →
        </button>
      )}
    </p>
  );
}
