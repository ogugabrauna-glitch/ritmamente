import type { Lang } from "@/lib/i18n";

export interface TitleDef {
  level: number;
  pt: string;
  en: string;
  es: string;
  emoji: string;
}

export const TITLES: TitleDef[] = [
  { level: 1,   emoji: "🌱", pt: "Aprendiz do Ritmo",           en: "Rhythm Apprentice",         es: "Aprendiz del Ritmo" },
  { level: 5,   emoji: "🛡️", pt: "Guardião da Soma",             en: "Guardian of Sums",          es: "Guardián de la Suma" },
  { level: 10,  emoji: "⚔️", pt: "Cavaleiro da Tabuada",          en: "Knight of Tables",          es: "Caballero de las Tablas" },
  { level: 20,  emoji: "🧙", pt: "Mestre dos Números",            en: "Master of Numbers",         es: "Maestro de los Números" },
  { level: 30,  emoji: "⏳", pt: "Senhor do Tempo",               en: "Lord of Time",              es: "Señor del Tiempo" },
  { level: 40,  emoji: "🎯", pt: "Comandante da Precisão",        en: "Precision Commander",       es: "Comandante de la Precisión" },
  { level: 50,  emoji: "👑", pt: "Rei da Matemática Rítmica",     en: "King of Rhythmic Math",     es: "Rey de la Matemática Rítmica" },
  { level: 75,  emoji: "🌟", pt: "Lenda do Ritmamente",           en: "Ritmamente Legend",         es: "Leyenda de Ritmamente" },
  { level: 100, emoji: "👑", pt: "Mestre do Tempo",                  en: "Master of Time",            es: "Maestro del Tiempo" },
];

export function getTitleAt(level: number, lang: Lang = "pt"): { name: string; emoji: string; level: number } {
  let best = TITLES[0];
  for (const t of TITLES) if (level >= t.level) best = t;
  return { name: best[lang], emoji: best.emoji, level: best.level };
}

export function getNewTitleBetween(prev: number, next: number, lang: Lang = "pt"): { name: string; emoji: string; level: number } | null {
  for (const t of TITLES) {
    if (t.level > prev && t.level <= next) return { name: t[lang], emoji: t.emoji, level: t.level };
  }
  return null;
}
