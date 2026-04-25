# Emojify — Frontend Redesign Plan

## The verdict on what's there

It looks like 80% of side projects in 2024. Dark purple-to-indigo gradient. Rounded glassy cards on a flat background. Tiny pill toggles. Sans-serif everything in `Segoe UI`. A "spinner + skeleton" loading state. Gradient text on the wordmark. It works. It's also indistinguishable from twelve thousand other React side projects, half a dozen Vercel templates, and approximately every "AI-powered something" landing page shipped this year.

We're not iterating on it. We're throwing it out.

---

## Direction: **After-Hours Music Magazine**

Imagine the year-end issue of a smart music magazine — Pitchfork crossed with The New Yorker's typography, with one acid-bright moment of personality. Big serif display headlines. A cream paper background that feels printed, not screen-rendered. Tabular numerals running down a numbered list. The emoji isn't a small accent — it's the **cover art**, sized like a David Carson layout demanded it.

The brief is to look "sleek and production ready." Sleek doesn't mean dark mode. The most polished products of the last two years (Linear, Arc, Vercel, Are.na, MSCHF) commit to a sharp aesthetic point of view and refuse to apologize for it. We're going to do the same.

**The one thing people remember:** their #1 emotion's emoji rendered at ~280px on a cream page, with a serif headline that reads like editorial copy, not a dashboard label.

---

## Aesthetic system

### Type
- **Display: [Fraunces](https://fonts.google.com/specimen/Fraunces)** (Google Fonts, free, variable). Optical-size axis tuned soft + warm. Used for the wordmark, the hero numerals, the emotion names. We lean into its character — soft serifs, generous counters, real italics with swash potential.
- **Body / UI: [Geist](https://vercel.com/font)** (Vercel, free, variable). A grotesque with personality but not loud. Replaces every `Segoe UI`.
- **Mono: [JetBrains Mono](https://www.jetbrains.com/lp/mono/)** for tabular runs — track counts, scores, labels like `01 / SHORT_TERM`.

No `Inter`. No `Space Grotesk`. No `system-ui`. If the font fails to load we fall back to platform serifs/sans, not a crash.

### Color
A four-color system, no more. Dominant warm neutrals, one shock accent.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F1ECE2` | Background. Warm cream, not white. Reads as paper. |
| `--ink` | `#181613` | Primary text & lines. Not pure black — too cold. |
| `--ink-mute` | `#6B6258` | Secondary text, captions, metadata. |
| `--accent` | `#FF3D00` | The shock. Used sparingly: hover states, the active time-range, the bar fills, the focused outline. |
| `--rule` | `rgba(24, 22, 19, 0.12)` | Hairline rules between list items. |

Hot orange beats acid yellow on cream — it sits closer in luminance, so it doesn't scream like a highlighter. Purple is **banned** from this design.

> **A note on dark mode:** we're not shipping one. A cream-paper editorial design forced into dark mode becomes a different (worse) product. Commit.

### Layout principles
- **Editorial grid, not centered shrug.** A wide content column (~720px max) flush-left with generous left margin. Right column reserved for marginalia: track counts, time-range label, footnotes.
- **Numbered list aesthetic.** Results are `01 / 02 / 03`, not bullet points. Numbers are huge, set in display serif.
- **Asymmetry.** The wordmark `EMOJIFY` is set top-left at ~18px. The page hero is the user's #1 emotion. Nothing is centered just because.
- **Hairlines, not boxes.** Replace the rounded card stack with a numbered list separated by `1px` rules. Cards die today.
- **Negative space is a feature.** Don't fill it.

### Texture
- A faint paper grain overlay (8% opacity SVG noise, fixed-position) so the cream background reads tactile, not flat. Tiny, but transformational.
- Hairline rules for everything (`1px solid var(--rule)`).
- No drop shadows. No glow. No glassmorphism. No backdrop-filter.

---

## Screen by screen

### Login — "The cover"

The first impression is the most important real estate. Right now it's a centered `🎵`, gradient `Emojify`, and a button. Bin it.

**New:** a full-bleed editorial cover.

- Top-left: `EMOJIFY` wordmark, 14px, all caps, tracked +0.12em, set in Geist Mono.
- Lower-left, hero zone: a serif display headline at ~88px (clamp to viewport), set in Fraunces italic:
  > *"What does your taste say about you?"*
- Below it, in body sans, max-width ~32ch:
  > "We read the lyrics behind your top tracks and translate them into emotions. It's pop psychology with worse footnotes."
- The CTA isn't a pill. It's a text link: `Connect Spotify →` in a heavy weight, with the arrow doing a 6px slide on hover. Underline drawn manually with a 1px rule that animates on hover.
- Bottom-right margin: `01 / 02 — A SLIGHTLY UNHINGED MUSIC ANALYSIS` in mono, 11px.
- A single grain overlay across everything.

The whole page is left-aligned. There's no card. There's no glow. There's room to breathe.

### Loading — "The slow drip"

Right now: spinner + faded quote. Functional, generic.

**New:** the page doesn't change. The hero text on the cover swaps to:
> *"Reading between the lines…"* (also italic Fraunces, same size as the cover)

Below it, a single rotating lyric quote in a smaller display serif, with the artist credited in mono on a new line:
```
"And I will always love you"
— DOLLY PARTON
```

Quotes cross-fade with a 600ms ease-out. The only "spinner" is a tiny 3-dot ellipsis next to the headline that pulses one dot at a time — `· · ·` → `· · ·` → `· · ·`. No circle spinner. Spinners are a tell.

A bottom-left line of mono microcopy ticks through three labels on a timer: `FETCHING TRACKS…` → `READING LYRICS…` → `ANALYZING EMOTIONS…`, ~3s each, looping until loading clears. It's *theatre*, not real progress — `useEmojiGenerator` doesn't expose phase state today and we shouldn't add it just for cosmetics. Honest fiction beats fake telemetry.

### Results — "The diagnosis"

This is the destination. It earns the most ambition.

**Layout (top to bottom):**

1. **Header strip.** Left: `EMOJIFY` wordmark. Center-left: `THE DIAGNOSIS` in mono, 11px, all caps. Right: `LOG OUT` as a text link with mono underline. Hairline rule below.

2. **Time range row.** Three text labels separated by `·`, like a magazine sub-deck:
   ```
   LAST MONTH  ·  LAST 6 MONTHS  ·  ALL TIME
   ```
   The active one is set in `--accent`, no background. Inactive: `--ink-mute`. Hover slides a 1px underline in. No pill. No box.

3. **Hero block — the #1 emotion.** Two-column on desktop, stacked on mobile.
   - **Left (60%):** the emoji at 240–280px, line-height 1, no shadow, no glow. Just rendered massive on the page.
   - **Right (40%):** stack of three lines:
     - `01` in Fraunces display, 96px, `--ink-mute`.
     - The emotion name (e.g. `Joy`) in Fraunces italic, 64px, `--ink`.
     - One line of editorial microcopy in body sans, 16px: `Across {n} of your top tracks, joy hit the loudest.` Where `{n}` is the real count of tracks sent to `/lyrics` — read it off `Object.values(artistSongs).flat().length` in `useEmojiGenerator` and surface as part of the results state. Don't hardcode `25` (it's a cap, not a floor — see CLAUDE.md).
     - Score in mono caption, 11px: `SCORE 8.42 · {n} TRACKS`

4. **The rest of the list.** A flat numbered list, hairline-separated, each row:
   ```
   02   😢   Sadness ····················· 6.21
   03   ❤️   Love    ····················· 4.88
   ```
   - Number: Fraunces display, 28px, `--ink-mute`.
   - Emoji: 32px.
   - Emotion name: Fraunces, 22px, `--ink`.
   - Dotted leader (the `····`) is a real CSS dotted leader (flex grow + dotted bottom border on a span) — that's the magazine touch.
   - Score: JetBrains Mono, 14px, `--ink`, tabular-nums.
   - On hover: row gets a 4px left inset bar in `--accent`, score gets the accent color, 200ms ease.

5. **Footer marginalia.** A two-line block, mono, 10px, `--ink-mute`:
   ```
   EMOTIONS VIA ROBERTA-BASE-GO_EMOTIONS  ·  HUGGINGFACE INFERENCE
   LYRICS COURTESY OF GENIUS  ·  SPOTIFY DATA VIA YOU
   ```

The whole thing reads top-to-bottom like a magazine page. No carousel. No tabs. No accordion. One linear story.

### Errors

Currently a red pill. Fine, but matches the wrong design.

**New:** a single line at the top of the content column:
```
✕  COULDN'T REACH THE BACKEND.  RETRY →
```
Set in mono, 13px, `--accent` color. Inline retry. No background, no border. Just type.

---

## Microcopy rewrite

The current strings ("Generate Emojis", "Top emotions", "Last 6 Months") are functional. They're also voiceless. Replace with editorial copy that has a point of view.

| Current | New |
|---|---|
| `Connect Spotify` | `Connect Spotify →` |
| `Generate Emojis` | `Read my taste →` (yes, on the cover, this is the CTA after login too) |
| `Time range` (legend) | *(removed — the row of links is self-explanatory)* |
| `Top emotions` | `THE DIAGNOSIS` |
| `Last Month` | `LAST MONTH` (uppercase, mono) |
| `Last 6 Months` | `LAST 6 MONTHS` |
| `All Time` | `ALL TIME` |
| `Log out` | `LOG OUT` (mono text link) |
| `Analyzing your top tracks…` | `Reading between the lines…` |
| `No top tracks found for this period.` | `Spotify says you've been quiet. Try a longer window.` |
| `No lyrics found for your top tracks.` | `Couldn't find lyrics for any of these. Genius is opinionated about what counts as a song.` |
| `Session expired. Please log in again.` | `Spotify forgot you. Reconnect →` |

Tone: dry, confident, occasionally self-deprecating. Never cute. Never "Oops!". Never "✨".

---

## Motion

Restraint is the plan. Six total animations across the entire app:

1. **Cover load** — hero italic headline drops in with a 400ms `cubic-bezier(0.16, 1, 0.3, 1)` translate (8px → 0) + opacity. 80ms stagger after wordmark, microcopy, and CTA.
2. **CTA hover** — the `→` arrow translates 6px right, 180ms ease.
3. **Time range hover** — 1px underline scales from 0% to 100% width, 200ms ease, transform-origin left.
4. **Loading dots** — three dots pulse in sequence, ~1.4s cycle.
5. **Loading quote** — 600ms cross-fade between quotes.
6. **Results row hover** — left-inset accent bar slides in (4px width, 0% → 100% height), score color shifts to `--accent`, 200ms.

That's it. No parallax. No scroll-triggered anything. No spring physics. Music magazines don't bounce.

---

## Implementation order

### Phase 1 — Foundation (PR #1)
- Add Fraunces, Geist, JetBrains Mono via `@import` from Google Fonts / Vercel CDN in `index.css`.
- Replace `index.css` and `App.css` entirely. The variables, the grain overlay, the type scale, the four colors. Delete every existing rule — don't merge.
- Add a single SVG grain overlay as a fixed-position pseudo-element on `body`.
- Update `vite.config.js` only if needed for static font hosting (probably not).

### Phase 2 — Cover & Auth (PR #2)
- Rewrite `LoginScreen.tsx` to the new editorial cover. Drop the `<div class="app">` wrapper centering pattern entirely.
- Rewrite `LoadingScreen.tsx` — same cover layout, swapped headline, ellipsis dots, status mono line, rotating quote.
- Both screens share an `<EditorialCover>` layout primitive — DRY it.

### Phase 3 — Results page (PR #3)
- Rewrite `App.tsx`'s logged-in branch around the new header / time range / hero / list layout.
- Rewrite `Header.tsx` (slim, mono, hairline rule).
- Rewrite `TimeRangePicker.tsx` as an inline text-link row, not a fieldset of pills. Native radio inputs stay (a11y), styled as text.
- Rewrite `EmotionResults.tsx`:
  - Top: split into `<HeroEmotion>` (the #1) and `<EmotionList>` (the rest).
  - The dotted leader effect deserves its own `<DottedLeader>` component — `flex: 1 1 auto` span with `border-bottom: 1px dotted var(--rule)` and a 6px vertical offset.
- Rewrite `ErrorMessage.tsx` to an inline mono text line with retry callback.

### Phase 4 — Microcopy & polish (PR #4)
- Replace every string per the table above. Centralize in a `copy.ts` module so future edits are one file.
- Add the footer marginalia block.
- Tune motion timings against a real load. If the cover headline drop feels heavy, drop to 280ms.
- Cross-browser font-loading flash audit (use `font-display: swap`, accept the FOUT — it's editorial, FOUT is on-brand).

### Phase 5 — Mobile (PR #5)
- The hero block stacks (emoji on top, label/score block below).
- The header collapses: just `EMOJIFY` and a `≡` overflow for log out.
- The numbered list shrinks the leader span and tightens the gap.
- Type scale clamps with `clamp()` — hero from 88px down to 48px on small screens.

---

## What we're NOT doing

A short list of temptations to refuse:

- Dark mode toggle. (Commit.)
- A purple anything. Not even a touch.
- Glassmorphism, backdrop-blur, neumorphism, or "frosted" anything.
- Card stacks. The numbered list with hairlines is the entire information architecture.
- Spotify green for accents. We're not part of their brand, we just use their data.
- A logo mark. The wordmark in Fraunces is the brand.
- Confetti, particles, or celebratory animation when results land. The page IS the celebration.
- Tooltips. If you need to explain an element, label it.
- A settings panel. The product has three settings; they live as text links.

---

## Definition of done

You can put the live URL in front of a designer who's seen everything, and their first reaction isn't "oh, another Vercel template." It's "wait, who built this." Then they ask what fonts you used.
