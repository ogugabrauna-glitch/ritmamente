import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Metronome } from "@/lib/game/metronome";
import { getLevel, isCheckpoint, SCENES, toleranceMs as tolFor, MODE_META, tabuadaBpm } from "@/lib/game/levels";
import { generateProblem } from "@/lib/game/problems";
import { useGame, xpForLevel } from "@/lib/game/store";
import { getNewTitleBetween, getTitleAt } from "@/lib/game/titles";
import { MetronomeVisual } from "./MetronomeVisual";
import { ParticleBg } from "./ParticleBg";
import { Coronation } from "./Coronation";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, useT } from "@/lib/i18n";

interface Props {
  onExit: () => void;
  onOpenCommunity?: () => void;
}

const MAX_PASSES = 3;
const EXPLOSION_DURATION_MS = 10_000;

type PowerKey = "slow" | "skip" | "shield" | "freeze";

export function Game({ onExit, onOpenCommunity }: Props) {
  const { stats, settings, profile, mode, addCorrect, addWrong, loseHeart, earnXP, earnCredit,
          levelUp, setCheckpoint, useCredit, unlockAchievement, updateStats,
          advanceTabuada, unlockTabMestre, addExplodeCharge, resetExplodeCharge } = useGame();

  const lang = useI18n((s) => s.lang);
  const t = useT();

  const baseLevel = useMemo(() => getLevel(mode, stats.level), [mode, stats.level]);
  // Tabuada: BPM segue a tabuada do nível atual (nível 1 → tab do 1 = 50 BPM, ..., nível 10 → tab do 10 = 100 BPM)
  const effectiveBpm = mode === "tabuada" ? tabuadaBpm((Math.min(10, Math.max(1, stats.level)) - 1) * 10) : baseLevel.bpm;
  const level = useMemo(() => ({ ...baseLevel, bpm: effectiveBpm }), [baseLevel, effectiveBpm]);
  const scene = SCENES[level.scene];
  const tolerance = tolFor(mode, level.level);

  const metroRef = useRef<Metronome | null>(null);
  const [beat, setBeat] = useState(0);
  // Em tabuada, o índice começa no início da tabuada do nível atual (nível 1 → 0, nível 6 → 50)
  const tabuadaStartForLevel = (lv: number) => (Math.min(10, Math.max(1, lv)) - 1) * 10;
  const tabuadaIdxRef = useRef(mode === "tabuada" ? tabuadaStartForLevel(stats.level) : stats.tabuadaIndex);
  const [problem, setProblem] = useState(() => generateProblem(mode, level.level, level.op, tabuadaIdxRef.current));
  const [feedback, setFeedback] = useState<"ontime"|"early"|"late"|null>(null);
  const [deltaMs, setDeltaMs] = useState<number|null>(null);
  const [accuracy, setAccuracy] = useState<number|null>(null);
  const [roundsDone, setRoundsDone] = useState(0);
  const [popups, setPopups] = useState<{id:number; text:string; cls:string}[]>([]);
  const popupId = useRef(0);
  const answeredThisCycle = useRef(false);
  const [over, setOver] = useState<null | "win" | "lose">(null);
  const [newRecord, setNewRecord] = useState<null | { level: number; combo: number; bpm: number; score: number }>(null);
  const startBestLevel = useRef(stats.bestLevel);

  const [countdown, setCountdown] = useState<string | null>("3");
  const [passes, setPasses] = useState(MAX_PASSES);

  // Starter powers — every player starts each run with: 2 slow, 2 skip, 2 shield
  const [powers, setPowers] = useState<Record<PowerKey, number>>({ slow: 2, skip: 2, shield: 2, freeze: 0 });
  const shieldArmed = useRef(false);
  const slowTimer = useRef<number | null>(null);
  const lastComboMilestone = useRef(0);

  // Beginner help: show 1-2-3-4 visual on first 3 cycles for new players (when tutorial not seen)
  const [cyclesElapsed, setCyclesElapsed] = useState(0);
  const beginnerHelp = !settings.tutorialSeen && cyclesElapsed < 3;

  // Explosion mode
  const [explosionActive, setExplosionActive] = useState(false);
  const explosionTimer = useRef<number | null>(null);

  // Coronation
  const [coronation, setCoronation] = useState<null | { name: string; emoji: string; level: number }>(null);
  const [masterCelebration, setMasterCelebration] = useState(false);

  // Countdown then start the metronome
  useEffect(() => {
    if (countdown === null) return;
    const seq = ["3", "2", "1", "COMEÇANDO"];
    let i = seq.indexOf(countdown);
    if (i < 0) i = 0;
    const t = window.setTimeout(() => {
      if (i < seq.length - 1) setCountdown(seq[i + 1]);
      else setCountdown(null);
    }, 700);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (countdown !== null) return;
    // Alinha o índice da tabuada ao início da tabuada deste nível
    if (mode === "tabuada") tabuadaIdxRef.current = tabuadaStartForLevel(stats.level);
    const m = new Metronome();
    metroRef.current = m;
    m.setSound(settings.sound);
    m.setVibrate(settings.vibrate);
    const off = m.onBeat(({ beat }) => {
      setBeat(beat);
      if (beat === 1) {
        if (!answeredThisCycle.current) handleCyclePass();
        answeredThisCycle.current = false;
        setCyclesElapsed((c) => c + 1);
        setProblem(generateProblem(mode, level.level, level.op, tabuadaIdxRef.current));
        setFeedback(null);
        setDeltaMs(null);
        setAccuracy(null);
      }
    });
    m.start(level.bpm);
    updateStats({ bpmMax: Math.max(stats.bpmMax, level.bpm) });
    return () => {
      off();
      m.stop();
      if (slowTimer.current) { clearTimeout(slowTimer.current); slowTimer.current = null; }
      if (explosionTimer.current) { clearTimeout(explosionTimer.current); explosionTimer.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.level, countdown, mode]);

  useEffect(() => { metroRef.current?.setSound(settings.sound); }, [settings.sound]);
  useEffect(() => { metroRef.current?.setVibrate(settings.vibrate); }, [settings.vibrate]);
  useEffect(() => { metroRef.current?.setBpm(effectiveBpm); }, [effectiveBpm]);

  function pushPopup(text: string, cls: string) {
    const id = ++popupId.current;
    setPopups(p => [...p, { id, text, cls }]);
    setTimeout(() => setPopups(p => p.filter(x => x.id !== id)), 900);
  }

  function handleCyclePass() {
    setPasses(p => {
      if (p > 1) {
        pushPopup(`Chances: ${p - 1}`, "text-[color:var(--warn)] font-bold");
        return p - 1;
      }
      handleMiss();
      return MAX_PASSES;
    });
  }

  function handleMiss() {
    addWrong();
    if (explosionActive) {
      pushPopup("⚡ PROTEGIDO!", "text-gold font-bold");
      return;
    }
    if (shieldArmed.current) {
      shieldArmed.current = false;
      pushPopup("🛡️ ESCUDO!", "text-[color:var(--success)] font-bold");
      return;
    }
    loseHeart();
    pushPopup("− ❤", "text-[color:var(--danger)]");
    if (settings.vibrate) navigator.vibrate?.([40, 30, 40]);
    setTimeout(checkGameOver, 30);
  }

  function checkGameOver() {
    const s = useGame.getState().stats;
    if (s.hearts <= 0) setOver("lose");
  }

  function awardPowersForCombo(combo: number) {
    const map: Record<number, PowerKey> = { 5: "slow", 10: "skip", 20: "shield", 50: "freeze" };
    const power = map[combo];
    if (power && lastComboMilestone.current !== combo) {
      lastComboMilestone.current = combo;
      setPowers(p => ({ ...p, [power]: p[power] + 1 }));
      pushPopup(`+1 ${powerLabel(power)}`, "text-gold font-black");
    }
  }

  function activateExplosion() {
    if (useGame.getState().stats.explodeCharge < 100 || explosionActive) return;
    setExplosionActive(true);
    resetExplodeCharge();
    confetti({ particleCount: 220, spread: 120, origin: { y: 0.4 }, colors: ["#d4af37","#ffffff","#f5d77a","#ffe88a"] });
    pushPopup("⚡ " + t("explosionMode"), "text-gold font-black text-4xl");
    if (settings.vibrate) navigator.vibrate?.([60, 30, 60, 30, 120]);
    if (explosionTimer.current) clearTimeout(explosionTimer.current);
    explosionTimer.current = window.setTimeout(() => {
      setExplosionActive(false);
      pushPopup("Explosão encerrada", "text-muted-foreground");
    }, EXPLOSION_DURATION_MS);
  }

  function handleAnswer(value: number) {
    if (answeredThisCycle.current || countdown !== null) return;
    answeredThisCycle.current = true;
    const m = metroRef.current!;
    const delta = m.nearestStrongBeatDeltaMs();
    const correct = value === problem.answer;
    const inTime = delta != null && Math.abs(delta) <= tolerance;

    const rounded = delta != null ? Math.round(delta) : null;
    setDeltaMs(rounded);
    if (delta == null) { setFeedback(null); setAccuracy(null); }
    else {
      const abs = Math.abs(delta);
      const acc = Math.max(0, Math.round((1 - abs / tolerance) * 100));
      setAccuracy(acc);
      if (abs <= tolerance) setFeedback("ontime");
      else if (delta < 0) setFeedback("early");
      else setFeedback("late");
    }

    if (correct && inTime) {
      addCorrect();
      setPasses(MAX_PASSES);
      const s = useGame.getState().stats;
      let xpGain = 10 + Math.floor(s.combo / 5) * 5 + (level.isBoss ? 20 : 0);
      if (explosionActive) xpGain *= 2;
      earnXP(xpGain);
      pushPopup(`+${xpGain} XP${explosionActive ? " x2" : ""}`, "text-gold");
      awardPowersForCombo(s.combo);

      // Charge explosion bar (precision-weighted)
      const acc = accuracy ?? 70;
      const charge = 8 + Math.round(acc / 20);
      if (!explosionActive) addExplodeCharge(charge);

      // Tabuada mode: avança 1×1 → 1×10 dentro do nível; o nível controla qual tabuada
      if (mode === "tabuada") {
        advanceTabuada(); // mantém progresso no store p/ desbloquear Tabuada Mestre
        tabuadaIdxRef.current = tabuadaIdxRef.current + 1;
        const maxProgress = useGame.getState().stats.tabuadaIndex;
        if (maxProgress >= 100) {
          if (unlockAchievement("master-of-tables")) {
            unlockTabMestre();
            setMasterCelebration(true);
            confetti({ particleCount: 300, spread: 140, origin: { y: 0.5 }, colors: ["#d4af37","#ffffff","#f5d77a"] });
          }
        }
      }

      const milestones = [5, 10, 20, 50, 100];
      if (milestones.includes(s.combo)) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#d4af37","#f5d77a","#ffffff"] });
        pushPopup(`COMBO x${s.combo}!`, "text-gold font-black");
      }
      maybeAchievements();
      const next = roundsDone + 1;
      setRoundsDone(next);
      if (next >= level.rounds) setTimeout(completeLevel, 400);
    } else {
      addWrong();
      if (explosionActive) {
        pushPopup("⚡ PROTEGIDO!", "text-gold font-bold");
        return;
      }
      if (shieldArmed.current) {
        shieldArmed.current = false;
        pushPopup("🛡️ ESCUDO!", "text-[color:var(--success)] font-bold");
      } else {
        loseHeart();
        pushPopup(correct ? "FORA DO TEMPO" : "ERRADO", "text-[color:var(--danger)] font-bold");
        if (settings.vibrate) navigator.vibrate?.(60);
        setTimeout(checkGameOver, 30);
      }
    }
  }

  function maybeAchievements() {
    const s = useGame.getState().stats;
    const checks: [string, boolean][] = [
      ["first-correct", s.totalCorrect >= 1],
      ["correct-10", s.totalCorrect >= 10],
      ["correct-100", s.totalCorrect >= 100],
      ["correct-500", s.totalCorrect >= 500],
      ["correct-1000", s.totalCorrect >= 1000],
      ["combo-10", s.bestCombo >= 10],
      ["combo-50", s.bestCombo >= 50],
      ["combo-100", s.bestCombo >= 100],
      ["level-50", s.bestLevel >= 50],
      ["level-100", s.bestLevel >= 100],
    ];
    for (const [id, ok] of checks) {
      if (ok && unlockAchievement(id)) pushPopup("🏆 Conquista!", "text-gold");
    }
  }

  function completeLevel() {
    setOver("win");
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: ["#d4af37","#ffffff","#f5d77a"] });
    if (level.isBoss) {
      earnCredit(2);
      updateStats({ bossesBeaten: stats.bossesBeaten + 1 });
      unlockAchievement("first-boss");
    }
    if (isCheckpoint(level.level)) {
      setCheckpoint(level.level + 1);
      earnCredit(1);
    }
    const s = useGame.getState().stats;
    const justBeatRecord = level.level >= startBestLevel.current;
    if (justBeatRecord) {
      const score = s.totalCorrect * 10 + s.bestCombo * 5 + level.level * 25;
      setNewRecord({ level: level.level, combo: s.bestCombo, bpm: level.bpm, score });
      void syncBestToProfile({ level: level.level, combo: s.bestCombo, bpm: level.bpm, score, totalCorrect: s.totalCorrect });
      startBestLevel.current = level.level + 1;
    }
  }

  async function syncBestToProfile(r: { level: number; combo: number; bpm: number; score: number; totalCorrect: number }) {
    try {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      const { data: existing } = await supabase.from("profiles").select("best_level,best_combo,best_score,bpm_max,total_correct").eq("id", uid).maybeSingle();
      await supabase.from("profiles").update({
        best_level: Math.max(existing?.best_level ?? 0, r.level),
        best_combo: Math.max(existing?.best_combo ?? 0, r.combo),
        best_score: Math.max(existing?.best_score ?? 0, r.score),
        bpm_max: Math.max(existing?.bpm_max ?? 0, r.bpm),
        total_correct: Math.max(existing?.total_correct ?? 0, r.totalCorrect),
        ...(profile ? { name: profile.name, avatar: profile.avatar, pet: profile.pet, age: profile.age, city: profile.city, country: profile.country } : {}),
      }).eq("id", uid);
    } catch {}
  }

  async function shareRecord() {
    if (!newRecord) return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) { setNewRecord(null); onOpenCommunity?.(); return; }
    await supabase.from("community_posts").insert({
      user_id: data.user.id, kind: "record",
      message: `Novo recorde em ${MODE_META[mode].name}! Nível ${newRecord.level} 🚀`,
      level: newRecord.level, score: newRecord.score,
      best_combo: newRecord.combo, bpm: newRecord.bpm,
    });
    setNewRecord(null);
    onOpenCommunity?.();
  }

  async function shareTitle(title: { name: string; emoji: string; level: number }) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) { onOpenCommunity?.(); return; }
    await supabase.from("community_posts").insert({
      user_id: data.user.id, kind: "title",
      message: `${title.emoji} Agora sou ${title.name}! (Nível ${title.level})`,
      level: title.level,
    });
    onOpenCommunity?.();
  }

  function restartWithCountdown() {
    metroRef.current?.stop();
    setRoundsDone(0);
    answeredThisCycle.current = false;
    setPasses(MAX_PASSES);
    lastComboMilestone.current = 0;
    setCountdown("3");
  }

  function nextLevel() {
    const prevLevel = stats.level;
    levelUp();
    const nextL = prevLevel + 1;
    const newTitle = getNewTitleBetween(prevLevel, nextL, lang);
    if (newTitle) {
      setOver(null);
      setCoronation(newTitle);
      // mark tutorial seen after first promotion
      if (!settings.tutorialSeen) useGame.getState().setTutorialSeen(true);
      return;
    }
    setOver(null);
    restartWithCountdown();
  }

  function retry() {
    if (over !== "lose") return;
    if (useCredit()) { setOver(null); restartWithCountdown(); }
    else { useGame.getState().resetRun(); setOver(null); restartWithCountdown(); }
  }

  // ---- Powers ----
  function usePower(key: PowerKey) {
    if (powers[key] <= 0) return;
    setPowers(p => ({ ...p, [key]: p[key] - 1 }));
    if (key === "slow") {
      const m = metroRef.current; if (!m) return;
      m.setBpm(Math.round(level.bpm * 0.8));
      pushPopup("🐢 SLOW ativado", "text-[color:var(--success)] font-bold");
      if (slowTimer.current) clearTimeout(slowTimer.current);
      slowTimer.current = window.setTimeout(() => {
        m.setBpm(level.bpm);
        pushPopup("Velocidade normal", "text-muted-foreground");
      }, 10000);
    } else if (key === "skip") {
      answeredThisCycle.current = true;
      setPasses(MAX_PASSES);
      pushPopup("⏭️ PULOU", "text-gold font-bold");
    } else if (key === "shield") {
      shieldArmed.current = true;
      pushPopup("🛡️ ESCUDO ATIVO", "text-[color:var(--success)] font-bold");
    } else if (key === "freeze") {
      metroRef.current?.pause();
      pushPopup("❄️ CONGELADO", "text-[color:var(--success)] font-bold");
      window.setTimeout(() => { setCountdown("3"); }, 4000);
    }
  }

  const xpNeeded = xpForLevel(stats.level);
  const xpPct = Math.min(100, (stats.xp / xpNeeded) * 100);
  const currentTitle = getTitleAt(stats.level, lang);

  return (
    <div className={"relative min-h-[100svh] overflow-hidden " + (explosionActive ? "ring-4 ring-[color:var(--gold)] ring-offset-2 ring-offset-background" : "")}
         style={{ background: `radial-gradient(ellipse at top, ${scene.from}, ${scene.to})` }}>
      <ParticleBg color={explosionActive ? "#ffe88a" : scene.particle} density={explosionActive ? 140 : (mode === "kids" ? 70 : 50)} />

      {/* Explosion screen flash */}
      <AnimatePresence>
        {explosionActive && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-10 bg-gold-grad"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex max-w-2xl items-center justify-between gap-3 p-4">
        <button onClick={onExit} className="rounded-full glass px-3 py-1.5 text-sm">← {t("menu")}</button>
        <div className="flex items-center gap-2 text-sm flex-wrap justify-end">
          <span className="rounded-full glass px-2 py-1 text-xs">{MODE_META[mode].emoji} {MODE_META[mode].name}</span>
          <span className="text-base">❤ <b>{stats.hearts}</b></span>
          <span className="rounded-full glass px-2 py-1">🪙 {stats.credits}</span>
          <span className="rounded-full glass px-2 py-1">🔥 {stats.combo}</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{scene.name} • <span className="text-gold">{currentTitle.emoji} {currentTitle.name}</span></span>
          <span>{level.title} • {roundsDone}/{level.rounds}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full bg-gold-grad transition-all" style={{ width: `${xpPct}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{t("chancesLeft")}: <b className="text-gold">{passes}</b></span>
          {mode === "tabuada" && (
            <span>Tabuada: <b className="text-gold">{stats.tabuadaIndex}/100</b></span>
          )}
          <span>XP {stats.xp} / {xpNeeded}</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 pt-6">
        <MetronomeVisual
          currentBeat={beat}
          bpm={level.bpm}
          feedback={feedback}
          deltaMs={deltaMs}
          toleranceMs={tolerance}
          accuracy={accuracy}
          beginnerHelp={beginnerHelp}
          explodeCharge={stats.explodeCharge}
          explosionActive={explosionActive}
          onActivateExplosion={activateExplosion}
        />
      </div>

      <div className="relative z-10 mx-auto mt-6 max-w-2xl px-4">
        <motion.div
          key={problem.text}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-3xl glass p-6 text-center shadow-card"
        >
          <div className="font-display text-5xl font-black tracking-wide sm:text-6xl">
            <span className="text-gold">{problem.text}</span>
            <span className="text-foreground/40"> = ?</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {problem.options.map(opt => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={answeredThisCycle.current || countdown !== null}
                className="rounded-2xl gold-border bg-card/60 px-4 py-4 font-display text-2xl font-bold transition hover:bg-gold-grad hover:text-primary-foreground active:scale-95 disabled:opacity-40"
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Powers bar */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {(["slow","skip","shield","freeze"] as PowerKey[]).map(k => (
            <button
              key={k}
              onClick={() => usePower(k)}
              disabled={powers[k] <= 0 || countdown !== null}
              className="rounded-2xl gold-border bg-card/40 p-2 text-center disabled:opacity-30"
              title={powerTitle(k)}
            >
              <div className="text-xl">{powerIcon(k)}</div>
              <div className="text-[10px] uppercase tracking-wider">{powerLabel(k)}</div>
              <div className="text-xs font-black text-gold">×{powers[k]}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 top-1/3 z-20 flex flex-col items-center gap-2">
        <AnimatePresence>
          {popups.map(p => (
            <motion.div
              key={p.id}
              initial={{ y: 0, opacity: 1, scale: 0.8 }}
              animate={{ y: -60, opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0 }}
              className={"font-display text-3xl " + p.cls}
            >{p.text}</motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Countdown overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              className="font-display font-black text-gold drop-shadow-[0_0_40px_var(--gold)]"
              style={{ fontSize: countdown === "COMEÇANDO" ? "clamp(2.5rem,12vw,5rem)" : "clamp(6rem,28vw,12rem)" }}
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {over && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-3xl glass p-8 text-center shadow-gold"
            >
              {over === "win" ? (
                <>
                  <div className="text-5xl">🎉</div>
                  <h2 className="mt-3 font-display text-2xl font-black text-gold">{t("levelUp")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {level.isBoss ? "Chefe derrotado! +2 créditos" : isCheckpoint(level.level) ? "Checkpoint salvo! +1 crédito" : "Continue assim!"}
                  </p>
                  <p className="mt-3 text-4xl">{profile?.avatar ?? "🦁"}</p>
                  <button onClick={nextLevel} className="mt-6 w-full rounded-full bg-gold-grad py-3 font-bold text-primary-foreground shadow-gold">
                    {t("nextLevel")}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-5xl">💔</div>
                  <h2 className="mt-3 font-display text-2xl font-black">{t("gameOver")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Use um crédito para voltar ao último checkpoint (nível {stats.lastCheckpoint}).
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={retry} className="flex-1 rounded-full bg-gold-grad py-3 font-bold text-primary-foreground shadow-gold">
                      {stats.credits > 0 ? `🪙 Usar crédito (${stats.credits})` : t("tryAgain")}
                    </button>
                    <button onClick={onExit} className="flex-1 rounded-full glass py-3 font-bold">{t("menu")}</button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {coronation && (
          <Coronation
            title={coronation}
            onClose={() => { setCoronation(null); restartWithCountdown(); }}
            onShare={() => { void shareTitle(coronation); setCoronation(null); restartWithCountdown(); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {masterCelebration && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-3xl gold-border bg-card/90 p-8 text-center shadow-gold"
            >
              <div className="text-7xl">🏆</div>
              <h2 className="mt-3 font-display text-2xl font-black shimmer-text">🏆 {t("masterOfTables")}</h2>
              <p className="mt-2 text-sm">{t("masterOfTablesMsg")}</p>
              <p className="mt-3 text-xs text-muted-foreground">+1 troféu • avatar 👑 desbloqueado • Tabuada Mestre liberada</p>
              <button onClick={() => setMasterCelebration(false)} className="mt-6 w-full rounded-full bg-gold-grad py-3 font-bold text-primary-foreground shadow-gold">
                Continuar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newRecord && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-3xl glass p-8 text-center shadow-gold"
            >
              <div className="text-5xl">🏆</div>
              <h2 className="mt-3 font-display text-2xl font-black text-gold">{t("newRecord")}</h2>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <Stat label="Nível" value={newRecord.level} />
                <Stat label="Combo" value={newRecord.combo} />
                <Stat label="BPM" value={newRecord.bpm} />
              </div>
              <div className="mt-2 text-sm">Pontuação: <span className="font-display font-black text-gold">{newRecord.score}</span></div>
              <div className="mt-5 flex gap-2">
                <button onClick={shareRecord} className="flex-1 rounded-full bg-gold-grad py-3 font-bold text-primary-foreground shadow-gold">
                  {t("share")}
                </button>
                <button onClick={() => setNewRecord(null)} className="flex-1 rounded-full glass py-3 font-bold">{t("notNow")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl gold-border bg-card/40 py-2">
      <div className="font-display text-lg font-black text-gold">{value}</div>
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
    </div>
  );
}

function powerLabel(k: PowerKey) {
  return k === "slow" ? "Slow" : k === "skip" ? "Pular" : k === "shield" ? "Escudo" : "Congelar";
}
function powerIcon(k: PowerKey) {
  return k === "slow" ? "🐢" : k === "skip" ? "⏭️" : k === "shield" ? "🛡️" : "❄️";
}
function powerTitle(k: PowerKey) {
  return k === "slow" ? "Reduz 20% do BPM por 10s"
    : k === "skip" ? "Pula esta conta sem penalidade"
    : k === "shield" ? "Protege contra 1 erro"
    : "Pausa o desafio por alguns segundos";
}
