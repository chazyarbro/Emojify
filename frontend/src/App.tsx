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
  const watermarkRef = useRef<HTMLDivElement>(null);

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

  const { share, sharing } = useShare(captureRef, watermarkRef);

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
        {results && results.length > 0 && (
          <>
            <div ref={captureRef} className="share-capture">
              <EmotionResults results={results} trackCount={trackCount} />
              <div ref={watermarkRef} className="share-watermark">
                <span className="share-watermark-wordmark">EMOJIFY</span>
                <span className="share-watermark-tagline">A MUSIC EMOTION ANALYSIS</span>
              </div>
            </div>
            <button
              type="button"
              className="cover-cta cta-inline share-cta"
              onClick={share}
              disabled={sharing}
            >
              {sharing ? COPY.share.sharing : `${COPY.share.button} →`}
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
