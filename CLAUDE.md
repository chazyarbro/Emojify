# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A two-service web app: React/Vite frontend talks directly to Spotify (PKCE OAuth, top tracks) and to a small Flask backend. The backend fetches lyrics from Genius, runs them through HuggingFace's Inference API for emotion classification, aggregates 28 GoEmotions labels into 10 canonical emotions, and returns them sorted.

```
Browser ──Spotify PKCE──> Spotify
   │
   └─POST /lyrics, /quote──> Flask (api/) ──┬─> Genius (lyrics)
                                            └─> HF Inference API (emotions)
```

## Commands

| Task | Command |
|---|---|
| Frontend dev | `cd frontend && npm run dev` (serves on `http://127.0.0.1:5173/`) |
| Frontend build | `cd frontend && npm run build` |
| Frontend lint | `cd frontend && npm run lint` |
| TypeScript check | `cd frontend && npx tsc --noEmit` |
| Backend dev | `cd api && py app.py` (Windows) or `python app.py` |
| Install backend deps | `cd api && py -m pip install -r requirements.txt` |

`py` (Python launcher) is the right entry point on this Windows machine — `python` and `python3` resolve to the Microsoft Store stub.

## Required env vars

`api/.env` (loaded by `python-dotenv`):
- `GENIUS_TOKEN` — Genius API token
- `HF_API_TOKEN` — HuggingFace API token (Read scope)
- `CORS_ORIGINS` (optional, prod only) — comma-separated origins, **no trailing slash**

`frontend/.env`:
- `VITE_SPOTIFY_CLIENT_ID` — Spotify app client ID
- `VITE_API_URL` (optional, prod only) — backend URL; defaults to `http://localhost:5000`

`.env.example` files in both directories list what's needed.

## Spotify Dashboard config

The Vite dev server binds to `127.0.0.1`, not `localhost` — these are different origins to Spotify. The redirect URI registered in the Spotify Dashboard must be `http://127.0.0.1:5173/` exactly (with trailing slash). For production also add the Vercel URL (with trailing slash).

## Architecture notes

**Frontend (`frontend/src/`)** — auth and emoji-generation logic live in two hooks: `useSpotifyAuth` (PKCE flow, sessionStorage token, code-for-token exchange) and `useEmojiGenerator` (orchestrates `getTopTracks` → `analyzeLyrics` + `fetchQuotes`). `App.tsx` is purely presentational on top of these hooks. `spotify.ts` and `api.ts` are stateless modules — the hooks own all state.

**Backend (`api/app.py`)** — single-file Flask app. The Genius client and the CORS config are initialized at module load (heavy startup). `fetch_lyrics()` uses `genius.search_songs()` (official API) + `genius.lyrics(song_url=...)` (web scrape). The `/lyrics` route fans out lyric fetches across a `ThreadPoolExecutor` (`MAX_SONGS=25`, `FETCH_WORKERS=5`), then sends all texts in one batch call to the HF Inference API.

## Non-obvious things that will trip you up

**Genius blocks `search_song()`** — `lyricsgenius`'s `search_song()` hits `genius.com/api/search/multi` (an unofficial endpoint) which now returns 403. Use `search_songs()` (official `api.genius.com`) + `genius.lyrics(song_url=...)` to scrape, as the existing `fetch_lyrics()` helper does.

**Genius blocks default User-Agent** — the lyrics scrape also returns 403 unless `genius._session.headers["User-Agent"]` is set to a browser UA string (already done at module load).

**HF Inference API URL is non-obvious** — the working endpoint is `https://router.huggingface.co/hf-inference/models/{model}`, NOT `https://api-inference.huggingface.co/models/{model}` (which 404s). The router wraps batch responses in an extra list: for N inputs you get `[[pred1, pred2, ..., predN]]`, so unpack `raw[0]`, not `raw`.

**`lyricsgenius` pinned to 3.0.1** — newer versions removed the `verbose` constructor kwarg and crash on startup.

**React StrictMode double-fires the PKCE exchange** — `useSpotifyAuth`'s effect runs twice in dev. The second run reuses the same `?code` and Spotify returns `invalid_grant`. The fix is to call `window.history.replaceState` to strip `?code` from the URL **before** the async `exchangeCodeForToken` call, not after.

**Per-song exceptions are caught** — both `/lyrics` and `/quote` wrap each song in try/except so one broken song (Unicode quirk, model edge case, etc.) doesn't 500 the whole request.

## Frontend design system

Editorial music magazine aesthetic — committed to and not negotiable without an explicit design conversation. Cream paper background, deep ink text, hot orange (`#FF3D00`) as the *only* accent. **No dark mode, no purple, no glass/blur effects, no rounded cards.** If you find yourself reaching for a hex value that isn't a token in `index.css`, stop and reconsider.

**Type stack** (loaded via Google Fonts `@import` in `index.css`): Fraunces for display + italic hero text, Geist for body, JetBrains Mono for labels/numbers/captions. Don't introduce a fourth font.

**Two top-level layouts** (mutually exclusive — `App.tsx` picks one):
- `.cover` — full-viewport editorial page used by `LoginScreen` and `LoadingScreen` via the shared `EditorialCover` component. Three rows: wordmark / hero / footer marginalia.
- `.app-shell` — the logged-in results page. Header / time-range row / CTA / hero emotion / numbered list / marginalia.

**All visible strings live in `frontend/src/copy.ts`.** Don't inline new strings into components — add to `COPY` and reference. This file also exports `ANALYSIS_CAP = 25`, which **must stay in sync with `MAX_SONGS` in `api/app.py`** — it's how the frontend renders honest "across N tracks" microcopy without lying when Spotify returned more tracks than the backend processed.

**Patterns worth knowing:**
- Radio toggles styled as text links use the modern `:has(input:checked)` pattern. The native `<input type="radio">` is visually hidden but kept in the DOM for a11y. See `.time-range-option` in `App.css`.
- The cover entrance animation uses four staggered classes (`cover-anim-1` through `cover-anim-4`) with 80ms offsets — apply top-to-bottom on cover children.
- Emotion list rows use a real CSS dotted leader (a flex-grow span with `border-bottom: 1px dotted`) — that's the magazine touch. Don't replace with a static character.
- `useEmojiGenerator` exposes `trackCount` (the analyzed count, capped at `ANALYSIS_CAP`) — pass it to `EmotionResults` for honest microcopy.

See `frontend/plan.md` for full design rationale (why these choices, what was rejected) and `ROADMAP.md` for what to build next.

## Production deployment

- **Frontend → Vercel** (root: `frontend/`, env: `VITE_SPOTIFY_CLIENT_ID`, `VITE_API_URL`)
- **Backend → Render** free tier (root: `api/`, start command: `gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120`, env: `GENIUS_TOKEN`, `HF_API_TOKEN`, `CORS_ORIGINS`)

A `Procfile` exists in `api/` for Render auto-detection. Render free tier spins down after 15 min idle (~30s cold start); the HF model also has its own warm-up. Both push from `master` auto-deploy.
