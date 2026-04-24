import { useState, useCallback } from "react";
import {
  LoginScreen,
  LoadingScreen,
  Header,
  TimeRangePicker,
  EmotionResults,
  ErrorMessage,
} from "./components";
import { useSpotifyAuth, useEmojiGenerator } from "./hooks";
import { TIME_RANGES } from "./constants/timeRanges";
import type { TimeRange } from "./types/spotify";
import "./App.css";

function App() {
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");

  const { token, error: authError, handleLogin, handleLogout } = useSpotifyAuth();
  const {
    loading,
    results,
    error: generatorError,
    quotes,
    setResults,
    setError: setGeneratorError,
    handleGenerate,
  } = useEmojiGenerator();

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
    <div className="app">
      <Header onLogout={onLogout} />
      <main className="center">
        {error && <ErrorMessage message={error} />}
        <TimeRangePicker
          value={timeRange}
          options={TIME_RANGES}
          onChange={setTimeRange}
        />
        <button
          type="button"
          className="btn primary big"
          onClick={() => handleGenerate(timeRange)}
        >
          Generate Emojis
        </button>
        {results && results.length > 0 && (
          <EmotionResults results={results} />
        )}
      </main>
    </div>
  );
}

export default App;
