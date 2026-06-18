import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/game/store";
import { Onboarding } from "@/components/Onboarding";
import { Menu } from "@/components/Menu";
import { Game } from "@/components/Game";
import { ModeSelect } from "@/components/ModeSelect";
import { StatsView, AchievementsView } from "@/components/StatsAchievements";
import { ParticleBg } from "@/components/ParticleBg";
import { InstallButton } from "@/components/InstallButton";
import { Community } from "@/components/Community";
import { LangSelect } from "@/components/LangSelect";
import { CinematicOpening } from "@/components/CinematicOpening";
import { forro, installGlobalClickSfx, setClickEnabled } from "@/lib/audio/forro";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ritmamente Math — Treine sua mente no ritmo do tempo" },
      { name: "description", content: "Aprenda matemática como um videogame: metrônomo, combos, chefes e progressão constante." },
      { property: "og:title", content: "Ritmamente Math" },
      { property: "og:description", content: "Treine sua mente no ritmo do tempo." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

type View = "menu" | "modes" | "game" | "stats" | "achievements" | "community";

function Index() {
  const profile = useGame((s) => s.profile);
  const settings = useGame((s) => s.settings);
  const setLangPicked = useGame((s) => s.setLangPicked);
  const setCinematicSeen = useGame((s) => s.setCinematicSeen);
  const [view, setView] = useState<View>("menu");

  // SFX de clique global em todos os botões
  useEffect(() => { installGlobalClickSfx(); }, []);
  useEffect(() => { setClickEnabled(settings.sound); }, [settings.sound]);

  // Aplica volume da música independente das outras categorias.
  useEffect(() => {
    forro.setVolume((settings.musicVolume ?? 22) / 100);
  }, [settings.musicVolume]);

  // Música nordestina: toca desde a escolha do idioma até clicar em "Jogar".
  useEffect(() => {
    if (!settings.sound || (settings.musicVolume ?? 22) <= 0) { forro.stop(); return; }
    const shouldPlay = view !== "game";
    if (shouldPlay) {
      forro.start();
      const onGesture = () => { forro.start(); };
      window.addEventListener("pointerdown", onGesture, { once: true });
      window.addEventListener("keydown", onGesture, { once: true });
      return () => {
        window.removeEventListener("pointerdown", onGesture);
        window.removeEventListener("keydown", onGesture);
      };
    } else {
      forro.stop();
    }
  }, [view, settings.sound, settings.musicVolume]);

  // First-launch flow: language → cinematic → onboarding/menu
  if (!settings.langPicked) {
    return (
      <div className="relative min-h-[100svh]"><ParticleBg />
        <LangSelect onDone={() => setLangPicked(true)} />
      </div>
    );
  }
  if (!settings.cinematicSeen) {
    return <CinematicOpening onDone={() => setCinematicSeen(true)} />;
  }

  return (
    <div className="relative min-h-[100svh]">
      <ParticleBg />
      {!profile ? (
        <Onboarding onDone={() => setView("menu")} />
      ) : view === "menu" ? (
        <Menu
          onPlay={() => setView("modes")}
          onStats={() => setView("stats")}
          onAchievements={() => setView("achievements")}
          onCommunity={() => setView("community")}
        />
      ) : view === "modes" ? (
        <ModeSelect onBack={() => setView("menu")} onPick={() => setView("game")} />
      ) : view === "game" ? (
        <Game onExit={() => setView("menu")} onOpenCommunity={() => setView("community")} />
      ) : view === "stats" ? (
        <StatsView onBack={() => setView("menu")} />
      ) : view === "achievements" ? (
        <AchievementsView onBack={() => setView("menu")} />
      ) : (
        <Community onBack={() => setView("menu")} />
      )}
      <InstallButton />
    </div>
  );
}
