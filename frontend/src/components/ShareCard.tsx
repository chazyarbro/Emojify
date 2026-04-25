import { forwardRef } from "react";
import type { EmotionResult, Persona } from "../types/api";
import { EMOTION_EMOJI, type Emotion } from "../types/emotions";

interface ShareCardProps {
  results: EmotionResult[];
  trackCount: number;
  persona: Persona | null;
}

const SECONDARY_LIMIT = 5;

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ results, trackCount, persona }, ref) {
    const hero = results[0];
    if (!hero) return null;

    const [heroEmotion, heroScore] = hero;
    const heroEmoji = EMOTION_EMOJI[heroEmotion as Emotion] ?? "😐";

    const list = persona ? results.slice(0, SECONDARY_LIMIT + 1) : results.slice(1, 1 + SECONDARY_LIMIT);
    const listStart = persona ? 1 : 2;

    return (
      <div className="share-card-frame" aria-hidden>
        <article ref={ref} className="share-card">
          <header className="share-card-header">
            <span className="share-card-issue">A MUSIC EMOTION ANALYSIS</span>
          </header>

          {persona ? (
            <section className="share-card-hero share-card-hero-persona">
              <div className="share-card-emoji">{persona.emoji}</div>
              <div className="share-card-hero-info">
                <div className="share-card-kicker">THE DIAGNOSIS</div>
                <h2 className="share-card-name">{persona.name}</h2>
                <p className="share-card-tagline">{persona.tagline}</p>
              </div>
            </section>
          ) : (
            <section className="share-card-hero">
              <div className="share-card-emoji">{heroEmoji}</div>
              <div className="share-card-hero-info">
                <div className="share-card-rank">01</div>
                <h2 className="share-card-name">{heroEmotion}</h2>
                <p className="share-card-summary">
                  Across {trackCount} of my top tracks,{" "}
                  {heroEmotion.toLowerCase()} hit the loudest.
                </p>
                <p className="share-card-meta">
                  SCORE {heroScore.toFixed(2)} · {trackCount} TRACKS
                </p>
              </div>
            </section>
          )}

          {list.length > 0 && (
            <ol className="share-card-list" start={listStart}>
              {list.map(([emotion, score], idx) => {
                const rank = listStart + idx;
                const emoji = EMOTION_EMOJI[emotion as Emotion] ?? "😐";
                return (
                  <li key={emotion} className="share-card-row">
                    <span className="share-card-row-num">
                      {String(rank).padStart(2, "0")}
                    </span>
                    <span className="share-card-row-emoji">{emoji}</span>
                    <span className="share-card-row-name">
                      <span>{emotion}</span>
                      <span className="share-card-row-leader" />
                    </span>
                    <span className="share-card-row-score">
                      {score.toFixed(2)}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <footer className="share-card-footer">
            <span className="share-card-footer-mark">EMOJIFY</span>
          </footer>
        </article>
      </div>
    );
  }
);
