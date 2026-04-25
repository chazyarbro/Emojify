# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A two-service web app: React/Vite frontend talks directly to Spotify (PKCE OAuth, top tracks) and to a small Flask backend. The backend fetches lyrics from Genius, runs them through HuggingFace's Inference API for emotion classification, aggregates 28 GoEmotions labels into 10 canonical emotions, and returns them sorted.

```
Browser ──Spotify PKCE──> Spotify
   │
   └─POST /lyrics, /quote, ──> Flask (api/) ──┬─> Genius (lyrics)
        /persona                              ├─> HF Inference API (emotions)
                                              └─> Anthropic Haiku 4.5 (persona)
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
- `ANTHROPIC_API_KEY` — Anthropic API key (used by `/persona` for Claude Haiku 4.5). Optional — if unset the route returns a deterministic fallback persona instead of 500ing.
- `CORS_ORIGINS` (optional, prod only) — comma-separated origins, **no trailing slash**

`frontend/.env`:
- `VITE_SPOTIFY_CLIENT_ID` — Spotify app client ID
- `VITE_API_URL` (optional, prod only) — backend URL; defaults to `http://localhost:5000`

`.env.example` files in both directories list what's needed.

## Spotify Dashboard config

The Vite dev server binds to `127.0.0.1`, not `localhost` — these are different origins to Spotify. The redirect URI registered in the Spotify Dashboard must be `http://127.0.0.1:5173/` exactly (with trailing slash). For production also add the Vercel URL (with trailing slash).

## Architecture notes

**Frontend (`frontend/src/`)** — auth and emoji-generation logic live in two hooks: `useSpotifyAuth` (PKCE flow, sessionStorage token, code-for-token exchange) and `useEmojiGenerator` (orchestrates `getTopTracks` → `analyzeLyrics` → `fetchPersona`, plus `fetchQuotes` fired in parallel). A third hook, `useShare`, runs `html2canvas` over the `ShareCard` ref and hands the resulting PNG to `navigator.share` (with a download-link fallback). `App.tsx` is purely presentational on top of these hooks. `spotify.ts` and `api.ts` are stateless modules — the hooks own all state.

**Backend (`api/app.py`)** — single-file Flask app. The Genius client and the CORS config are initialized at module load (heavy startup). `fetch_lyrics()` uses `genius.search_songs()` (official API) + `genius.lyrics(song_url=...)` (web scrape). The `/lyrics` route fans out lyric fetches across a `ThreadPoolExecutor` (`MAX_SONGS=25`, `FETCH_WORKERS=5`), then sends all texts in one batch call to the HF Inference API. The `/persona` route takes that ranked emotion vector and asks Claude Haiku 4.5 (`anthropic` SDK, structured outputs via `output_config.format` with a `json_schema`) to return `{name, emoji, tagline}` — a magazine-archetype diagnosis. The Anthropic client is lazy-initialized: if `ANTHROPIC_API_KEY` is unset or the call fails, the route returns a deterministic fallback persona so the analysis still renders.

## Non-obvious things that will trip you up

**Genius blocks `search_song()`** — `lyricsgenius`'s `search_song()` hits `genius.com/api/search/multi` (an unofficial endpoint) which now returns 403. Use `search_songs()` (official `api.genius.com`) + `genius.lyrics(song_url=...)` to scrape, as the existing `fetch_lyrics()` helper does.

**Genius blocks default User-Agent** — the lyrics scrape also returns 403 unless `genius._session.headers["User-Agent"]` is set to a browser UA string (already done at module load).

**HF Inference API URL is non-obvious** — the working endpoint is `https://router.huggingface.co/hf-inference/models/{model}`, NOT `https://api-inference.huggingface.co/models/{model}` (which 404s). The router wraps batch responses in an extra list: for N inputs you get `[[pred1, pred2, ..., predN]]`, so unpack `raw[0]`, not `raw`.

**`lyricsgenius` pinned to 3.0.1** — newer versions removed the `verbose` constructor kwarg and crash on startup.

**React StrictMode double-fires the PKCE exchange** — `useSpotifyAuth`'s effect runs twice in dev. The second run reuses the same `?code` and Spotify returns `invalid_grant`. The fix is to call `window.history.replaceState` to strip `?code` from the URL **before** the async `exchangeCodeForToken` call, not after.

**Per-song exceptions are caught** — both `/lyrics` and `/quote` wrap each song in try/except so one broken song (Unicode quirk, model edge case, etc.) doesn't 500 the whole request.

**Persona is the lead, not the dominant emotion** — `PersonaHero` (LLM-generated archetype name + emoji + dry tagline) replaces the old "01 + Sadness + summary" hero block whenever `persona` is present. The numbered emotion list then starts at **01** with the dominant emotion. When `persona` is `null` (network error reaching `/persona`), `EmotionResults` falls back to the legacy `HeroEmotion` block and the list starts at **02** — that's the only path where the rank-01 hero sits outside the list. Mirror this branch in `ShareCard` if you change either rendering.

**Persona voice is dry / editorial** — names like "The Tender Pessimist", "Mostly Fine, Quietly Spiraling", "An Optimist with Footnotes". The system prompt in `api/app.py` (`PERSONA_SYSTEM`) explicitly forbids BuzzFeed-style names, gendered terms, hashtags, and exclamation marks. If you tweak it, keep that register — switching to a playful tone breaks the editorial brand the rest of the UI depends on.

**Share captures an off-screen ShareCard, not the live results** — `ShareCard` (`frontend/src/components/ShareCard.tsx`) is a fixed 1080×1350 editorial layout rendered into the DOM at `position: fixed; left: -10000px` whenever results exist. `useShare` aims `html2canvas` at that node, so the PNG is identical regardless of viewport. **Do not** point the capture ref at the live page or toggle a watermark element on/off during capture — both produced visible flicker and inconsistent mobile spacing in earlier versions. The `EMOJIFY` watermark lives only inside `ShareCard` (header wordmark + accent footer mark); never re-introduce a `.share-watermark` element on the live page.

## Frontend design system

Editorial music magazine aesthetic — committed to and not negotiable without an explicit design conversation. Cream paper background, deep ink text, hot orange (`#FF3D00`) as the *only* accent. **No dark mode, no purple, no glass/blur effects, no rounded cards.** If you find yourself reaching for a hex value that isn't a token in `index.css`, stop and reconsider.

**Type stack** (loaded via Google Fonts `@import` in `index.css`): Fraunces for display + italic hero text, Geist for body, JetBrains Mono for labels/numbers/captions. Don't introduce a fourth font.

**Two top-level layouts** (mutually exclusive — `App.tsx` picks one):
- `.cover` — full-viewport editorial page used by `LoginScreen` and `LoadingScreen` via the shared `EditorialCover` component. Three rows: wordmark / hero / footer marginalia.
- `.app-shell` — the logged-in results page. Header / time-range row / CTA / hero emotion / numbered list / share CTA / marginalia. The share button sits **between** the list and the marginalia; the marginalia ("powered by Genius / HuggingFace") must remain the last on-page element. `Marginalia` is its own component (`components/Marginalia.tsx`) so `App.tsx` can slot the share CTA above it.

**All visible strings live in `frontend/src/copy.ts`.** Don't inline new strings into components — add to `COPY` and reference. This file also exports `ANALYSIS_CAP = 25`, which **must stay in sync with `MAX_SONGS` in `api/app.py`** — it's how the frontend renders honest "across N tracks" microcopy without lying when Spotify returned more tracks than the backend processed.

**Patterns worth knowing:**
- Radio toggles styled as text links use the modern `:has(input:checked)` pattern. The native `<input type="radio">` is visually hidden but kept in the DOM for a11y. See `.time-range-option` in `App.css`.
- The cover entrance animation uses four staggered classes (`cover-anim-1` through `cover-anim-4`) with 80ms offsets — apply top-to-bottom on cover children.
- Emotion list rows use a real CSS dotted leader (a flex-grow span with `border-bottom: 1px dotted`) — that's the magazine touch. Don't replace with a static character.
- `useEmojiGenerator` exposes `trackCount` (the analyzed count, capped at `ANALYSIS_CAP`) — pass it to `EmotionResults` for honest microcopy.

See `frontend/plan.md` for full design rationale (why these choices, what was rejected) and `ROADMAP.md` for what to build next.

## Production deployment

- **Frontend → Vercel** (root: `frontend/`, env: `VITE_SPOTIFY_CLIENT_ID`, `VITE_API_URL`)
- **Backend → Render** free tier (root: `api/`, start command: `gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120`, env: `GENIUS_TOKEN`, `HF_API_TOKEN`, `ANTHROPIC_API_KEY`, `CORS_ORIGINS`)

A `Procfile` exists in `api/` for Render auto-detection. Render free tier spins down after 15 min idle (~30s cold start); the HF model also has its own warm-up. Both push from `master` auto-deploy.
