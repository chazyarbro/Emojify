import { useState, useCallback } from "react";
import { getTopTracks } from "../spotify";
import {
  spotifyTracksToArtistSongs,
  analyzeLyrics,
  fetchQuotes,
} from "../api";
import { COPY, ANALYSIS_CAP } from "../copy";
import type { EmotionResult } from "../types/api";
import type { TimeRange } from "../types/spotify";

export interface UseEmojiGeneratorResult {
  loading: boolean;
  results: EmotionResult[] | null;
  trackCount: number;
  error: string | null;
  quotes: string[];
  setResults: (results: EmotionResult[] | null) => void;
  setError: (error: string | null) => void;
  handleGenerate: (timeRange: TimeRange) => Promise<void>;
}

export function useEmojiGenerator(): UseEmojiGeneratorResult {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EmotionResult[] | null>(null);
  const [trackCount, setTrackCount] = useState(0);
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
      const sentTracks = Object.values(artistSongs).flat().length;
      const analyzedCount = Math.min(sentTracks, ANALYSIS_CAP);

      if (artistCount === 0) {
        setError(COPY.errors.noTracks);
        setLoading(false);
        return;
      }

      fetchQuotes(artistSongs).then((q) =>
        setQuotes(Array.isArray(q) ? q : [])
      );

      const emotions = await analyzeLyrics(artistSongs);

      if (!Array.isArray(emotions) || emotions.length === 0) {
        setError(COPY.errors.noLyrics);
      } else {
        const hasScores = emotions.some(
          (e) => Array.isArray(e) && e.length >= 2 && (e[1] as number) > 0
        );
        if (!hasScores) {
          setError(COPY.errors.noLyrics);
        } else {
          setTrackCount(analyzedCount);
          setResults(
            emotions.filter(
              (e): e is EmotionResult =>
                Array.isArray(e) && e.length >= 2 && (e[1] as number) > 0
            )
          );
        }
      }
    } catch (e) {
      setError((e as Error).message || COPY.errors.generic);
    } finally {
      setLoading(false);
      setQuotes([]);
    }
  }, []);

  return {
    loading,
    results,
    trackCount,
    error,
    quotes,
    setResults,
    setError,
    handleGenerate,
  };
}
