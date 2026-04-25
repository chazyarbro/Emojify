import { useRef, useState, useCallback } from "react";
import {
  LoginScreen,
  LoadingScreen,
  Header,
  TimeRangePicker,
  EmotionResults,
  ErrorMessage,
  ShareCard,
  Marginalia,
} from "./components";
import { useSpotifyAuth, useEmojiGenerator, useShare } from "./hooks";
import { TIME_RANGES } from "./constants/timeRanges";
import { COPY } from "./copy";
import type { TimeRange } from "./types/spotify";
import "./App.css";

function App() {
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const shareCardRef = useRef<HTMLDivElement>(null);

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

  const { share, sharing } = useShare(shareCardRef);

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

  const hasResults = !!results && results.length > 0;

  return (
    <div className="app-shell">
      <Header onLogout={onLogout} />
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
        {hasResults && (
          <>
            <EmotionResults results={results} trackCount={trackCount} />
            <button
              type="button"
              className="cover-cta cta-inline share-cta"
              onClick={share}
              disabled={sharing}
            >
              {sharing ? COPY.share.sharing : `${COPY.share.button} →`}
            </button>
            <Marginalia />
          </>
        )}
      </main>
      {hasResults && (
        <ShareCard
          ref={shareCardRef}
          results={results}
          trackCount={trackCount}
        />
      )}
    </div>
  );
}

export default App;
