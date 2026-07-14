export type FurnitureId = "armchair" | "bookshelf" | "plant" | "lamp" | "piano" | "rug" | "desk" | "painting" | "cushions" | "tea";
export type HouseTheme = "ambre" | "foret" | "nuit" | "aube";
export type PetId = "fox" | "owl" | "cat" | "deer";

export type PlacedFurniture = {
  id: string;
  furnitureId: FurnitureId;
  x: number;
  y: number;
};

export type PetState = {
  adopted: PetId[];
  active: PetId;
  bond: Record<PetId, number>;
  lastCare: Partial<Record<PetId, string>>;
};

export type SanctuaryState = {
  theme: HouseTheme;
  placed: PlacedFurniture[];
  inventory: FurnitureId[];
  pet: PetState;
};

export const furnitureCatalog: Record<FurnitureId, { label: string; symbol: string; description: string }> = {
  armchair: { label: "Fauteuil", symbol: "◒", description: "Un lieu pour ralentir." },
  bookshelf: { label: "Bibliothèque", symbol: "▥", description: "Pour les livres et les traces." },
  plant: { label: "Grande plante", symbol: "♧", description: "Une présence vivante dans la pièce." },
  lamp: { label: "Lampe", symbol: "✦", description: "Une lumière douce pour le soir." },
  piano: { label: "Piano", symbol: "♬", description: "Pour accueillir les créations." },
  rug: { label: "Tapis", symbol: "▱", description: "Réchauffe le centre de la pièce." },
  desk: { label: "Bureau", symbol: "⌑", description: "Un espace pour écrire." },
  painting: { label: "Tableau", symbol: "◇", description: "Un souvenir accroché au mur." },
  cushions: { label: "Coussins", symbol: "◌", description: "Pour s’asseoir près du feu." },
  tea: { label: "Service à thé", symbol: "♨", description: "Un rituel calme et familier." }
};

export const petCatalog: Record<PetId, { label: string; symbol: string; temperament: string }> = {
  fox: { label: "Renard", symbol: "🦊", temperament: "Curieux et discret" },
  owl: { label: "Hibou", symbol: "🦉", temperament: "Calme et observateur" },
  cat: { label: "Chat", symbol: "🐈", temperament: "Doux et indépendant" },
  deer: { label: "Faon", symbol: "🦌", temperament: "Sensible et paisible" }
};

const KEY = "prisme.sanctuary.v1";

const defaultPlaced: PlacedFurniture[] = [
  { id: "f-rug", furnitureId: "rug", x: 2, y: 2 },
  { id: "f-chair", furnitureId: "armchair", x: 1, y: 2 },
  { id: "f-lamp", furnitureId: "lamp", x: 1, y: 1 },
  { id: "f-books", furnitureId: "bookshelf", x: 4, y: 1 },
  { id: "f-plant", furnitureId: "plant", x: 5, y: 2 }
];

export function defaultSanctuary(): SanctuaryState {
  return {
    theme: "ambre",
    placed: defaultPlaced,
    inventory: Object.keys(furnitureCatalog) as FurnitureId[],
    pet: {
      adopted: ["fox"],
      active: "fox",
      bond: { fox: 12, owl: 0, cat: 0, deer: 0 },
      lastCare: {}
    }
  };
}

export function loadSanctuary(): SanctuaryState {
  if (typeof window === "undefined") return defaultSanctuary();
  const raw = localStorage.getItem(KEY);
  if (!raw) return defaultSanctuary();
  try {
    const parsed = JSON.parse(raw) as SanctuaryState;
    return { ...defaultSanctuary(), ...parsed, pet: { ...defaultSanctuary().pet, ...parsed.pet } };
  } catch {
    return defaultSanctuary();
  }
}

export function saveSanctuary(state: SanctuaryState) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
}

export function placeFurniture(state: SanctuaryState, furnitureId: FurnitureId, x: number, y: number): SanctuaryState {
  const occupied = state.placed.find((item) => item.x === x && item.y === y);
  const withoutOccupied = occupied ? state.placed.filter((item) => item.id !== occupied.id) : state.placed;
  const existing = withoutOccupied.find((item) => item.furnitureId === furnitureId);
  const placed = existing
    ? withoutOccupied.map((item) => item.id === existing.id ? { ...item, x, y } : item)
    : [...withoutOccupied, { id: crypto.randomUUID(), furnitureId, x, y }];
  return { ...state, placed };
}

export function removeFurniture(state: SanctuaryState, id: string): SanctuaryState {
  return { ...state, placed: state.placed.filter((item) => item.id !== id) };
}

export function adoptPet(state: SanctuaryState, petId: PetId): SanctuaryState {
  const adopted = state.pet.adopted.includes(petId) ? state.pet.adopted : [...state.pet.adopted, petId];
  return { ...state, pet: { ...state.pet, adopted, active: petId } };
}

export function careForPet(state: SanctuaryState, petId: PetId): { state: SanctuaryState; accepted: boolean } {
  const today = new Date().toISOString().slice(0, 10);
  if (state.pet.lastCare[petId] === today) return { state, accepted: false };
  const bond = Math.min(100, (state.pet.bond[petId] ?? 0) + 8);
  return {
    accepted: true,
    state: {
      ...state,
      pet: {
        ...state.pet,
        bond: { ...state.pet.bond, [petId]: bond },
        lastCare: { ...state.pet.lastCare, [petId]: today }
      }
    }
  };
}
