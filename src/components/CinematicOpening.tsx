import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SuperRitmoMascot } from "./SuperRitmoMascot";
import { useT, useI18n } from "@/lib/i18n";
import { forro } from "@/lib/audio/forro";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { getSuperRitmoScript } from "@/lib/super-ritmo-scripts";

/**
 * ABERTURA CINEMATOGRÁFICA OFICIAL
 * Tela escura → cortinas se abrindo → palco → Super Ritmo entra saltitando → boas-vindas.
 * Som: Metrônomo → voz sintetizada do Super Ritmo
 */
export function CinematicOpening({ onDone }: { onDone: () => void }) {
  const t = useT();
  const { lang } = useI18n();
  const { speak, stop } = useSpeechSynthesis();
  const [phase, setPhase] = useState<"dark" | "curtains" | "enter" | "talk">("dark");

  useEffect(() => {
    const timers = [
      setTimeout(() => { setPhase("curtains"); forro.duck(0.3, 5000); }, 400),
      setTimeout(() => setPhase("enter"), 1700),
      setTimeout(() => { setPhase("talk"); forro.duck(0.45, 4200); }, 3400),
    ];
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  // Quando entra na fase de fala, reproduzir voz do Super Ritmo
  useEffect(() => {
    if (phase === "talk") {
      const script = getSuperRitmoScript("opening", lang as "pt" | "en" | "es");
      // Aguardar um pouco antes de iniciar a fala (animação já está em progresso)
      const timer = setTimeout(() => {
        speak(script, { rate: 0.9, pitch: 1.15, volume: 0.85 });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, speak, lang]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black">
      {/* Palco / stage backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center 40%, #2a1a0a 0%, #120808 60%, #000 100%)",
        }}
      />
      {/* Stage floor */}
      <div className="absolute bottom-0 left-0 right-0 h-32" style={{
        background: "linear-gradient(180deg, #3a1f08 0%, #1a0a04 100%)",
      }} />
      {/* Spotlight */}
      <AnimatePresence>
        {phase !== "dark" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at center 65%, rgba(255,220,120,0.35) 0%, rgba(255,220,120,0) 35%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Twinkling stars */}
      {phase !== "dark" &&
        Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-yellow-200"
            style={{ top: `${Math.random() * 50}%`, left: `${Math.random() * 100}%` }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ repeat: Infinity, duration: 1.5 + Math.random() * 2, delay: Math.random() }}
          />
        ))}

      {/* CURTAINS */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: phase === "dark" ? 0 : "-100%" }}
        transition={{ duration: 1.4, ease: [0.6, 0, 0.4, 1] }}
        className="absolute top-0 bottom-0 left-0 w-1/2"
        style={{
          background:
            "repeating-linear-gradient(90deg, #6b0f1a 0px, #8a1322 24px, #4a0a13 48px), linear-gradient(180deg, #8a1322, #3a0710)",
          boxShadow: "inset -20px 0 40px rgba(0,0,0,0.6), 8px 0 24px rgba(0,0,0,0.6)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-6" style={{ background: "linear-gradient(90deg, #d4af37, #f5d76e, #d4af37)" }} />
      </motion.div>
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: phase === "dark" ? 0 : "100%" }}
        transition={{ duration: 1.4, ease: [0.6, 0, 0.4, 1] }}
        className="absolute top-0 bottom-0 right-0 w-1/2"
        style={{
          background:
            "repeating-linear-gradient(90deg, #6b0f1a 0px, #8a1322 24px, #4a0a13 48px), linear-gradient(180deg, #8a1322, #3a0710)",
          boxShadow: "inset 20px 0 40px rgba(0,0,0,0.6), -8px 0 24px rgba(0,0,0,0.6)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-6" style={{ background: "linear-gradient(90deg, #d4af37, #f5d76e, #d4af37)" }} />
      </motion.div>

      {/* TITLE */}
      <AnimatePresence>
        {(phase === "enter" || phase === "talk") && (
          <motion.div
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="absolute top-16 left-0 right-0 text-center px-4"
          >
            <h1
              className="font-display text-4xl md:text-5xl font-black tracking-wider"
              style={{
                background: "linear-gradient(180deg, #fff3b0, #d4af37, #8a5a1a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 4px 12px rgba(212,175,55,0.6))",
              }}
            >
              RITMAMENTE
            </h1>
            <div className="text-xs uppercase tracking-[0.4em] text-yellow-200/70 mt-1">Math</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUPER RITMO entering */}
      <AnimatePresence>
        {(phase === "enter" || phase === "talk") && (
          <motion.div
            initial={{ x: -300, y: 0 }}
            animate={{
              x: 0,
              y: [0, -30, 0, -20, 0, -10, 0],
            }}
            transition={{
              x: { duration: 1.2, ease: "easeOut" },
              y: { duration: 1.2, times: [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1] },
            }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2"
          >
            <SuperRitmoMascot size={180} mood={phase === "talk" ? "happy" : "dance"} level={1} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SPEECH BUBBLE */}
      <AnimatePresence>
        {phase === "talk" && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-lg"
          >
            <div className="rounded-3xl bg-gradient-to-b from-yellow-50 to-yellow-100 p-6 text-center shadow-2xl border-4 border-yellow-400">
              <div className="font-display text-2xl md:text-3xl font-black text-amber-950 leading-tight">
                {t("welcomeTitle")}
              </div>
              <div className="mt-3 text-base md:text-lg text-amber-950 font-semibold leading-snug">
                {t("welcomeMsg")}
              </div>
              <button
                onClick={() => {
                  stop();
                  onDone();
                }}
                className="mt-5 w-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 py-4 font-display text-lg font-black text-amber-950 shadow-lg active:scale-95 transition border-2 border-amber-700"
              >
                ▶ {t("letsGo")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip */}
      <button
        onClick={() => {
          stop();
          onDone();
        }}
        className="absolute top-4 right-4 z-10 rounded-full bg-white/15 backdrop-blur px-4 py-2 text-sm font-bold text-white hover:bg-white/25 border border-white/30"
      >
        Skip →
      </button>
    </div>
  );
}
