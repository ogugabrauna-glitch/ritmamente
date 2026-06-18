import { motion } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";
import { useT } from "@/lib/i18n";

export function ThemeToggle() {
  const { effectiveTheme, toggleTheme } = useTheme();
  const t = useT();

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="rounded-full glass px-2 py-1 text-sm"
      aria-label={t("theme")}
      title={`Dark mode: ${effectiveTheme === "dark" ? "On" : "Off"}`}
    >
      {effectiveTheme === "dark" ? "🌙" : "☀️"}
    </motion.button>
  );
}
