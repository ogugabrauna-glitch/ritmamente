import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameMode, Profile, Stats } from "./types";

interface GameState {
  profile: Profile | null;
  mode: GameMode;
  stats: Stats;
  settings: { sound: boolean; vibrate: boolean; music: boolean; musicVolume: number; showRitmizinho: boolean; tutorialSeen: boolean; cinematicSeen: boolean; langPicked: boolean };
  setProfile: (p: Profile) => void;
  setMode: (m: GameMode) => void;
  updateStats: (patch: Partial<Stats>) => void;
  addCorrect: () => void;
  addWrong: () => void;
  resetCombo: () => void;
  loseHeart: () => void;
  useCredit: () => boolean;
  earnCredit: (n?: number) => void;
  earnXP: (n: number) => void;
  levelUp: () => void;
  setCheckpoint: (level: number) => void;
  resetRun: () => void;
  unlockAchievement: (id: string) => boolean;
  toggleSound: () => void;
  toggleVibrate: () => void;
  setMusicVolume: (v: number) => void;
  toggleRitmizinho: () => void;
  setTutorialSeen: (v: boolean) => void;
  setCinematicSeen: (v: boolean) => void;
  setLangPicked: (v: boolean) => void;
  advanceTabuada: () => void;
  unlockTabMestre: () => void;
  addExplodeCharge: (n: number) => void;
  resetExplodeCharge: () => void;
}

export const MAX_HEARTS = 10;
export const MAX_CREDITS = 10;

const defaultStats: Stats = {
  level: 1,
  xp: 0,
  hearts: MAX_HEARTS,
  credits: MAX_CREDITS,
  combo: 0,
  bestCombo: 0,
  totalCorrect: 0,
  totalAttempts: 0,
  bestLevel: 1,
  bossesBeaten: 0,
  bpmMax: 50,
  timePlayedMs: 0,
  lastCheckpoint: 1,
  achievements: [],
  tabuadaIndex: 0,
  tabuadaMasterUnlocked: false,
  explodeCharge: 0,
};

const defaultSettings = { sound: true, vibrate: true, music: true, musicVolume: 11, showRitmizinho: true, tutorialSeen: false, cinematicSeen: false, langPicked: false };

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      profile: null,
      mode: "student",
      stats: defaultStats,
      settings: defaultSettings,
      setProfile: (p) => set({ profile: p }),
      setMode: (m) => set({
        mode: m,
        stats: { ...get().stats, level: 1, hearts: MAX_HEARTS, credits: Math.max(get().stats.credits, MAX_CREDITS), combo: 0, lastCheckpoint: 1, explodeCharge: 0 },
      }),
      updateStats: (patch) => set({ stats: { ...get().stats, ...patch } }),
      addCorrect: () => {
        const s = get().stats;
        const combo = s.combo + 1;
        set({
          stats: {
            ...s,
            combo,
            bestCombo: Math.max(s.bestCombo, combo),
            totalCorrect: s.totalCorrect + 1,
            totalAttempts: s.totalAttempts + 1,
          },
        });
      },
      addWrong: () => {
        const s = get().stats;
        set({ stats: { ...s, combo: 0, totalAttempts: s.totalAttempts + 1 } });
      },
      resetCombo: () => set({ stats: { ...get().stats, combo: 0 } }),
      loseHeart: () => {
        const s = get().stats;
        set({ stats: { ...s, hearts: Math.max(0, s.hearts - 1) } });
      },
      useCredit: () => {
        const s = get().stats;
        if (s.credits <= 0) return false;
        set({ stats: { ...s, credits: s.credits - 1, hearts: MAX_HEARTS, level: s.lastCheckpoint } });
        return true;
      },
      earnCredit: (n = 1) => {
        const s = get().stats;
        set({ stats: { ...s, credits: Math.min(MAX_CREDITS, s.credits + n) } });
      },
      earnXP: (n) => {
        const s = get().stats;
        set({ stats: { ...s, xp: s.xp + n } });
      },
      levelUp: () => {
        const s = get().stats;
        const next = s.level + 1;
        set({
          stats: {
            ...s,
            level: next,
            bestLevel: Math.max(s.bestLevel, next),
            hearts: MAX_HEARTS,
          },
        });
      },
      setCheckpoint: (level) => set({ stats: { ...get().stats, lastCheckpoint: level } }),
      resetRun: () => {
        const s = get().stats;
        set({ stats: { ...s, hearts: MAX_HEARTS, combo: 0, level: s.lastCheckpoint, explodeCharge: 0 } });
      },
      unlockAchievement: (id) => {
        const s = get().stats;
        if (s.achievements.includes(id)) return false;
        set({ stats: { ...s, achievements: [...s.achievements, id] } });
        return true;
      },
      toggleSound: () => set({ settings: { ...get().settings, sound: !get().settings.sound } }),
      toggleVibrate: () => set({ settings: { ...get().settings, vibrate: !get().settings.vibrate } }),
      setMusicVolume: (v) => set({ settings: { ...get().settings, musicVolume: Math.max(0, Math.min(100, Math.round(v))) } }),
      toggleRitmizinho: () => set({ settings: { ...get().settings, showRitmizinho: !get().settings.showRitmizinho } }),
      setTutorialSeen: (v) => set({ settings: { ...get().settings, tutorialSeen: v } }),
      setCinematicSeen: (v) => set({ settings: { ...get().settings, cinematicSeen: v } }),
      setLangPicked: (v) => set({ settings: { ...get().settings, langPicked: v } }),
      advanceTabuada: () => {
        const s = get().stats;
        const next = Math.min(100, s.tabuadaIndex + 1);
        set({ stats: { ...s, tabuadaIndex: next, tabuadaMasterUnlocked: s.tabuadaMasterUnlocked || next >= 100 } });
      },
      unlockTabMestre: () => set({ stats: { ...get().stats, tabuadaMasterUnlocked: true } }),
      addExplodeCharge: (n) => {
        const s = get().stats;
        set({ stats: { ...s, explodeCharge: Math.max(0, Math.min(100, s.explodeCharge + n)) } });
      },
      resetExplodeCharge: () => set({ stats: { ...get().stats, explodeCharge: 0 } }),
    }),
    {
      name: "ritmamente-math",
      version: 2,
      migrate: (persisted: any) => {
        if (!persisted) return persisted;
        persisted.stats = { ...defaultStats, ...(persisted.stats || {}) };
        persisted.settings = { ...defaultSettings, ...(persisted.settings || {}) };
        return persisted;
      },
      merge: (persisted: any, current) => {
        if (!persisted) return current;
        return {
          ...current,
          ...persisted,
          stats: { ...defaultStats, ...(persisted.stats || {}) },
          settings: { ...defaultSettings, ...(persisted.settings || {}) },
        };
      },
    },
  ),
);

export const AVATARS = [
  { id: "lion", emoji: "🦁", name: "Leão" },
  { id: "wolf", emoji: "🐺", name: "Lobo" },
  { id: "panda", emoji: "🐼", name: "Panda" },
  { id: "owl", emoji: "🦉", name: "Coruja" },
  { id: "dragon", emoji: "🐲", name: "Dragão" },
  { id: "fox", emoji: "🦊", name: "Raposa" },
  { id: "tiger", emoji: "🐯", name: "Tigre" },
  { id: "eagle", emoji: "🦅", name: "Águia" },
  { id: "robot", emoji: "🤖", name: "Robô" },
  { id: "knight", emoji: "🛡️", name: "Cavaleiro" },
  { id: "wizard", emoji: "🧙", name: "Mago" },
  { id: "crown", emoji: "👑", name: "Mestre da Tabuada" },
];

export const PETS = [
  { id: "lion", emoji: "🦁", name: "Leãozinho" },
  { id: "panda", emoji: "🐼", name: "Pandinha" },
  { id: "dragon", emoji: "🐉", name: "Dragãozinho" },
  { id: "owl", emoji: "🦉", name: "Corujinha" },
  { id: "wolf", emoji: "🐺", name: "Lobinho" },
  { id: "robot", emoji: "🤖", name: "Robozinho" },
];

export function xpForLevel(level: number) { return 50 + level * 25; }
