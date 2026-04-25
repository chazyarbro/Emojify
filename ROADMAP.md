# Roadmap

Four features the app needs next, in priority order. All four are about turning a one-shot toy into something with a reason to come back (or to share). Pick them up one at a time — each is independently shippable.

---

## 1. Shareable diagnoses

**Why this is #1.** Emojify produces a beautiful editorial result page that nobody else will ever see. Spotify Wrapped goes viral every December because the screens were *designed to screenshot* — that's the whole growth engine. Without sharing, every user is a dead end. With it, every user is top-of-funnel.

**What to build:**
- A `/share/:id` route that renders a clean, watermarked, login-free version of someone's diagnosis. The `:id` is a short hash that encodes the full result payload (emotions + scores + trackCount + timeRange) — no DB needed for v1, just base64-encoded JSON in the URL fragment, or a hash if it gets too long.
- A "Save as image" button that produces a 1080×1920 PNG of the hero block (IG-story-shaped). Two implementation paths:
  - Client-side: [`html-to-image`](https://github.com/bubkoo/html-to-image) on the hero `<section>`. Simplest. Risk: emoji rendering differs across browsers/OS so the screenshot may not match what the user sees.
  - Server-side: a `/og/:id` endpoint that uses [`@vercel/og`](https://vercel.com/docs/functions/og-image-generation) to render a consistent image. Better quality, requires a Node serverless function or extending the Flask backend.
- Proper `<meta property="og:*">` and Twitter Card tags on the share URL so iMessage/Twitter/Slack previews render the diagnosis card. Pair with the server-rendered OG image above.

**Files affected:** new `frontend/src/routes/Share.tsx`; routing setup (currently no router — add `react-router-dom` or roll a tiny one); `index.html` head needs OG tags injected per route (Vite SPA needs prerendering or a `vercel.json` rewrite to a serverless function for proper SSR meta tags).

**Non-obvious gotcha:** Vercel's static SPA hosting won't dynamically inject OG tags. You either need a serverless function for the `/share/*` route that returns HTML with the right tags, or you accept that link previews show generic site metadata. Recommend the serverless function — it's also where the OG image generation lives.

**Scope:** ~1 day end-to-end if you do server-rendered OG images. ~3 hours if you start with client-side `html-to-image` + a copy-link button.

---

## 2. Show which songs were analyzed

**Why this matters.** "Joy hit the loudest across 25 tracks" is mysterious in two ways: the result is mysterious (good — that's the magic), AND the input is mysterious (bad — users don't trust it). Showing the input list converts skepticism into "huh, that tracks". Doubles perceived intelligence for ~2 hours of work.

**What to build:**
- Below the marginalia footer, add a collapsible disclosure: `Show the tracks ↓` (mono, 11px, ink-mute, matching the editorial system).
- Expanded state: a clean editorial list, two columns on desktop:
  ```
  01  Blinding Lights      THE WEEKND
  02  Levitating           DUA LIPA
  ...
  ```
  Track number in Fraunces display, title in body sans, artist in mono uppercase. Same hairline rules between rows as the emotion list. No emoji here — that's the diagnosis screen's job.
- Cap at the displayed `trackCount` (already exposed by `useEmojiGenerator`) so it matches what the backend actually analyzed, not what Spotify returned.

**Files affected:** `frontend/src/components/EmotionResults.tsx` (add the disclosure section); `frontend/src/hooks/useEmojiGenerator.ts` (also expose `analyzedTracks: { title: string; artist: string }[]` — currently only the emotion array survives the request); `frontend/src/copy.ts` (`showTracks`, `hideTracks` strings).

**Non-obvious gotcha:** Right now `artistSongs` is computed inside `handleGenerate` and discarded. Pull it up into hook state and surface it. Also: the *order* matters — the backend slices the first `MAX_SONGS=25` from `Object.values(artistSongs).flat()`, so display the same slice. Don't display all 50 if Spotify returned 50 but only 25 were analyzed (lying by omission).

**Scope:** ~2 hours.

---

## 3. Cache the diagnosis

**Why this matters.** Refresh the results page → wait 10 seconds again for an answer that hasn't changed. On Render free tier with cold-start spin-down, the wait can balloon to 40+ seconds. Caching turns this from a deal-breaker into a one-time-per-day annoyance.

**What to build (two layers, both worth it):**

**Frontend cache (ship first, easy):**
- Stash the result in `localStorage` keyed by `emojify:result:{timeRange}:{YYYY-MM-DD}` (date-bucketed so it auto-expires daily).
- On mount of the results screen, if the cache hit matches the current time range, render instantly and add a small mono caption near the marginalia: `Cached · analyzed 2 hours ago — re-run`.
- The "re-run" word is a text link that calls `handleGenerate(timeRange)` and bypasses cache for one call.
- Persist `{ results, trackCount, analyzedTracks, timestamp }`.

**Backend cache (ship second, bigger payoff):**
- In-memory dict keyed by `(artist.lower(), title.lower())` mapping to `{ lyrics, predicted_label, predicted_score, fetched_at }`.
- Inside `_fetch_and_clean()` and `classify_emotions_batch()`, check the cache before calling Genius / HF. Cache hit on lyrics skips the Genius scrape; cache hit on the (lyrics, prediction) pair skips the HF call.
- TTL ~7 days. Bound the dict size to e.g. 5000 entries with a simple FIFO or LRU.
- Optional: SQLite at `api/cache.db` for persistence across Render restarts. `aiosqlite` not needed — `sqlite3` from stdlib is fine for this scale.

**Files affected:** `frontend/src/hooks/useEmojiGenerator.ts` (cache check + write); `frontend/src/copy.ts` ("cached / re-run" strings); `api/app.py` (cache dict at module level, with `threading.Lock` if going for SQLite); optional `api/cache.py` if it grows past ~30 lines.

**Non-obvious gotcha:** The HF inference is *batched* — currently we send all texts in one POST and get all predictions back. With caching, you'll have a mix of cache hits and misses; the simplest pattern is to filter `texts` down to only-misses, send those to HF, then merge predictions back into the original order. Don't break the batch into per-song calls — that gives up the whole speed win.

**Scope:** ~1 hour for frontend cache. ~3 hours for the backend layer with SQLite.

---

## 4. Add audio (use the preview URLs you already have)

**Why this matters.** Emojify is an app *about music* with zero audio. Spotify's `track` objects already include a `preview_url` field — a 30-second MP3, free, no extra auth. Hovering the hero emoji to play a clip of the song that drove that emotion is a tiny feature with a huge sensory payoff. It also subtly justifies the "we listened to your music" framing of the whole app.

**What to build:**
- During the analysis phase, remember which song scored highest for each canonical emotion (currently only the *aggregate* totals survive). Surface this as `representative_track` per emotion: `{ title, artist, preview_url }`.
- On the hero emoji: hover (desktop) or tap (mobile) starts playback of the representative track for that emotion. A second tap stops it.
- Visual: a tiny hairline circle that fills counterclockwise as the 30s clip plays — built with SVG `stroke-dasharray`, sits right at the edge of the emoji.
- Audio fades in/out with a 200ms gain ramp via Web Audio (no abrupt cut-in).
- Only ONE clip plays at a time — clicking a different emoji stops the previous.

**Files affected:**
- `api/app.py` — the `/lyrics` route currently throws away which song scored what. Restructure to keep per-song predictions and pick a representative track per canonical emotion (highest score for that emotion). Return alongside the existing `sorted_emotions`.
- `frontend/src/types/api.ts` — extend `EmotionResult` or add a parallel `RepresentativeTrack` type.
- `frontend/src/spotify.ts` — `getTopTracks` already gets `preview_url` in the response, just include it in the type and pass it through `spotifyTracksToArtistSongs`. Heads up: this changes the API contract — backend needs to receive `preview_url` so it can echo back; restructure the request body from `{ artist: [songs] }` to `[{ artist, title, preview_url }]`.
- `frontend/src/components/EmotionResults.tsx` — hover handler on the hero emoji, the SVG progress ring, the audio element.
- New hook: `useEmojiAudio(track)` — encapsulates the Audio element, gain node, fade logic, single-instance enforcement.

**Non-obvious gotcha:** `preview_url` is `null` for ~10% of Spotify tracks (licensing). Handle gracefully — if no preview, skip the audio affordance entirely, don't show a broken-looking button. Also: iOS Safari requires a user gesture to start audio playback, so the first hover on touch devices won't work — use `click`/`touchstart` on mobile.

**Scope:** ~4-6 hours. The data plumbing (changing the API contract to thread `preview_url` through) is most of it. The actual audio code is small.

---

## What's intentionally NOT on this list

- Genre / decade enrichment dashboards. Dilutes the editorial focus on emotions.
- Multi-period comparison ("you got happier this month"). Wrong app — that's an Emojify Wrapped v2 idea.
- Drag-to-reorder the emotion list. Lies to the user — they can't actually change the analysis.
- A settings panel. The product has one setting (time range) and it's already on the page.

If any of these start sounding compelling, that's a sign the app is ready for a v2 strategy conversation, not just another feature.
