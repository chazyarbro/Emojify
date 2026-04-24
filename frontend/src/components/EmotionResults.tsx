import type { EmotionResult } from "../types/api";
import { EMOTION_EMOJI, type Emotion } from "../types/emotions";

interface EmotionResultsProps {
  results: EmotionResult[];
}

export function EmotionResults({ results }: EmotionResultsProps) {
  if (results.length === 0) return null;
  const maxScore = results[0]?.[1] ?? 1;

  return (
    <section className="results">
      <h2>Your top emotions</h2>
      <ul className="emotion-list">
        {results.map(([emotion, score]) => (
          <li key={emotion} className="emotion-item">
            <span className="emotion-emoji" aria-hidden>
              {EMOTION_EMOJI[emotion as Emotion] ?? "😐"}
            </span>
            <div className="emotion-body">
              <span className="emotion-label">{emotion}</span>
              <div className="emotion-bar-track">
                <div
                  className="emotion-bar-fill"
                  style={{ width: `${(score / maxScore) * 100}%` }}
                />
              </div>
            </div>
            <span className="emotion-score">{score.toFixed(1)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
