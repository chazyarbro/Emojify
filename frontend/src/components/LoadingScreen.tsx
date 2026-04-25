import { useEffect, useState } from "react";
import { COPY } from "../copy";
import { EditorialCover } from "./EditorialCover";

interface LoadingScreenProps {
  quotes: string[];
}

interface ParsedQuote {
  line: string;
  artist: string;
}

function parseQuote(raw: string): ParsedQuote {
  const lastDash = raw.lastIndexOf(" - ");
  if (lastDash === -1) return { line: raw, artist: "" };
  return {
    line: raw.slice(0, lastDash).trim(),
    artist: raw.slice(lastDash + 3).trim(),
  };
}

export function LoadingScreen({ quotes }: LoadingScreenProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);
  const [statusIndex, setStatusIndex] = useState(0);

  // Rotate the bottom-right status label every 3s — pure theatre, see plan.md
  useEffect(() => {
    const id = setInterval(() => {
      setStatusIndex((i) => (i + 1) % COPY.loading.statuses.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Rotate quotes with a 600ms cross-fade
  useEffect(() => {
    if (quotes.length === 0) return;
    const id = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % quotes.length);
        setQuoteVisible(true);
      }, 600);
    }, 4500);
    return () => clearInterval(id);
  }, [quotes.length]);

  const parsed = quotes.length > 0 ? parseQuote(quotes[quoteIndex] ?? "") : null;
  const status = `${COPY.loading.statuses[statusIndex]}…`;

  return (
    <EditorialCover bottomLabel={status}>
      <h1 className="cover-headline">
        {COPY.loading.headline}
        <span className="dots" aria-hidden>
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </span>
      </h1>
      {parsed && (
        <>
          <p className={`loading-quote ${quoteVisible ? "visible" : ""}`}>
            &ldquo;{parsed.line}&rdquo;
          </p>
          {parsed.artist && (
            <p className={`loading-quote-attribution ${quoteVisible ? "visible" : ""}`}>
              — {parsed.artist}
            </p>
          )}
        </>
      )}
    </EditorialCover>
  );
}
