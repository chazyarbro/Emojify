import { COPY } from "../copy";

interface HeaderProps {
  onLogout: () => void;
  onShare?: () => void;
  shareCopied?: boolean;
}

export function Header({ onLogout, onShare, shareCopied }: HeaderProps) {
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
            className={`text-link share-btn${shareCopied ? " share-btn--copied" : ""}`}
            onClick={onShare}
          >
            {shareCopied ? COPY.share.copied : `${COPY.share.button} →`}
          </button>
        )}
        <button type="button" className="text-link" onClick={onLogout}>
          {COPY.results.logout}
        </button>
      </div>
    </header>
  );
}
