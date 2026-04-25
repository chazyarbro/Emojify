import { COPY } from "../copy";

export function Marginalia() {
  return (
    <div className="marginalia">
      {COPY.results.marginalia.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}
