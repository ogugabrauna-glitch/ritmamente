import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/lib/game/store";
import { useT, useI18n } from "@/lib/i18n";
import { SuperRitmoMascot, superRitmoTier } from "./SuperRitmoMascot";
import { forro } from "@/lib/audio/forro";


/**
 * SUPER RITMO — O Guardião Oficial do Tempo
 * Mascote principal que aparece flutuando, com dicas e celebrações.
 */
const TIPS_PT = [
  "Olá! Eu sou o Super Ritmo! 🎵 Vou te ensinar tudo!",
  "Responda exatamente no tempo 4 do metrônomo para acertar.",
  "Acerte sem errar para encher a BARRA DE EXPLOSÃO ⚡",
  "No MODO EXPLOSÃO você não perde vidas e ganha XP em dobro!",
  "Combos de 5, 10, 20 e 50 dão poderes novos. Use-os com sabedoria!",
  "Cada 5 níveis é um chefe — derrote para ganhar créditos 🪙",
  "No Modo Tabuada você aprende em ordem: 1x1, 1x2... até 10x10.",
  "Suba de nível e ganhe títulos especiais. Você pode virar Rei! 👑",
  "Visite a comunidade para ver o ranking mundial 🏆",
];
const TIPS_EN = [
  "Hi! I'm Super Ritmo! 🎵 I'll teach you everything!",
  "Answer exactly on beat 4 of the metronome to score.",
  "Hit a streak to fill the EXPLOSION BAR ⚡",
  "In EXPLOSION MODE you don't lose lives and earn double XP!",
  "Combos of 5, 10, 20 and 50 grant new powers. Use them wisely!",
  "Every 5 levels there is a boss — beat it for credits 🪙",
  "In Tabuada mode you learn in order: 1x1, 1x2... up to 10x10.",
  "Level up and earn special titles. You can become King! 👑",
  "Visit the community to see the world ranking 🏆",
];
const TIPS_ES = [
  "¡Hola! ¡Soy Super Ritmo! 🎵 ¡Te enseñaré todo!",
  "Responde exactamente en el tiempo 4 del metrónomo.",
  "Acierta en racha para llenar la BARRA DE EXPLOSIÓN ⚡",
  "En MODO EXPLOSIÓN no pierdes vidas y ganas XP doble!",
  "Combos de 5, 10, 20 y 50 dan poderes nuevos. ¡Úsalos!",
  "Cada 5 niveles hay un jefe — derrótalo por créditos 🪙",
  "En Tabuada aprendes en orden: 1x1, 1x2... hasta 10x10.",
  "Sube de nivel y gana títulos. ¡Puedes ser Rey! 👑",
  "Visita la comunidad para ver el ranking mundial 🏆",
];



export function SuperRitmo({ floating = true, level = 1, mood = "idle" as "idle" | "happy" | "wave" | "dance" | "celebrate" }: { floating?: boolean; level?: number; mood?: "idle" | "happy" | "wave" | "dance" | "celebrate" }) {
  const showSuperRitmo = useGame((s) => s.settings.showSuperRitmo);
  const toggle = useGame((s) => s.toggleSuperRitmo);
  const lang = useI18n((s) => s.lang);
  const t = useT();
  const [open, setOpen] = useState(true);
  const [idx, setIdx] = useState(0);

  const tips = lang === "en" ? TIPS_EN : lang === "es" ? TIPS_ES : TIPS_PT;
  const tier = superRitmoTier(level);

  if (!showSuperRitmo) {
    return (
      <button
        type="button"
        onClick={toggle}
        className="fixed bottom-20 right-4 z-30 rounded-full glass px-3 py-1.5 text-xs"
        aria-label={t("showHelper")}
      >
        🥁 {t("showHelper")}
      </button>
    );
  }

  const wrapper = floating
    ? "fixed bottom-20 right-3 z-30 flex items-end gap-2 max-w-[280px]"
    : "relative flex items-end gap-2";

  return (
    <div className={wrapper}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: 10, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.9 }}
            className="relative rounded-2xl gold-border bg-card/90 p-3 text-xs shadow-gold backdrop-blur"
            style={{ maxWidth: 220 }}
          >
            <div className="font-display text-[11px] font-black text-gold">SUPER RITMO {tier.accent}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{tier.name}</div>
            <div className="mt-1 leading-snug">{tips[idx]}</div>
            <div className="mt-2 flex items-center justify-between gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => { setIdx((i) => (i + 1) % tips.length); forro.duck(0.5, 2200); }}
                className="rounded-full bg-gold-grad px-2 py-1 font-bold text-primary-foreground"
              >
                Próx →
              </button>
              <button
                type="button"
                onClick={toggle}
                className="text-muted-foreground underline"
              >
                {t("hideHelper")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.9 }}
        className="relative flex items-end justify-center"
        aria-label={`Super Ritmo - ${tier.name}`}
      >
        <SuperRitmoMascot size={64} mood={mood} level={level} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-card text-[10px] gold-border">!</span>
      </motion.button>
    </div>
  );
}
