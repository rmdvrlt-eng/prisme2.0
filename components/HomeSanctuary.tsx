"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adoptPet,
  careForPet,
  furnitureCatalog,
  FurnitureId,
  HouseTheme,
  loadSanctuary,
  petCatalog,
  PetId,
  placeFurniture,
  removeFurniture,
  SanctuaryState,
  saveSanctuary
} from "@/lib/sanctuary";
import { defaultEcosystem, EcosystemState, loadEcosystem } from "@/lib/ecosystem";

const themes: { id: HouseTheme; label: string; note: string }[] = [
  { id: "ambre", label: "Ambre", note: "Feu, bois et lumière chaude" },
  { id: "foret", label: "Forêt", note: "Mousse, plantes et verts profonds" },
  { id: "nuit", label: "Nuit", note: "Bleu sombre et constellations" },
  { id: "aube", label: "Aube", note: "Lin clair et lumière du matin" }
];

function FurnitureModel({ id }: { id: FurnitureId }) {
  return <span className={`furniture-model furniture-${id}`} aria-hidden="true">
    <i className="part-a"/><i className="part-b"/><i className="part-c"/><i className="part-d"/>
  </span>;
}

function PetModel({ id, large = false }: { id: PetId; large?: boolean }) {
  return <span className={`pet-model pet-${id}${large ? " large" : ""}`} aria-hidden="true">
    <i className="pet-tail"/><i className="pet-body"/><i className="pet-head"/><i className="pet-ear ear-left"/><i className="pet-ear ear-right"/><i className="pet-eye eye-left"/><i className="pet-eye eye-right"/><i className="pet-leg leg-left"/><i className="pet-leg leg-right"/>
  </span>;
}

export function HomeSanctuary({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, setState] = useState<SanctuaryState>(() => loadSanctuary());
  const [selected, setSelected] = useState<FurnitureId | null>(null);
  const [tab, setTab] = useState<"decorate" | "companions">("decorate");
  const [message, setMessage] = useState("Choisis un objet, puis touche une place dans la pièce.");
  const [ecosystem, setEcosystem] = useState<EcosystemState>(defaultEcosystem());

  useEffect(() => {
    if (open) {
      setState(loadSanctuary());
      setEcosystem(loadEcosystem());
    }
  }, [open]);

  useEffect(() => {
    function refresh(event: Event) {
      const custom = event as CustomEvent<{ ecosystem?: EcosystemState; sanctuary?: SanctuaryState }>;
      setEcosystem(custom.detail?.ecosystem ?? loadEcosystem());
      setState(custom.detail?.sanctuary ?? loadSanctuary());
    }
    window.addEventListener("prisme:ecosystem-updated", refresh);
    return () => window.removeEventListener("prisme:ecosystem-updated", refresh);
  }, []);

  const activePet = petCatalog[state.pet.active];
  const activeBond = Math.min(100, (state.pet.bond[state.pet.active] ?? 0) + Math.round(ecosystem.animalTrust * .12));
  const petStage = activeBond >= 75 ? "Il te fait pleinement confiance" : activeBond >= 40 ? "Votre lien devient familier" : "Il apprend encore à te connaître";
  const placedByCell = useMemo(() => new Map(state.placed.map((item) => [`${item.x}-${item.y}`, item])), [state.placed]);

  function commit(next: SanctuaryState) {
    setState(next);
    saveSanctuary(next);
  }

  function chooseTheme(theme: HouseTheme) { commit({ ...state, theme }); }

  function place(x: number, y: number) {
    if (!selected) {
      const item = placedByCell.get(`${x}-${y}`);
      if (item) {
        commit(removeFurniture(state, item.id));
        setMessage(`${furnitureCatalog[item.furnitureId].label} rangé dans l’inventaire.`);
      }
      return;
    }
    commit(placeFurniture(state, selected, x, y));
    setMessage(`${furnitureCatalog[selected].label} installé.`);
    setSelected(null);
  }

  function selectPet(petId: PetId) {
    commit(adoptPet(state, petId));
    setMessage(`${petCatalog[petId].label} a rejoint la Maison.`);
  }

  function care() {
    const result = careForPet(state, state.pet.active);
    commit(result.state);
    setMessage(result.accepted ? `${activePet.label} se rapproche de toi.` : `Tu as déjà pris soin de ${activePet.label.toLowerCase()} aujourd’hui.`);
  }

  if (!open) return null;

  return (
    <div className="sanctuary-overlay" role="dialog" aria-modal="true" aria-label="Aménager la Maison">
      <section className={`sanctuary-shell theme-${state.theme}`} style={{ ["--home-warmth" as string]: ecosystem.homeWarmth / 100, ["--animal-trust" as string]: ecosystem.animalTrust / 100 }}>
        <header className="sanctuary-header">
          <div><span className="kicker">Ta Maison</span><h2>Un refuge qui te ressemble</h2><p>Chaque objet et chaque compagnon restent ici entre tes visites.</p><small className="ecosystem-indicator">Chaleur du foyer {ecosystem.homeWarmth}% · confiance animale {ecosystem.animalTrust}%</small></div>
          <button onClick={onClose} aria-label="Fermer">×</button>
        </header>

        <div className="sanctuary-tabs">
          <button className={tab === "decorate" ? "active" : ""} onClick={() => setTab("decorate")}>Aménager</button>
          <button className={tab === "companions" ? "active" : ""} onClick={() => setTab("companions")}>Compagnons</button>
        </div>

        {tab === "decorate" ? (
          <div className="sanctuary-layout">
            <aside className="sanctuary-catalog">
              <h3>Ambiance</h3>
              <div className="theme-picker">{themes.map((theme) => <button key={theme.id} className={state.theme === theme.id ? "active" : ""} onClick={() => chooseTheme(theme.id)}><i/><span><strong>{theme.label}</strong><small>{theme.note}</small></span></button>)}</div>
              <h3>Objets</h3>
              <div className="furniture-picker">{state.inventory.map((id) => <button key={id} className={selected === id ? "active" : ""} onClick={() => { setSelected(id); setMessage(`Touche un emplacement pour placer ${furnitureCatalog[id].label.toLowerCase()}.`); }}><FurnitureModel id={id}/><strong>{furnitureCatalog[id].label}</strong></button>)}</div>
            </aside>

            <main className="sanctuary-room-wrap">
              <div className="sanctuary-room">
                <div className="room-ceiling-beam beam-one"/><div className="room-ceiling-beam beam-two"/>
                <div className="room-wall-texture"/><div className="room-floor"/><div className="room-rug-shadow"/>
                <div className="sanctuary-window"><span/><i/><b/></div>
                <div className="window-light"/>
                <div className="sanctuary-fire"><span className="fireplace-stone"/><i/><i/><i/><b className="ember e1"/><b className="ember e2"/><b className="ember e3"/></div>
                <div className="fire-glow"/>
                <div className="room-dust">{Array.from({ length: 18 }).map((_, i) => <i key={i} style={{ ["--dust" as string]: i }}/>)}</div>
                <div className="sanctuary-grid">
                  {Array.from({ length: 24 }).map((_, index) => {
                    const x = index % 6;
                    const y = Math.floor(index / 6);
                    const item = placedByCell.get(`${x}-${y}`);
                    return <button key={index} className={item ? "occupied" : ""} onClick={() => place(x, y)} aria-label={item ? furnitureCatalog[item.furnitureId].label : "Emplacement libre"}>{item && <FurnitureModel id={item.furnitureId}/>}</button>;
                  })}
                </div>
                <div className="sanctuary-pet-in-room" style={{ ["--bond" as string]: activeBond / 100 }}><PetModel id={state.pet.active}/><small>{activePet.label}</small></div>
              </div>
              <p className="sanctuary-message">{message}</p>
            </main>
          </div>
        ) : (
          <div className="pet-sanctuary">
            <section className="active-pet-card">
              <div className="pet-glow"><PetModel id={state.pet.active} large/></div>
              <div><span className="kicker">Compagnon actuel</span><h3>{activePet.label}</h3><p>{activePet.temperament}. {petStage}.</p><div className="pet-bond"><div><span>Lien</span><strong>{activeBond}%</strong></div><i><b style={{ width: `${activeBond}%` }}/></i></div><button className="primary" onClick={care}>Prendre soin aujourd’hui</button></div>
            </section>
            <section className="pet-choices"><h3>Les visiteurs de la Maison</h3><div>{(Object.keys(petCatalog) as PetId[]).map((id) => { const adopted = state.pet.adopted.includes(id); return <button key={id} className={state.pet.active === id ? "active" : ""} onClick={() => selectPet(id)}><PetModel id={id}/><strong>{petCatalog[id].label}</strong><small>{adopted ? `Lien ${state.pet.bond[id] ?? 0}%` : "Inviter"}</small></button>; })}</div></section>
            <p className="sanctuary-message">{message}</p>
          </div>
        )}
      </section>
    </div>
  );
}
