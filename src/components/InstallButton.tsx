import { useEffect, useState } from "react";

export function InstallButton() {
  const [evt, setEvt] = useState<any>(null);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEvt(e); };
    window.addEventListener("beforeinstallprompt", h);
    window.addEventListener("appinstalled", () => setHidden(true));
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  if (!evt || hidden) return null;
  return (
    <button
      onClick={async () => { await evt.prompt(); setHidden(true); }}
      className="fixed bottom-4 right-4 z-50 rounded-full bg-gold-grad px-5 py-3 text-sm font-bold text-primary-foreground shadow-gold animate-float-up"
    >
      ⬇ Instalar Aplicativo
    </button>
  );
}
