import type { TimeRange } from "./types/spotify";

export const COPY = {
  cover: {
    headline: "What does your taste say about you?",
    deck: "We read the lyrics behind your top tracks and translate them into emotions. It's pop psychology with worse footnotes.",
    cta: "Connect Spotify",
    footer: "01 / 02 — A SLIGHTLY UNHINGED MUSIC ANALYSIS",
    privacyLink: "PRIVACY",
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
    privacyLink: "PRIVACY",
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
    sharing: "SHARING...",
  },
  privacy: {
    title: "Privacy",
    effective: "EFFECTIVE 2026-04-25",
    back: "← BACK TO EMOJIFY",
    sections: [
      {
        heading: "What we collect",
        paragraphs: [
          "When you connect Spotify, the browser receives a temporary access token and the titles of up to 50 of your top tracks for the time window you choose. The OAuth scope is user-top-read — nothing beyond top tracks is accessible. The token lives in your browser's sessionStorage and is never sent to the backend.",
        ],
      },
      {
        heading: "What we do with it",
        paragraphs: [
          "The browser sends the backend a list of artist and song-title pairs. The backend looks up lyrics on Genius, sends the lyric text to HuggingFace's Inference API for emotion classification, and sends the resulting emotion vector (no titles, no artist names) to Anthropic to generate the persona blurb. Nothing is written to disk on the server.",
        ],
      },
      {
        heading: "Third parties",
        paragraphs: [
          "Data is shared only with the services above. Each has its own privacy policy:",
        ],
        links: [
          { label: "Spotify", href: "https://www.spotify.com/legal/privacy-policy/" },
          { label: "Genius", href: "https://genius.com/static/privacy_policy" },
          { label: "HuggingFace", href: "https://huggingface.co/privacy" },
          { label: "Anthropic", href: "https://www.anthropic.com/legal/privacy" },
        ],
      },
      {
        heading: "Your control",
        paragraphs: [
          "Log out to clear the token, or revoke access at https://www.spotify.com/account/apps. There is no stored data to delete.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "challsyarbro@gmail.com",
        ],
      },
    ],
  },
} as const;

// Backend cap on tracks analyzed per request — must stay in sync with MAX_SONGS in api/app.py
export const ANALYSIS_CAP = 25;
