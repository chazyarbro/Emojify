/**
 * Transform Spotify top tracks into Flask API body and call /lyrics, /quote.
 */

import type { SpotifyTopTracksResponse } from "./types/spotify";
import type { ArtistSongs, EmotionResult } from "./types/api";

export function spotifyTracksToArtistSongs(
  spotifyTracksResponse: SpotifyTopTracksResponse
): ArtistSongs {
  const items = spotifyTracksResponse?.items ?? [];
  const byArtist: ArtistSongs = {};
  for (const item of items) {
    const name = item?.artists?.[0]?.name;
    const title = item?.name;
    if (!name || !title) continue;
    if (!byArtist[name]) byArtist[name] = [];
    byArtist[name].push(title);
  }
  return byArtist;
}

const API_BASE = "http://localhost:5000";

export async function analyzeLyrics(
  artistSongs: ArtistSongs
): Promise<EmotionResult[]> {
  const res = await fetch(`${API_BASE}/lyrics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(artistSongs),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Lyrics analysis failed");
  }
  return res.json() as Promise<EmotionResult[]>;
}

export async function fetchQuotes(
  artistSongs: ArtistSongs
): Promise<string[]> {
  const res = await fetch(`${API_BASE}/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(artistSongs),
  });
  if (!res.ok) return [];
  return res.json() as Promise<string[]>;
}
