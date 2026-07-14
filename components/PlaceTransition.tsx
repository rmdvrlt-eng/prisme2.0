"use client";

import { useEffect } from "react";

export type TransitionMood = "garden" | "forest" | "river" | "summits" | "temple" | "sky" | "house" | "journal" | "journey";

const labels: Record<TransitionMood, { title: string; subtitle: string }> = {
  garden: { title: "Le Jardin", subtitle: "La lumière traverse les feuilles." },
  forest: { title: "La Forêt", subtitle: "Le sentier se dessine sous tes pas." },
  river: { title: "Le Fleuve", subtitle: "Les souvenirs glissent dans le courant." },
  summits: { title: "Les Sommets", subtitle: "Le silence ouvre l’horizon." },
  temple: { title: "Le Temple", subtitle: "Ce qui compte prend forme." },
  sky: { title: "Le Ciel", subtitle: "Les possibles deviennent constellations." },
  house: { title: "La Maison", subtitle: "Tu retrouves ton refuge." },
  journal: { title: "Le Journal", subtitle: "Une trace rejoint le monde." },
  journey: { title: "L’Exploration", subtitle: "Un nouveau chemin s’ouvre." }
};

export function PlaceTransition({ mood, onComplete }: { mood: TransitionMood; onComplete: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 1150);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  const copy = labels[mood];
  return (
    <div className={`place-transition mood-${mood}`} role="status" aria-live="polite">
      <div className="place-transition-camera" aria-hidden="true">
        <i className="transition-depth depth-a" />
        <i className="transition-depth depth-b" />
        <i className="transition-depth depth-c" />
        <i className="transition-light" />
        <i className="transition-path" />
        <span className="transition-presence" />
      </div>
      <div className="place-transition-copy">
        <span>Prisme</span>
        <strong>{copy.title}</strong>
        <p>{copy.subtitle}</p>
      </div>
    </div>
  );
}
