/**
 * Types for the Flask API (lyrics, quote) and transformed data.
 */

/** Body for POST /lyrics and POST /quote: artist name -> list of song titles */
export type ArtistSongs = Record<string, string[]>;

/** Response from POST /lyrics: list of [emotion, score] */
export type EmotionResult = [string, number];
