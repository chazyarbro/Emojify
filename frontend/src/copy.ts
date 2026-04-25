import type { TimeRange } from "./types/spotify";

export const COPY = {
  cover: {
    headline: "What does your taste say about you?",
    deck: "We read the lyrics behind your top tracks and translate them into emotions. It's pop psychology with worse footnotes.",
    cta: "Connect Spotify",
    footer: "01 / 02 — A SLIGHTLY UNHINGED MUSIC ANALYSIS",
  },
  loading: {
    headline: "Reading between the lines",
    statuses: ["FETCHING TRACKS", "READING LYRICS", "ANALYZING EMOTIONS"],
  },
  results: {
    diagnosisLabel: "THE DIAGNOSIS",
    logout: "LOG OUT",
    timeRangeLabels: {
      short_term: "LAST MONTH",
      medium_term: "LAST 6 MONTHS",
      long_term: "ALL TIME",
    } as Record<TimeRange, string>,
    cta: "Read my taste",
    ctaAgain: "Read again",
    heroSummary: (emotion: string, n: number) =>
      `Across ${n} of your top tracks, ${emotion.toLowerCase()} hit the loudest.`,
    heroMeta: (score: number, n: number) =>
      `SCORE ${score.toFixed(2)}  ·  ${n} TRACKS`,
    marginalia: [
      "EMOTIONS VIA ROBERTA-BASE-GO_EMOTIONS  ·  HUGGINGFACE INFERENCE",
      "LYRICS COURTESY OF GENIUS  ·  SPOTIFY DATA VIA YOU",
    ],
  },
  errors: {
    noTracks: "Spotify says you've been quiet. Try a longer window.",
    noLyrics: "Couldn't find lyrics for any of these. Genius is opinionated about what counts as a song.",
    sessionExpired: "Spotify forgot you. Reconnect →",
    generic: "Something went sideways.",
    retry: "RETRY",
  },
  share: {
    button: "SHARE",
    copied: "COPIED ✓",
    saveImage: "Save image",
    screenLabel: "SHARED DIAGNOSIS",
    cta: "Run your own diagnosis",
    badPayload: "This link looks broken. Try generating a new one.",
  },
} as const;

// Backend cap on tracks analyzed per request — must stay in sync with MAX_SONGS in api/app.py
export const ANALYSIS_CAP = 25;
