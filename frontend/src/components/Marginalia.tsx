import { COPY } from "../copy";

export function Marginalia() {
  return (
    <div className="marginalia">
      {COPY.results.marginalia.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <p>
        <a href="/privacy" className="marginalia-link">{COPY.results.privacyLink}</a>
      </p>
    </div>
  );
}
