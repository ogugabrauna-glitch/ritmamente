import type { GameMode, Operation } from "./types";

export interface LevelConfig {
  level: number;
  op: Operation;
  bpm: number;
  isBoss: boolean;
  scene: SceneKey;
  rounds: number;
  title: string;
}

export type SceneKey =
  | "forest" | "temple" | "city" | "mountain"
  | "kingdom" | "universe" | "galaxy" | "legend"
  | "candy";

export const SCENES: Record<SceneKey, { name: string; from: string; to: string; particle: string }> = {
  forest:   { name: "Floresta Matemática",   from: "#0f2e1a", to: "#04140a", particle: "#7ee08a" },
  temple:   { name: "Templo dos Números",    from: "#2a1f0a", to: "#0c0904", particle: "#e8c46a" },
  city:     { name: "Cidade dos Robôs",      from: "#0c1a2e", to: "#040814", particle: "#6ec8ff" },
  mountain: { name: "Montanha do Ritmo",     from: "#1a0f2e", to: "#080414", particle: "#c08aff" },
  kingdom:  { name: "Reino da Multiplicação",from: "#2e0f1a", to: "#140408", particle: "#ff8aa8" },
  universe: { name: "Universo dos Cálculos", from: "#0a0a2e", to: "#040414", particle: "#8aa8ff" },
  galaxy:   { name: "Galáxia Ritmamente",    from: "#2e2a0a", to: "#141204", particle: "#ffe88a" },
  legend:   { name: "Mundos Lendários",      from: "#1a1a1a", to: "#000000", particle: "#ffd700" },
  candy:    { name: "Mundo Doce",            from: "#3a1640", to: "#1a0824", particle: "#ffb6e0" },
};

const BPM_STEPS = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120];

export function bpmFor(mode: GameMode, level: number) {
  const stride =
    mode === "kids" ? 6 :
    mode === "tabuada" ? 5 :
    mode === "student" ? 4 : 3;
  const idx = Math.min(BPM_STEPS.length - 1, Math.floor((level - 1) / stride));
  return BPM_STEPS[idx];
}

function sceneFor(mode: GameMode, level: number): SceneKey {
  if (mode === "kids") {
    if (level <= 10) return "candy";
    if (level <= 20) return "forest";
    if (level <= 30) return "kingdom";
    return "galaxy";
  }
  if (mode === "tabuada") {
    if (level <= 10) return "temple";
    if (level <= 20) return "kingdom";
    return "galaxy";
  }
  if (mode === "student") {
    if (level <= 10) return "forest";
    if (level <= 20) return "temple";
    if (level <= 35) return "city";
    if (level <= 50) return "mountain";
    return "universe";
  }
  // adult
  if (level <= 10) return "city";
  if (level <= 25) return "mountain";
  if (level <= 45) return "universe";
  if (level <= 70) return "galaxy";
  return "legend";
}

function opForKids(level: number): Operation {
  if (level <= 8) return "add";
  if (level <= 16) return "sub";
  if (level <= 24) return "tab";
  if (level <= 32) return "div";
  return "mix";
}
function opForStudent(level: number): Operation {
  if (level <= 6) return "add";
  if (level <= 12) return "sub";
  if (level <= 18) return "mul";
  if (level <= 24) return "div";
  if (level <= 30) return "tab";
  if (level <= 60) return "mix";
  return "master";
}
function opForAdult(level: number): Operation {
  if (level <= 5) return "add";
  if (level <= 10) return "sub";
  if (level <= 15) return "mul";
  if (level <= 20) return "div";
  if (level <= 40) return "mix";
  return "master";
}

function opFor(mode: GameMode, level: number): Operation {
  if (mode === "tabuada") return "tab";
  if (mode === "kids") return opForKids(level);
  if (mode === "student") return opForStudent(level);
  return opForAdult(level);
}

export function toleranceMs(mode: GameMode, level: number): number {
  if (mode === "kids") {
    if (level <= 10) return 500;
    if (level <= 20) return 400;
    if (level <= 40) return 300;
    return 250;
  }
  if (mode === "tabuada") {
    if (level <= 10) return 450;
    if (level <= 25) return 350;
    if (level <= 50) return 250;
    return 200;
  }
  if (mode === "student") {
    if (level <= 20) return 400;
    if (level <= 40) return 300;
    if (level <= 60) return 200;
    return 150;
  }
  // adult
  if (level <= 20) return 350;
  if (level <= 40) return 250;
  if (level <= 60) return 150;
  return 100;
}

/** Corrects needed to advance to the next level. */
export function correctsToAdvance(level: number, mode: GameMode = "student"): number {
  // Tabuada: 1 nível = 1 tabuada completa (10 contas).
  if (mode === "tabuada") return 10;
  if (level <= 10) return 15;
  if (level <= 50) return 20;
  return 25;
}

/** BPM mapping for the sequential tabuada mode (1..10 → 50..100 BPM). */
export function tabuadaBpm(tabuadaIndex: number): number {
  const table = Math.min(10, Math.max(1, Math.floor(tabuadaIndex / 10) + 1));
  const map: Record<number, number> = { 1:50, 2:55, 3:60, 4:65, 5:70, 6:75, 7:80, 8:85, 9:90, 10:100 };
  return map[table];
}

export function getLevel(mode: GameMode, level: number): LevelConfig {
  const isBoss = (level % 5 === 0);
  return {
    level,
    op: opFor(mode, level),
    bpm: bpmFor(mode, level),
    isBoss,
    scene: sceneFor(mode, level),
    rounds: correctsToAdvance(level, mode),
    title: isBoss ? `Chefe — Nível ${level}` : `Nível ${level}`,
  };
}

export function isCheckpoint(level: number) { return level % 5 === 0; }

export const MODE_META: Record<GameMode, { name: string; emoji: string; sub: string; tagline: string; ageHint: string }> = {
  kids:     { name: "Modo Kids",          emoji: "🧸", sub: "Lúdico & divertido",    tagline: "Para crianças até 10 anos",       ageHint: "Soma, subtração, divisão exata e tabuada fácil" },
  student:  { name: "Modo Estudante",     emoji: "🎓", sub: "Educativo & progressivo", tagline: "Adolescentes e estudantes",     ageHint: "Todas as operações com progressão" },
  adult:    { name: "Modo Adulto",        emoji: "🧠", sub: "Desafio avançado",       tagline: "Mestre infinito + expressões",   ageHint: "Operações combinadas e mestre infinito" },
  tabuada:  { name: "Tabuada 1 a 10",     emoji: "✖️", sub: "Treine em ordem",         tagline: "Sequencial: 1×1 até 10×10",       ageHint: "Aprenda na ordem certa, passo a passo" },
  tabmestre:{ name: "Tabuada Mestre",     emoji: "👑", sub: "Tabuada aleatória",      tagline: "Domine toda a tabuada misturada", ageHint: "Liberado após concluir 1×1 até 10×10" },
};

