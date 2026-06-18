import { motion } from "framer-motion";
import { useI18n, useT, LANG_OPTIONS } from "@/lib/i18n";

export function LangSelect({ onDone }: { onDone: () => void }) {
  const { setLang } = useI18n();
  const t = useT();

  return (
    <div className="relative flex min-h-[100svh] items-center justify-center p-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md rounded-3xl glass p-8 shadow-card text-center"
      >
        <div className="text-5xl mb-3">🌎</div>
        <h1 className="font-display text-2xl font-black shimmer-text">{t("chooseLanguage")}</h1>
        <div className="mt-6 space-y-3">
          {LANG_OPTIONS.map((l) => (
            <motion.button
              key={l.code}
              whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
              onClick={() => { setLang(l.code); onDone(); }}
              className="w-full rounded-2xl gold-border bg-card/60 p-4 flex items-center gap-4 text-left hover:bg-gold-grad hover:text-primary-foreground transition"
            >
              <span className="text-4xl">{l.flag}</span>
              <span className="font-display text-lg font-bold flex-1">
                {l.code === "pt" ? "Português (Brasil)" : l.code === "en" ? "English" : "Español"}
              </span>
              <span className="text-gold">→</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
