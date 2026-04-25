import { useRef } from "react";
import { toPng } from "html-to-image";
import { decodeSharePayload } from "../hooks/useShare";
import { EmotionResults } from "./EmotionResults";
import { COPY } from "../copy";

interface ShareViewProps {
  encoded: string;
}

export function ShareView({ encoded }: ShareViewProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const payload = decodeSharePayload(encoded);

  async function handleDownload() {
    if (!captureRef.current) return;
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "my-emojify-diagnosis.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Image download failed:", err);
    }
  }

  if (!payload) {
    return (
      <div className="share-shell">
        <header className="share-header">
          <span className="wordmark">EMOJIFY</span>
        </header>
        <main className="share-main">
          <p className="error">
            <span className="error-x" aria-hidden>✕</span>
            <span className="error-msg">{COPY.share.badPayload}</span>
          </p>
          <a href="/" className="cover-cta" style={{ marginTop: "1.5rem" }}>
            {COPY.share.cta}
            <span className="cta-arrow">→</span>
          </a>
        </main>
      </div>
    );
  }

  const timeRangeLabel = COPY.results.timeRangeLabels[payload.r];

  return (
    <div className="share-shell">
      <header className="share-header">
        <span className="wordmark">EMOJIFY</span>
        <span className="results-header-mono">
          {COPY.share.screenLabel} · {timeRangeLabel}
        </span>
      </header>
      <main className="share-main">
        <div ref={captureRef}>
          <EmotionResults results={payload.e} trackCount={payload.n} />
        </div>
        <div className="share-actions">
          <button
            type="button"
            className="cover-cta cta-inline"
            onClick={handleDownload}
          >
            {COPY.share.saveImage}
            <span className="cta-arrow">→</span>
          </button>
          <a href="/" className="cover-cta cta-inline">
            {COPY.share.cta}
            <span className="cta-arrow">→</span>
          </a>
        </div>
      </main>
    </div>
  );
}
