import { motion } from "framer-motion";
import { MODE_META } from "@/lib/game/levels";
import { useGame } from "@/lib/game/store";
import { useT } from "@/lib/i18n";
import type { GameMode } from "@/lib/game/types";
import logo from "@/assets/logo.png";

interface Props { onBack: () => void; onPick: (mode: GameMode) => void; }

const ORDER: GameMode[] = ["kids", "student", "adult", "tabuada", "tabmestre"];

const ACCENT: Record<GameMode, string> = {
  kids: "from-pink-400 via-yellow-300 to-emerald-300",
  student: "from-sky-400 via-indigo-400 to-fuchsia-400",
  adult: "from-amber-500 via-orange-500 to-red-500",
  tabuada: "from-emerald-400 via-teal-400 to-cyan-400",
  tabmestre: "from-yellow-400 via-amber-500 to-orange-600",
};

export function ModeSelect({ onBack, onPick }: Props) {
  const setMode = useGame(s => s.setMode);
  const tabuadaIndex = useGame(s => s.stats.tabuadaIndex);
  const masterUnlocked = useGame(s => s.stats.tabuadaMasterUnlocked) || tabuadaIndex >= 100;
  const t = useT();

  return (
    <div className="relative mx-auto flex min-h-[100svh] max-w-md flex-col gap-4 p-5">
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="rounded-full glass px-3 py-1.5 text-sm">← {t("menu")}</button>
        <img src={logo} alt="" className="h-10 w-10 rounded-xl shadow-gold" />
      </header>
      <h1 className="font-display text-2xl font-black shimmer-text">{t("chooseMode")}</h1>
      <p className="-mt-2 text-sm text-muted-foreground">Cada modo tem dificuldade, BPM e tolerância próprios.</p>

      <div className="mt-2 grid gap-3">
        {ORDER.map((m, i) => {
          const meta = MODE_META[m];
          const locked = m === "tabmestre" && !masterUnlocked;
          return (
            <motion.button
              key={m}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: locked ? 1 : 0.97 }}
              onClick={() => { if (locked) return; setMode(m); onPick(m); }}
              className={"relative overflow-hidden rounded-3xl gold-border bg-card/40 p-5 text-left " + (locked ? "opacity-60" : "")}
            >
              <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${ACCENT[m]}`} />
              <div className="relative flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-grad text-4xl shadow-gold">
                  {meta.emoji}
                </div>
                <div className="flex-1">
                  <div className="font-display text-lg font-black text-gold">{meta.name}</div>
                  <div className="text-sm font-semibold">{meta.tagline}</div>
                  <div className="text-xs text-muted-foreground">{meta.ageHint}</div>
                  {m === "tabuada" && (
                    <div className="mt-1 text-[10px] text-gold">Progresso: {tabuadaIndex}/100</div>
                  )}
                  {locked && (
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--warn)]">
                      🔒 Conclua 1×1 até 10×10 para desbloquear
                    </div>
                  )}
                </div>
                <div className="text-gold text-2xl">{locked ? "🔒" : "→"}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
