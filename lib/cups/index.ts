export type StaticCup = {
  name: string;
  cup: string;
};

export type Cup = StaticCup & {
  round: number | null;
};

export const cups: StaticCup[] = [
  { name: "Mushroom Cup", cup: "mushroom" },
  { name: "Flower Cup", cup: "flower" },
  { name: "Star Cup", cup: "star" },
  { name: "Special Cup", cup: "special" },
  { name: "Egg Cup", cup: "egg" },
  { name: "Crossing Cup", cup: "crossing" },
  { name: "Shell Cup", cup: "shell" },
  { name: "Banana Cup", cup: "banana" },
  { name: "Leaf Cup", cup: "leaf" },
  { name: "Lightning Cup", cup: "lightning" },
  { name: "Triforce Cup", cup: "triforce" },
  { name: "Bell Cup", cup: "bell" },
  { name: "Golden Dash Cup", cup: "golden-dash" },
  { name: "Lucky Cat Cup", cup: "lucky-cat" },
  { name: "Turnip Cup", cup: "turnip" },
  { name: "Propeller Cup", cup: "propeller" },
  { name: "Rock Cup", cup: "rock" },
  { name: "Moon Cup", cup: "moon" },
  { name: "Fruit Cup", cup: "fruit" },
  { name: "Boomerang Cup", cup: "boomerang" },
  { name: "Feather Cup", cup: "feather" },
  { name: "Cherry Cup", cup: "cherry" },
  { name: "Acorn Cup", cup: "acorn" },
  { name: "Spiny Cup", cup: "spiny" },
];
