// Web Audio metronome with look-ahead scheduling for precise timing.

export type BeatCallback = (info: { beat: number; time: number; isStrong: boolean }) => void;

export class Metronome {
  private ctx: AudioContext | null = null;
  private bpm = 60;
  private nextBeatTime = 0;
  private currentBeat = 0;
  private timerId: number | null = null;
  private listeners: BeatCallback[] = [];
  private soundOn = true;
  private vibrateOn = true;
  private running = false;
  public beatTimes: { beat: number; time: number; isStrong: boolean }[] = [];

  setBpm(bpm: number) { this.bpm = bpm; }
  setSound(on: boolean) { this.soundOn = on; }
  setVibrate(on: boolean) { this.vibrateOn = on; }
  onBeat(cb: BeatCallback) { this.listeners.push(cb); return () => { this.listeners = this.listeners.filter(l => l !== cb); }; }

  get audioTime() { return this.ctx?.currentTime ?? 0; }
  get isRunning() { return this.running; }

  async start(bpm: number) {
    this.bpm = bpm;
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.currentBeat = 0;
    this.nextBeatTime = this.ctx.currentTime + 0.1;
    this.beatTimes = [];
    this.running = true;
    this.scheduler();
  }

  stop() {
    this.running = false;
    if (this.timerId) { clearTimeout(this.timerId); this.timerId = null; }
  }

  pause() {
    this.running = false;
    if (this.timerId) { clearTimeout(this.timerId); this.timerId = null; }
  }

  async resume() {
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.currentBeat = 0;
    this.nextBeatTime = this.ctx.currentTime + 0.1;
    this.beatTimes = [];
    this.running = true;
    this.scheduler();
  }

  private scheduler = () => {
    if (!this.ctx || !this.running) return;
    const lookahead = 0.1;
    while (this.nextBeatTime < this.ctx.currentTime + lookahead) {
      const beat = (this.currentBeat % 4) + 1;
      const isStrong = beat === 4;
      this.scheduleClick(this.nextBeatTime, isStrong);
      const time = this.nextBeatTime;
      const delay = Math.max(0, (time - this.ctx.currentTime) * 1000);
      window.setTimeout(() => {
        if (!this.running) return;
        this.beatTimes.push({ beat, time, isStrong });
        if (this.beatTimes.length > 16) this.beatTimes.shift();
        this.listeners.forEach(l => l({ beat, time, isStrong }));
        if (isStrong && this.vibrateOn && "vibrate" in navigator) navigator.vibrate?.(30);
      }, delay);
      this.currentBeat++;
      this.nextBeatTime += 60 / this.bpm;
    }
    if (this.running) this.timerId = window.setTimeout(this.scheduler, 25) as unknown as number;
  };

  private scheduleClick(when: number, strong: boolean) {
    if (!this.ctx || !this.soundOn) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.value = strong ? 1200 : 700;
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(strong ? 0.5 : 0.25, when + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.08);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(when);
    osc.stop(when + 0.1);
  }

  nearestStrongBeatDeltaMs(): number | null {
    if (!this.ctx) return null;
    const now = this.ctx.currentTime;
    const strongs = this.beatTimes.filter(b => b.isStrong);
    if (!strongs.length) return null;
    let best = strongs[0].time;
    for (const s of strongs) {
      if (Math.abs(s.time - now) < Math.abs(best - now)) best = s.time;
    }
    return (now - best) * 1000;
  }
}
