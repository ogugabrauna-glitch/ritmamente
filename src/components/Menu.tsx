import { motion } from "framer-motion";
import { useGame, xpForLevel } from "@/lib/game/store";
import { useI18n, useT, LANG_OPTIONS } from "@/lib/i18n";
import { getTitleAt } from "@/lib/game/titles";
import { SuperRitmo } from "./SuperRitmo";
import { ThemeToggle } from "./ThemeToggle";
import { useNotification } from "@/hooks/use-notification";
import { useGlobalKeyboardShortcuts } from "@/lib/accessibility";
import logo from "@/assets/logo.png";

interface Props { onPlay: () => void; onStats: () => void; onAchievements: () => void; onCommunity: () => void; }

export function Menu({ onPlay, onStats, onAchievements, onCommunity }: Props) {
  const { profile, stats, settings, toggleSound, toggleVibrate, toggleMusic, setMusicVolume } = useGame();
  const { lang, setLang } = useI18n();
  const t = useT();
  const { success } = useNotification();

  // Atalhos: Enter para jogar
  useGlobalKeyboardShortcuts({
    onEnter: onPlay,
  });

  const handleMusicToggle = () => {
    toggleMusic();
    success(settings.music ? t("music") + " " + t("disabled") : t("music") + " " + t("enabled"));
  };

  const handleSoundToggle = () => {
    toggleSound();
    success(settings.sound ? t("sound") + " " + t("disabled") : t("sound") + " " + t("enabled"));
  };

  const handleVibrationToggle = () => {
    toggleVibrate();
    success(settings.vibrate ? t("vibration") + " " + t("disabled") : t("vibration") + " " + t("enabled"));
  };

  if (!profile) return null;
  const xpNeeded = xpForLevel(stats.level);
  const title = getTitleAt(stats.level, lang);

  return (
    <div className="relative mx-auto flex min-h-[100svh] max-w-md flex-col gap-5 p-5">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.img
            src={logo} alt=""
            width={1024} height={1024}
            animate={{ rotate: [0, -3, 3, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="h-12 w-12 rounded-xl shadow-gold"
          />
          <div>
            <h1 className="font-display text-xl font-black shimmer-text">RITMAMENTE</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Math</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 items-center justify-end">
          {LANG_OPTIONS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => { setLang(l.code); success(t("language") + ": " + l.label); }}
              className={"rounded-full px-2 py-1 text-xs font-bold " + (lang === l.code ? "bg-gold-grad text-primary-foreground shadow-gold" : "glass")}
              aria-label={`${t("language")}: ${l.label}`}
            >
              {l.flag} {l.label}
            </button>
          ))}
          <button type="button" onClick={handleSoundToggle} className="rounded-full glass px-2 py-1 text-sm" aria-label={t("sound")} aria-pressed={settings.sound} title={settings.sound ? "Turn off sound" : "Turn on sound"}>{settings.sound ? "🔊" : "🔇"}</button>
          <button type="button" onClick={handleVibrationToggle} className="rounded-full glass px-2 py-1 text-sm" aria-label={t("vibration")} aria-pressed={settings.vibrate} title={settings.vibrate ? "Turn off vibration" : "Turn on vibration"}>{settings.vibrate ? "📳" : "📴"}</button>
          <ThemeToggle />
        </div>
      </header>

      <div className="rounded-2xl glass px-4 py-2 flex items-center gap-3">
        <span className="text-lg" aria-hidden>🎵</span>
        <div className="flex-1">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>{t("music")}</span>
            <span className="text-gold font-bold">{settings.musicVolume}%</span>
          </div>
          <input
            type="range" min={0} max={100} step={1}
            value={settings.musicVolume}
            onChange={(e) => setMusicVolume(Number(e.target.value))}
            aria-label={t("music")}
            disabled={!settings.music}
            className="w-full accent-[color:var(--gold)]"
          />
        </div>
      </div>

      <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="rounded-3xl glass p-5 shadow-card">
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
              className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gold-grad text-5xl shadow-gold"
            >
              {profile.avatar?.startsWith("data:")
                ? <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
                : profile.avatar}
            </motion.div>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-card text-2xl gold-border"
            >
              {profile.pet}
            </motion.div>
          </div>
          <div className="flex-1">
            <div className="font-display text-lg font-black">{profile.name}</div>
            <div className="text-xs text-muted-foreground">{profile.city || "—"} • {profile.country}</div>
            <div className="mt-1 text-[11px] text-gold font-bold">{title.emoji} {title.name}</div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="rounded-full bg-gold-grad px-2 py-0.5 font-bold text-primary-foreground">Nv {stats.level}</span>
              <span className="text-muted-foreground">XP {stats.xp}/{xpNeeded}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full bg-gold-grad" style={{ width: `${Math.min(100,(stats.xp/xpNeeded)*100)}%` }} />
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <Pill icon="❤" label={t("lives")} value={stats.hearts} />
          <Pill icon="🪙" label={t("credits")} value={stats.credits} />
          <Pill icon="🔥" label={t("recordL")} value={stats.bestCombo} />
        </div>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}
        onClick={onPlay}
        className="relative overflow-hidden rounded-3xl bg-gold-grad p-6 text-center font-display text-2xl font-black text-primary-foreground shadow-gold"
      >
        ▶ {t("play")}
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ animation: "shimmer 2.5s infinite" }} />
      </motion.button>

      <button
        type="button"
        onClick={onCommunity}
        className="rounded-2xl gold-border bg-card/40 p-4 text-left"
        aria-label={t("community")}
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl">🌐</div>
          <div className="flex-1">
            <div className="font-display font-black text-gold">{t("community")}</div>
            <div className="text-xs text-muted-foreground">Ranking, feed, conquistas dos jogadores</div>
          </div>
          <div className="text-gold">→</div>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onStats}
          className="rounded-2xl glass p-4 text-left"
          aria-label={t("stats")}
        >
          <div className="text-2xl">📊</div>
          <div className="mt-1 font-bold">{t("stats")}</div>
          <div className="text-xs text-muted-foreground">Acertos, precisão, BPM</div>
        </button>
        <button
          type="button"
          onClick={onAchievements}
          className="rounded-2xl glass p-4 text-left"
          aria-label={`${t("achievements")}: ${stats.achievements.length} ${t("unlocked")}`}
        >
          <div className="text-2xl">🏆</div>
          <div className="mt-1 font-bold">{t("achievements")}</div>
          <div className="text-xs text-muted-foreground">{stats.achievements.length} desbloqueadas</div>
        </button>
      </div>

      <div className="rounded-2xl glass p-4 text-xs text-muted-foreground">
        <div className="mb-2 font-bold text-foreground">{t("howToPlay")}</div>
        {t("howToPlayDesc")}
      </div>

      <SuperRitmo level={stats.level} mood="wave" />

      {/* Selo de teste LovSync */} 
      <div className="absolute bottom-4 right-4 rounded-full glass px-3 py-1 text-xs font-bold text-muted-foreground">
        Teste LovSync
      </div>
    </div>
  );
}

function Pill({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="rounded-xl gold-border bg-card/40 py-2">
      <div className="text-base">{icon} <span className="font-display font-black">{value}</span></div>
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
    </div>
  );
}
