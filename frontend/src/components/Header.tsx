import { COPY } from "../copy";

interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  return (
    <header className="results-header">
      <div className="results-header-left">
        <span className="wordmark">EMOJIFY</span>
        <span className="results-header-mono">{COPY.results.diagnosisLabel}</span>
      </div>
      <button type="button" className="text-link" onClick={onLogout}>
        {COPY.results.logout}
      </button>
    </header>
  );
}
