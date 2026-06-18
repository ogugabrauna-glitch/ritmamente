// Trilha de fundo (forró) + SFX de clique nos botões.
// Volume independente, ducking automático em eventos importantes.
import forroAsset from "@/assets/forro.mp3.asset.json";

class ForroMusic {
  private audio?: HTMLAudioElement;
  private running = false;
  /** Volume base configurado pelo usuário (0..1). Padrão baixo para ficar em segundo plano. */
  private baseVolume = 0.22;
  /** Multiplicador de ducking (0..1). 1 = normal, 0.4 = abaixado. */
  private duckMul = 1;
  private duckTimer?: number;
  private fadeTimer?: number;

  isRunning() { return this.running; }

  /** Volume "alvo" atual (base * duck). */
  private get target() { return this.baseVolume * this.duckMul; }

  /** Define o volume base 0..1. Aplica imediato (suave) se tocando. */
  setVolume(v: number) {
    // Reduz 50% do volume percebido: trata o valor do usuário como teto pela metade.
    this.baseVolume = Math.max(0, Math.min(1, v)) * 0.5;
    this.fadeTo(this.target, 250);
  }

  /** Abaixa a música temporariamente. mul ~0.4-0.6; durationMs antes de voltar. */
  duck(mul = 0.45, durationMs = 1800) {
    this.duckMul = Math.max(0, Math.min(1, mul));
    this.fadeTo(this.target, 180);
    if (this.duckTimer) window.clearTimeout(this.duckTimer);
    this.duckTimer = window.setTimeout(() => {
      this.duckMul = 1;
      this.fadeTo(this.target, 600);
    }, durationMs);
  }

  private fadeTo(to: number, ms: number) {
    if (!this.audio) return;
    if (this.fadeTimer) window.clearInterval(this.fadeTimer);
    const a = this.audio;
    const from = a.volume;
    const steps = Math.max(4, Math.round(ms / 30));
    let i = 0;
    this.fadeTimer = window.setInterval(() => {
      i++;
      const t = i / steps;
      a.volume = Math.max(0, Math.min(1, from + (to - from) * t));
      if (i >= steps) { window.clearInterval(this.fadeTimer); this.fadeTimer = undefined; }
    }, 30);
  }

  async start() {
    if (this.running) return;
    if (!this.audio) {
      this.audio = new Audio(forroAsset.url);
      this.audio.loop = true;
      this.audio.preload = "auto";
    }
    this.audio.volume = 0;
    try {
      await this.audio.play();
      this.running = true;
      this.fadeTo(this.target, 800);
    } catch {
      // autoplay bloqueado — aguarda gesto do usuário
    }
  }

  stop() {
    if (!this.audio || !this.running) return;
    this.running = false;
    const a = this.audio;
    this.fadeTo(0, 400);
    window.setTimeout(() => { try { a.pause(); a.currentTime = 0; } catch {} }, 450);
  }
}

export const forro = new ForroMusic();

// ---------------- CLICK SFX ----------------
let clickCtx: AudioContext | undefined;
let clickEnabled = true;

export function setClickEnabled(on: boolean) { clickEnabled = on; }

export function playClick() {
  if (!clickEnabled) return;
  try {
    if (!clickCtx) clickCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = clickCtx;
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(1400, t);
    o.frequency.exponentialRampToValueAtTime(700, t + 0.08);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.25, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.14);
  } catch {}
}

// Captura cliques em qualquer <button> dentro do app.
let installed = false;
export function installGlobalClickSfx() {
  if (installed) return;
  installed = true;
  window.addEventListener("pointerdown", (e) => {
    const el = e.target as HTMLElement | null;
    if (!el) return;
    const btn = el.closest("button, [role='button'], a");
    if (btn) playClick();
  }, true);
}
