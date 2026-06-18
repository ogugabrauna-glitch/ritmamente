import { useGame } from "@/lib/game/store";

const ACH = [
  { id: "first-correct", name: "Primeiro Acerto", icon: "✨" },
  { id: "correct-10", name: "10 Acertos", icon: "🔟" },
  { id: "correct-100", name: "100 Acertos", icon: "💯" },
  { id: "correct-500", name: "500 Acertos", icon: "🎯" },
  { id: "correct-1000", name: "1000 Acertos", icon: "👑" },
  { id: "first-boss", name: "Primeiro Chefe", icon: "🐲" },
  { id: "combo-10", name: "Combo 10", icon: "🔥" },
  { id: "combo-50", name: "Combo 50", icon: "⚡" },
  { id: "combo-100", name: "Combo 100", icon: "💫" },
  { id: "level-50", name: "Nível 50", icon: "🏔️" },
  { id: "level-100", name: "Nível 100", icon: "🌌" },
  { id: "master", name: "Mestre Ritmamente", icon: "🥇" },
];

export function StatsView({ onBack }: { onBack: () => void }) {
  const { stats } = useGame();
  const precision = stats.totalAttempts ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100) : 0;
  const items: [string, string|number][] = [
    ["Melhor nível", stats.bestLevel],
    ["Maior combo", stats.bestCombo],
    ["Total de acertos", stats.totalCorrect],
    ["Precisão", `${precision}%`],
    ["BPM máximo", stats.bpmMax],
    ["Chefes derrotados", stats.bossesBeaten],
    ["Créditos acumulados", stats.credits],
    ["XP total", stats.xp],
  ];
  return (
    <div className="mx-auto min-h-[100svh] max-w-md p-5">
      <button onClick={onBack} className="mb-4 rounded-full glass px-3 py-1.5 text-sm">← Voltar</button>
      <h2 className="font-display text-2xl font-black text-gold">📊 Estatísticas</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map(([k, v]) => (
          <div key={k} className="rounded-2xl glass p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{k}</div>
            <div className="mt-1 font-display text-2xl font-black text-gold">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AchievementsView({ onBack }: { onBack: () => void }) {
  const { stats } = useGame();
  return (
    <div className="mx-auto min-h-[100svh] max-w-md p-5">
      <button onClick={onBack} className="mb-4 rounded-full glass px-3 py-1.5 text-sm">← Voltar</button>
      <h2 className="font-display text-2xl font-black text-gold">🏆 Conquistas</h2>
      <p className="text-xs text-muted-foreground">{stats.achievements.length} de {ACH.length}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {ACH.map(a => {
          const unlocked = stats.achievements.includes(a.id);
          return (
            <div key={a.id} className={"rounded-2xl p-4 text-center " + (unlocked ? "glass shadow-gold" : "bg-card/30 opacity-50")}>
              <div className="text-3xl">{unlocked ? a.icon : "🔒"}</div>
              <div className="mt-1 text-xs font-bold">{a.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
