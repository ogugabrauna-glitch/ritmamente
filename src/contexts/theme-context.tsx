import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useGame } from "@/lib/game/store";

type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("light");
  const settings = useGame((s) => s.settings);
  const updateSettings = useGame((s) => s.updateSettings);

  const theme = (settings as any).theme ?? "auto";

  // Detectar dark mode do sistema
  useEffect(() => {
    setMounted(true);
    const updateEffectiveTheme = () => {
      if (theme === "auto") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setEffectiveTheme(isDark ? "dark" : "light");
      } else {
        setEffectiveTheme(theme as "light" | "dark");
      }
    };

    updateEffectiveTheme();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateEffectiveTheme);
    return () => mediaQuery.removeEventListener("change", updateEffectiveTheme);
  }, [theme]);

  // Aplicar tema ao HTML
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (effectiveTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [effectiveTheme, mounted]);

  const setTheme = (newTheme: Theme) => {
    updateSettings({ theme: newTheme });
  };

  const toggleTheme = () => {
    if (theme === "auto") {
      setTheme(effectiveTheme === "dark" ? "light" : "dark");
    } else {
      setTheme("auto");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: theme as Theme, setTheme, effectiveTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
