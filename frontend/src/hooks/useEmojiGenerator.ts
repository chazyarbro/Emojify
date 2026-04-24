import { useState, useCallback } from "react";
import { getTopTracks } from "../spotify";
import {
  spotifyTracksToArtistSongs,
  analyzeLyrics,
  fetchQuotes,
} from "../api";
import type { EmotionResult } from "../types/api";
import type { TimeRange } from "../types/spotify";

export interface UseEmojiGeneratorResult {
  loading: boolean;
  results: EmotionResult[] | null;
  error: string | null;
  quotes: string[];
  setResults: (results: EmotionResult[] | null) => void;
  setError: (error: string | null) => void;
  handleGenerate: (timeRange: TimeRange) => Promise<void>;
}

export function useEmojiGenerator(): UseEmojiGeneratorResult {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EmotionResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<string[]>([]);

  const handleGenerate = useCallback(async (timeRange: TimeRange) => {
    setError(null);
    setResults(null);
    setLoading(true);
    setQuotes([]);

    try {
      const tracksData = await getTopTracks(timeRange);
      const artistSongs = spotifyTracksToArtistSongs(tracksData);
      const artistCount = Object.keys(artistSongs).length;

      if (artistCount === 0) {
        setError("No top tracks found for this period.");
        setLoading(false);
        return;
      }

      fetchQuotes(artistSongs).then((q) =>
        setQuotes(Array.isArray(q) ? q : [])
      );

      const emotions = await analyzeLyrics(artistSongs);

      if (!Array.isArray(emotions) || emotions.length === 0) {
        setError(
          "No lyrics or emotions could be analyzed for your top tracks."
        );
      } else {
        const hasScores = emotions.some(
          (e) => Array.isArray(e) && e.length >= 2 && (e[1] as number) > 0
        );
        if (!hasScores) {
          setError("No lyrics found for your top tracks.");
        } else {
          setResults(
            emotions.filter(
              (e): e is EmotionResult =>
                Array.isArray(e) && e.length >= 2 && (e[1] as number) > 0
            )
          );
        }
      }
    } catch (e) {
      setError((e as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
      setQuotes([]);
    }
  }, []);

  return {
    loading,
    results,
    error,
    quotes,
    setResults,
    setError,
    handleGenerate,
  };
}
