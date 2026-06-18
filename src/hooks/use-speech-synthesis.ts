/**
 * Hook para sintetizar voz do Super Ritmo
 * Usa Web Speech API (disponível em navegadores modernos)
 * Suporta PT, EN, ES com qualidade de voz natural
 */

import { useCallback, useRef } from "react";
import { useI18n } from "@/lib/i18n";

export interface SpeechOptions {
  rate?: number; // 0.5 - 2 (padrão: 1)
  pitch?: number; // 0 - 2 (padrão: 1)
  volume?: number; // 0 - 1 (padrão: 1)
}

export function useSpeechSynthesis() {
  const { lang } = useI18n();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPlayingRef = useRef(false);

  // Mapear idioma para locale da síntese
  const getVoiceLocale = useCallback(() => {
    switch (lang) {
      case "pt":
        return "pt-BR";
      case "en":
        return "en-US";
      case "es":
        return "es-ES";
      default:
        return "pt-BR";
    }
  }, [lang]);

  // Sintetizar e reproduzir texto
  const speak = useCallback(
    (text: string, options: SpeechOptions = {}) => {
      // Cancelar fala anterior se estiver rodando
      if (isPlayingRef.current) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getVoiceLocale();
      utterance.rate = options.rate ?? 0.95; // um pouco mais lento para ser claro
      utterance.pitch = options.pitch ?? 1.1; // um pouco mais agudo para parecer jovem
      utterance.volume = options.volume ?? 0.9;

      utterance.onstart = () => {
        isPlayingRef.current = true;
      };

      utterance.onend = () => {
        isPlayingRef.current = false;
      };

      utterance.onerror = () => {
        isPlayingRef.current = false;
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);

      return new Promise<void>((resolve) => {
        utterance.onend = () => {
          isPlayingRef.current = false;
          resolve();
        };
        utterance.onerror = () => {
          isPlayingRef.current = false;
          resolve();
        };
      });
    },
    [getVoiceLocale],
  );

  // Parar fala
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    isPlayingRef.current = false;
  }, []);

  // Pausar fala
  const pause = useCallback(() => {
    if (isPlayingRef.current) {
      window.speechSynthesis.pause();
    }
  }, []);

  // Retomar fala
  const resume = useCallback(() => {
    if (isPlayingRef.current && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, []);

  const isPlaying = isPlayingRef.current;

  return { speak, stop, pause, resume, isPlaying };
}
