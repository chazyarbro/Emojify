import type { EmotionResult, Persona } from "../types/api";
import { EMOTION_EMOJI, type Emotion } from "../types/emotions";
import { COPY } from "../copy";
import { PersonaHero } from "./PersonaHero";

interface EmotionResultsProps {
  results: EmotionResult[];
  trackCount: number;
  persona: Persona | null;
}

export function EmotionResults({
  results,
  trackCount,
  persona,
}: EmotionResultsProps) {
  const hero = results[0];
  if (!hero) return null;

  if (persona) {
    return (
      <>
        <PersonaHero persona={persona} />
        <EmotionList results={results} startRank={1} />
      </>
    );
  }

  const rest = results.slice(1);
  return (
    <>
      <HeroEmotion result={hero} trackCount={trackCount} />
      {rest.length > 0 && <EmotionList results={rest} startRank={2} />}
    </>
  );
}

function HeroEmotion({
  result,
  trackCount,
}: {
  result: EmotionResult;
  trackCount: number;
}) {
  const [emotion, score] = result;
  const emoji = EMOTION_EMOJI[emotion as Emotion] ?? "😐";

  return (
    <section className="hero-emotion">
      <div className="hero-emoji" aria-hidden>{emoji}</div>
      <div className="hero-info">
        <div className="hero-rank">01</div>
        <h2 className="hero-name">{emotion}</h2>
        <p className="hero-summary">
          {COPY.results.heroSummary(emotion, trackCount)}
        </p>
        <p className="hero-meta">{COPY.results.heroMeta(score, trackCount)}</p>
      </div>
    </section>
  );
}

function EmotionList({
  results,
  startRank,
}: {
  results: EmotionResult[];
  startRank: number;
}) {
  return (
    <ol className="emotion-list" start={startRank}>
      {results.map(([emotion, score], idx) => {
        const rank = startRank + idx;
        const emoji = EMOTION_EMOJI[emotion as Emotion] ?? "😐";
        return (
          <li key={emotion} className="emotion-row">
            <span className="emotion-row-num">{String(rank).padStart(2, "0")}</span>
            <span className="emotion-row-emoji" aria-hidden>{emoji}</span>
            <span className="emotion-row-name">
              <span>{emotion}</span>
              <span className="emotion-row-leader" aria-hidden />
            </span>
            <span className="emotion-row-score">{score.toFixed(2)}</span>
          </li>
        );
      })}
    </ol>
  );
}
