import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n";

interface Props {
  currentBeat: number;
  bpm: number;
  feedback: "ontime" | "early" | "late" | null;
  deltaMs: number | null;
  toleranceMs: number;
  accuracy: number | null;
  /** Show large beginner numbers on the visual (first 3 cycles for new players). */
  beginnerHelp?: boolean;
  /** 0..100 explosion charge. */
  explodeCharge?: number;
  /** Whether explosion mode is currently active. */
  explosionActive?: boolean;
  onActivateExplosion?: () => void;
}

export function MetronomeVisual({
  currentBeat, bpm, feedback, deltaMs, toleranceMs, accuracy,
  beginnerHelp = false, explodeCharge = 0, explosionActive = false, onActivateExplosion,
}: Props) {
  const t = useT();
  const beats = [1, 2, 3, 4];
  const canExplode = explodeCharge >= 100 && !explosionActive;

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center gap-3">
      <div className="relative h-44 w-44 sm:h-56 sm:w-56">
        <div className="absolute inset-0 rounded-full gold-border" />
        <div className="absolute inset-2 rounded-full glass" />
        <AnimatePresence>
          {currentBeat === 4 && (
            <motion.div
              key={Date.now()}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: "0 0 60px 20px var(--gold)" }}
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            key={currentBeat}
            initial={{ scale: 0.6, opacity: 0.4 }}
            animate={{ scale: currentBeat === 4 ? 1.4 : 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            className={
              "font-display text-7xl sm:text-8xl font-black " +
              (currentBeat === 4 ? "text-gold drop-shadow-[0_0_18px_var(--gold)]" : "text-foreground/70")
            }
          >
            {currentBeat || "·"}
          </motion.div>
        </div>
      </div>

      {/* Beginner helper: show 1 2 3 4 sync (only on first 3 cycles for new players) */}
      {beginnerHelp && (
        <div className="flex gap-3">
          {beats.map((b) => (
            <motion.div
              key={b}
              animate={{
                scale: b === currentBeat ? (b === 4 ? 1.5 : 1.2) : 0.9,
                opacity: b === currentBeat ? 1 : 0.35,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 14 }}
              className={
                "font-display text-2xl font-black " +
                (b === 4
                  ? b === currentBeat
                    ? "text-gold drop-shadow-[0_0_10px_var(--gold)]"
                    : "text-gold/60"
                  : "text-foreground")
              }
            >
              {b}
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {beats.map((b) => (
          <div
            key={b}
            className={
              "h-2 w-10 rounded-full transition-all " +
              (b === currentBeat
                ? b === 4
                  ? "bg-gold-grad shadow-gold"
                  : "bg-foreground/80"
                : "bg-foreground/15")
            }
          />
        ))}
      </div>

      {/* Explosion bar */}
      <div className="w-full max-w-xs">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>⚡ Explosão</span>
          <span className="text-gold font-bold">{Math.round(explodeCharge)}%</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-foreground/10">
          <motion.div
            animate={{ width: `${explodeCharge}%` }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className={
              "h-full " +
              (explosionActive
                ? "bg-[color:var(--success)]"
                : canExplode
                ? "bg-gold-grad shadow-gold"
                : "bg-gold-grad")
            }
          />
        </div>
        {canExplode && onActivateExplosion && (
          <motion.button
            onClick={onActivateExplosion}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [1, 1.04, 1], opacity: 1 }}
            transition={{ scale: { repeat: Infinity, duration: 1.2 } }}
            className="mt-2 w-full rounded-full bg-gold-grad py-2 text-sm font-display font-black text-primary-foreground shadow-gold"
          >
            {t("activateExplosion")}
          </motion.button>
        )}
      </div>

      <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{bpm} BPM</span>
          <span>•</span>
          <span>tol. ±{toleranceMs}ms</span>
        </div>
        <AnimatePresence mode="wait">
          {feedback ? (
            <motion.div
              key={feedback + (deltaMs ?? 0)}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 6, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <span
                className={
                  "font-display font-black text-lg " +
                  (feedback === "ontime"
                    ? "text-[color:var(--success)]"
                    : feedback === "early"
                    ? "text-[color:var(--warn)]"
                    : "text-[color:var(--danger)]")
                }
              >
                {feedback === "ontime" ? t("onTime") : feedback === "early" ? t("early") : t("late")}
              </span>
              {deltaMs != null && (
                <span className="text-xs">
                  {Math.abs(deltaMs)}ms {deltaMs < 0 ? "antes" : deltaMs > 0 ? "depois" : ""}
                  {accuracy != null && (
                    <> • <span className="text-gold font-bold">{accuracy}%</span></>
                  )}
                </span>
              )}
            </motion.div>
          ) : (
            <span className="opacity-60">{t("answerOnBeat4")}</span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
