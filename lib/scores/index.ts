export interface Score {
  player: string;
  round: number;
  score: number;
}

export interface PlayerScore {
  uuid: string;
  name: string;
  averageScore: number;
  scores: { [round: number]: number };
}
