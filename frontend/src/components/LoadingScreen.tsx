import { useState, useEffect } from "react";

interface LoadingScreenProps {
  quotes: string[];
}

export function LoadingScreen({ quotes }: LoadingScreenProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  useEffect(() => {
    if (quotes.length === 0) return;
    const interval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % quotes.length);
        setQuoteVisible(true);
      }, 400);
    }, 2000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div className="app">
      <main className="center loading-screen">
        <div className="spinner" aria-hidden />
        <p className="loading-label">Analyzing your top tracks…</p>
        {quotes.length > 0 && (
          <p className={`quote ${quoteVisible ? "visible" : ""}`}>
            &quot;{quotes[quoteIndex]}&quot;
          </p>
        )}
      </main>
    </div>
  );
}
