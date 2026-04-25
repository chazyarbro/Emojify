import { useRef, useState, useCallback } from "react";
import {
  LoginScreen,
  LoadingScreen,
  Header,
  TimeRangePicker,
  EmotionResults,
  ErrorMessage,
} from "./components";
import { useSpotifyAuth, useEmojiGenerator, useShare } from "./hooks";
import { TIME_RANGES } from "./constants/timeRanges";
import { COPY } from "./copy";
import type { TimeRange } from "./types/spotify";
import "./App.css";

function App() {
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const captureRef = useRef<HTMLDivElement>(null);

  const { token, error: authError, handleLogin, handleLogout } = useSpotifyAuth();
  const {
    loading,
    results,
    trackCount,
    error: generatorError,
    quotes,
    setResults,
    setError: setGeneratorError,
    handleGenerate,
  } = useEmojiGenerator();

  const { copyLink, copied, downloadImage } = useShare(results, trackCount, timeRange);

  const error = authError ?? generatorError;

  const onLogout = useCallback(() => {
    handleLogout();
    setResults(null);
    setGeneratorError(null);
  }, [handleLogout, setResults, setGeneratorError]);

  if (!token) {
    return <LoginScreen error={authError} onLogin={handleLogin} />;
  }

  if (loading) {
    return <LoadingScreen quotes={quotes} />;
  }

  return (
    <div className="app-shell">
      <Header
        onLogout={onLogout}
        onShare={results && results.length > 0 ? copyLink : undefined}
        shareCopied={copied}
      />
      <main>
        <TimeRangePicker
          value={timeRange}
          options={TIME_RANGES}
          onChange={setTimeRange}
        />
        <button
          type="button"
          className="cover-cta cta-inline"
          onClick={() => handleGenerate(timeRange)}
        >
          {results ? COPY.results.ctaAgain : COPY.results.cta}
          <span className="cta-arrow">→</span>
        </button>
        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => handleGenerate(timeRange)}
          />
        )}
        {results && results.length > 0 && (
          <>
            <div ref={captureRef}>
              <EmotionResults results={results} trackCount={trackCount} />
            </div>
            <button
              type="button"
              className="cover-cta cta-inline"
              onClick={() => captureRef.current && downloadImage(captureRef.current)}
            >
              {COPY.share.saveImage}
              <span className="cta-arrow">→</span>
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
