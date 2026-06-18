export type Operation = "add" | "sub" | "mul" | "div" | "mix" | "master" | "tab";
export type GameMode = "kids" | "student" | "adult" | "tabuada" | "tabmestre";

export interface Profile {
  name: string;
  age: number;
  city: string;
  country: string;
  avatar: string;
  pet: string;
  createdAt: number;
}

export interface Stats {
  level: number;
  xp: number;
  hearts: number;
  credits: number;
  combo: number;
  bestCombo: number;
  totalCorrect: number;
  totalAttempts: number;
  bestLevel: number;
  bossesBeaten: number;
  bpmMax: number;
  timePlayedMs: number;
  lastCheckpoint: number;
  achievements: string[];
  // new
  tabuadaIndex: number;          // 0..99 sequential progress through 1x1..10x10
  tabuadaMasterUnlocked: boolean;
  explodeCharge: number;         // 0..100
}

export interface ProblemSpec {
  text: string;
  answer: number;
  options: number[];
}
