export interface Position {
  x: number;
  y: number;
}

export interface HighscoreEntry {
  name: string;
  score: number;
  date: string;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';