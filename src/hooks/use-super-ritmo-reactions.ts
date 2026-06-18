/**
 * Hook para gerenciar reações do Super Ritmo durante o gameplay
 * Controla síntese de voz, animações e feedback
 */

import { useCallback } from "react";
import { useSpeechSynthesis } from "./use-speech-synthesis";
import { getSuperRitmoScript, type ScriptContext } from "@/lib/super-ritmo-scripts";
import { useI18n } from "@/lib/i18n";

export function useSuperRitmoReactions() {
  const { speak, isPlaying } = useSpeechSynthesis();
  const { lang } = useI18n();

  // Reproduzir uma reação específica
  const react = useCallback(
    async (context: ScriptContext) => {
      const script = getSuperRitmoScript(context, lang as "pt" | "en" | "es");
      await speak(script, {
        rate: 0.95,
        pitch: 1.1,
        volume: 0.8,
      });
    },
    [speak, lang],
  );

  // Reações de acertos
  const reactCorrect = useCallback(() => react("correct"), [react]);

  // Reações de combos
  const reactCombo5 = useCallback(() => react("combo5"), [react]);
  const reactCombo10 = useCallback(() => react("combo10"), [react]);
  const reactCombo20 = useCallback(() => react("combo20"), [react]);
  const reactCombo50 = useCallback(() => react("combo50"), [react]);

  // Reação de subir de nível
  const reactLevelUp = useCallback(() => react("levelUp"), [react]);

  // Reação de erro
  const reactWrong = useCallback(() => react("wrong"), [react]);

  // Reação de usar poder
  const reactPower = useCallback(() => react("power"), [react]);

  // Reação de checkpoint/boss
  const reactCheckpoint = useCallback(() => react("checkpoint"), [react]);

  // Reação de novo título
  const reactMasterTitle = useCallback(() => react("masterTitle"), [react]);

  return {
    // Métodos individuais
    reactCorrect,
    reactCombo5,
    reactCombo10,
    reactCombo20,
    reactCombo50,
    reactLevelUp,
    reactWrong,
    reactPower,
    reactCheckpoint,
    reactMasterTitle,
    // Método genérico
    react,
    // Estado
    isPlaying,
  };
}
