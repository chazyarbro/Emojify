import { COPY } from "../copy";

interface HeaderProps {
  onLogout: () => void;
  onShare?: () => void;
  shareLoading?: boolean;
}

export function Header({ onLogout, onShare, shareLoading }: HeaderProps) {
  return (
    <header className="results-header">
      <div className="results-header-left">
        <span className="wordmark">EMOJIFY</span>
        <span className="results-header-mono">{COPY.results.diagnosisLabel}</span>
      </div>
      <div className="results-header-actions">
        {onShare && (
          <button
            type="button"
            className="text-link"
            onClick={onShare}
            disabled={shareLoading}
          >
            {shareLoading ? COPY.share.sharing : `${COPY.share.button} →`}
          </button>
        )}
        <button type="button" className="text-link" onClick={onLogout}>
          {COPY.results.logout}
        </button>
      </div>
    </header>
  );
}
