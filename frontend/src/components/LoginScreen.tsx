import { COPY } from "../copy";
import { EditorialCover } from "./EditorialCover";

interface LoginScreenProps {
  error: string | null;
  onLogin: () => void;
}

export function LoginScreen({ error, onLogin }: LoginScreenProps) {
  return (
    <EditorialCover>
      <h1 className="cover-headline cover-anim-2">{COPY.cover.headline}</h1>
      <p className="cover-deck cover-anim-3">{COPY.cover.deck}</p>
      {error && <p className="error cover-anim-3" style={{ marginBottom: "1.5rem" }}><span className="error-msg">{error}</span></p>}
      <button type="button" className="cover-cta cover-anim-3" onClick={onLogin}>
        {COPY.cover.cta}
        <span className="cta-arrow">→</span>
      </button>
    </EditorialCover>
  );
}
