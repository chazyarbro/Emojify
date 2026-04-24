/**
 * Spotify Web API types used by the app.
 */

export type TimeRange = "short_term" | "medium_term" | "long_term";

export interface SpotifyArtist {
  name: string;
  id?: string;
}

export interface SpotifyTrackItem {
  name: string;
  artists: SpotifyArtist[];
  id?: string;
}

export interface SpotifyTopTracksResponse {
  items: SpotifyTrackItem[];
}
