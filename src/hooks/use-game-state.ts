import { useGame } from "@/lib/game/store";

/**
 * Hook para acessar o estado do jogo
 * Simplifica o uso direto do Zustand store
 */
export function useGameState() {
  return useGame();
}

/**
 * Hook para acessar perfil e modo de jogo
 */
export function useGameProfile() {
  return useGame((s) => ({
    profile: s.profile,
    setProfile: s.setProfile,
    mode: s.mode,
    setMode: s.setMode,
  }));
}

/**
 * Hook para acessar estatísticas
 */
export function useGameStats() {
  return useGame((s) => ({
    stats: s.stats,
    updateStats: s.updateStats,
    addCorrect: s.addCorrect,
    addWrong: s.addWrong,
    earnXP: s.earnXP,
    levelUp: s.levelUp,
    unlockAchievement: s.unlockAchievement,
  }));
}

/**
 * Hook para acessar configurações
 */
export function useGameSettings() {
  return useGame((s) => ({
    settings: s.settings,
    updateSettings: s.updateSettings,
    toggleSound: s.toggleSound,
    toggleVibrate: s.toggleVibrate,
    toggleMusic: s.toggleMusic,
    setMusicVolume: s.setMusicVolume,
  }));
}
