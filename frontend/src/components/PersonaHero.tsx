import type { Persona } from "../types/api";
import { COPY } from "../copy";

interface PersonaHeroProps {
  persona: Persona;
}

export function PersonaHero({ persona }: PersonaHeroProps) {
  return (
    <section className="persona-hero">
      <div className="persona-hero-emoji" aria-hidden>
        {persona.emoji}
      </div>
      <div className="persona-hero-info">
        <p className="persona-hero-kicker">{COPY.results.diagnosisLabel}</p>
        <h2 className="persona-hero-name">{persona.name}</h2>
        <p className="persona-hero-tagline">{persona.tagline}</p>
      </div>
    </section>
  );
}
