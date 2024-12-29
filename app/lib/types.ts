export type StaticCup = {
  name: string;
  cup: string;
  icon: string;
};

export type Cup = StaticCup & {
  round: number | null;
  created_at: string;
  updated_at: string;
};

export type Player = {
  uuid: string;
  name: string;
  team: number | null;
  score: number;
  created_at: string;
  updated_at: string;
};
