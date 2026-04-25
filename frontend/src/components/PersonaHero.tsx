import type { EmotionResult, Persona } from "../types/api";
import { COPY } from "../copy";

interface PersonaHeroProps {
  persona: Persona;
  hero: EmotionResult;
  trackCount: number;
}

export function PersonaHero({ persona, hero, trackCount }: PersonaHeroProps) {
  const [, score] = hero;
  return (
    <section className="persona-hero">
      <div className="persona-hero-emoji" aria-hidden>
        {persona.emoji}
      </div>
      <div className="persona-hero-info">
        <p className="persona-hero-kicker">{COPY.results.diagnosisLabel}</p>
        <h2 className="persona-hero-name">{persona.name}</h2>
        <p className="persona-hero-tagline">{persona.tagline}</p>
        <p className="persona-hero-meta">
          {COPY.results.heroMeta(score, trackCount)}
        </p>
      </div>
    </section>
  );
}
