import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useT } from "@/lib/i18n";

interface Props {
  title: { name: string; emoji: string; level: number };
  onClose: () => void;
  onShare?: () => void;
}

export function Coronation({ title, onClose, onShare }: Props) {
  const t = useT();

  useEffect(() => {
    confetti({ particleCount: 220, spread: 120, origin: { y: 0.4 }, colors: ["#d4af37", "#ffffff", "#f5d77a", "#ffe88a"] });
    const id = window.setTimeout(() => {
      confetti({ particleCount: 120, spread: 80, origin: { x: 0.2, y: 0.5 }, colors: ["#d4af37", "#ffe88a"] });
      confetti({ particleCount: 120, spread: 80, origin: { x: 0.8, y: 0.5 }, colors: ["#d4af37", "#ffe88a"] });
    }, 400);
    return () => clearTimeout(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.6, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="w-full max-w-sm rounded-3xl gold-border bg-card/90 p-8 text-center shadow-gold"
      >
        <motion.div
          initial={{ y: -20, rotate: -10 }}
          animate={{ y: 0, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-7xl"
        >
          👑
        </motion.div>
        <div className="mt-2 text-xs font-black uppercase tracking-widest text-gold">🏆 {t("promotionUnlocked")}</div>
        <div className="mt-3 text-xs text-muted-foreground">{t("youAreNow")}</div>
        <h2 className="mt-1 font-display text-2xl font-black shimmer-text">
          {title.emoji} {title.name}
        </h2>
        <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Nível {title.level}</div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {onShare && (
            <button onClick={onShare} className="rounded-full bg-gold-grad py-3 text-sm font-bold text-primary-foreground shadow-gold">
              {t("share")}
            </button>
          )}
          <button onClick={onClose} className={"rounded-full glass py-3 text-sm font-bold " + (onShare ? "" : "col-span-2")}>
            {onShare ? t("notNow") : "OK"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
