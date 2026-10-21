/** 全部音色都用 WebAudio 实时合成，不需要任何音频文件。 */

export type InstrumentId = "piano" | "musicbox" | "chip" | "harp" | "bell" | "miku";

export const INSTRUMENTS: { id: InstrumentId; name: string }[] = [
  { id: "piano", name: "钢琴" },
  { id: "musicbox", name: "八音盒" },
  { id: "chip", name: "8-bit" },
  { id: "harp", name: "竖琴" },
  { id: "bell", name: "铃" },
  { id: "miku", name: "Miku 声线" },
];

type Release = () => void;

const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

class Engine {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private pulse: PeriodicWave | null = null;
  private live = new Set<Release>();

  /** 必须在用户手势里调用（点击 PLAY） */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 6;
      this.out = this.ctx.createGain();
      this.out.gain.value = 0.55;
      this.out.connect(comp).connect(this.ctx.destination);
      // 25% 占空比的方波，8-bit 味道
      const n = 32;
      const real = new Float32Array(n);
      const imag = new Float32Array(n);
      for (let k = 1; k < n; k++) imag[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25);
      this.pulse = this.ctx.createPeriodicWave(real, imag);
    }
    void this.ctx.resume();
    return true;
  }

  play(midi: number, inst: InstrumentId): Release {
    if (!this.ctx || !this.out) return () => {};
    if (this.ctx.state !== "running") void this.ctx.resume();
    // 复音上限，超出就把最早的音关掉
    if (this.live.size >= 14) {
      const first = this.live.values().next().value;
      first?.();
    }
    const release = this.voices[inst](midiToHz(midi));
    let done = false;
    const wrapped: Release = () => {
      if (done) return;
      done = true;
      this.live.delete(wrapped);
      release();
    };
    this.live.add(wrapped);
    return wrapped;
  }

  /** ADSR 的小工具：返回增益节点和“松键”函数 */
  private env(peak: number, a: number, d: number, sustain: number, r: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * sustain), t + a + d);
    const stopAt = { t: 0 };
    const release = (now = ctx.currentTime) => {
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(Math.max(g.gain.value, 0.0002), now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + r);
      stopAt.t = now + r + 0.05;
    };
    return { g, release: () => release(), stopAt };
  }

  private stopLater(nodes: (OscillatorNode | AudioBufferSourceNode)[], at: number) {
    const ctx = this.ctx!;
    nodes.forEach((n) => {
      try {
        n.stop(Math.max(at, ctx.currentTime + 0.02));
      } catch {
        /* 已经停止 */
      }
    });
  }

  private voices: Record<InstrumentId, (f: number) => Release> = {
    piano: (f) => {
      const ctx = this.ctx!;
      const t = ctx.currentTime;
      const { g, release, stopAt } = this.env(0.5, 0.006, 2.4, 0.04, 0.32);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(Math.min(9000, f * 9), t);
      lp.frequency.exponentialRampToValueAtTime(Math.max(600, f * 2.2), t + 1.2);
      const oscs: OscillatorNode[] = [];
      const parts: [number, number, OscillatorType][] = [
        [1, 1, "triangle"],
        [2, 0.42, "sine"],
        [3, 0.22, "sine"],
        [4, 0.1, "sine"],
        [5.01, 0.05, "sine"],
      ];
      for (const [mult, amp, type] of parts) {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = f * mult;
        const pg = ctx.createGain();
        pg.gain.value = amp;
        o.connect(pg).connect(lp);
        o.start(t);
        oscs.push(o);
      }
      lp.connect(g).connect(this.out!);
      this.stopLater(oscs, t + 3);
      return () => {
        release();
        this.stopLater(oscs, stopAt.t);
      };
    },

    musicbox: (f) => {
      const ctx = this.ctx!;
      const t = ctx.currentTime;
      const { g } = this.env(0.38, 0.003, 1.6, 0.01, 0.3);
      const oscs: OscillatorNode[] = [];
      for (const [mult, amp] of [
        [2, 1],
        [4, 0.28],
        [5.43, 0.12],
      ] as const) {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.value = f * mult;
        const pg = ctx.createGain();
        pg.gain.value = amp;
        o.connect(pg).connect(g);
        o.start(t);
        oscs.push(o);
      }
      g.connect(this.out!);
      this.stopLater(oscs, t + 2.2);
      return () => {};
    },

    chip: (f) => {
      const ctx = this.ctx!;
      const t = ctx.currentTime;
      const { g, release, stopAt } = this.env(0.2, 0.004, 0.12, 0.6, 0.07);
      const o = ctx.createOscillator();
      o.setPeriodicWave(this.pulse!);
      o.frequency.value = f;
      o.connect(g).connect(this.out!);
      o.start(t);
      return () => {
        release();
        this.stopLater([o], stopAt.t);
      };
    },

    harp: (f) => {
      const ctx = this.ctx!;
      const t = ctx.currentTime;
      const { g } = this.env(0.42, 0.004, 1.9, 0.01, 0.4);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.Q.value = 2;
      lp.frequency.setValueAtTime(f * 7, t);
      lp.frequency.exponentialRampToValueAtTime(f * 1.4, t + 0.5);
      const a = ctx.createOscillator();
      a.type = "sawtooth";
      a.frequency.value = f;
      const b = ctx.createOscillator();
      b.type = "triangle";
      b.frequency.value = f * 2;
      const bg = ctx.createGain();
      bg.gain.value = 0.35;
      a.connect(lp);
      b.connect(bg).connect(lp);
      lp.connect(g).connect(this.out!);
      a.start(t);
      b.start(t);
      this.stopLater([a, b], t + 2.4);
      return () => {};
    },

    bell: (f) => {
      const ctx = this.ctx!;
      const t = ctx.currentTime;
      const { g } = this.env(0.4, 0.002, 2.8, 0.005, 0.4);
      const car = ctx.createOscillator();
      car.type = "sine";
      car.frequency.value = f * 2;
      const mod = ctx.createOscillator();
      mod.type = "sine";
      mod.frequency.value = f * 2 * 3.5;
      const idx = ctx.createGain();
      idx.gain.setValueAtTime(f * 2 * 2.2, t);
      idx.gain.exponentialRampToValueAtTime(1, t + 1.6);
      mod.connect(idx).connect(car.frequency);
      car.connect(g).connect(this.out!);
      car.start(t);
      mod.start(t);
      this.stopLater([car, mod], t + 3.2);
      return () => {};
    },

    miku: (f) => {
      const ctx = this.ctx!;
      const t = ctx.currentTime;
      const { g, release, stopAt } = this.env(0.55, 0.035, 0.2, 0.8, 0.18);
      // 两支略微失谐的锯齿波，过三个共振峰滤波器，近似一个明亮的“啊”
      const src = ctx.createGain();
      const oscs: OscillatorNode[] = [];
      for (const detune of [-7, 7]) {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = f * 2;
        o.detune.value = detune;
        o.connect(src);
        o.start(t);
        oscs.push(o);
      }
      // 延迟出现的颤音
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 5.6;
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0, t);
      lfoGain.gain.linearRampToValueAtTime(14, t + 0.5);
      lfo.connect(lfoGain);
      oscs.forEach((o) => lfoGain.connect(o.detune));
      lfo.start(t);
      oscs.push(lfo);

      const mix = ctx.createGain();
      mix.gain.value = 2.4;
      for (const [freq, q, amp] of [
        [800, 9, 1],
        [1200, 12, 0.7],
        [2900, 14, 0.45],
      ] as const) {
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = freq;
        bp.Q.value = q;
        const bg = ctx.createGain();
        bg.gain.value = amp;
        src.connect(bp).connect(bg).connect(mix);
      }
      mix.connect(g).connect(this.out!);
      return () => {
        release();
        this.stopLater(oscs, stopAt.t);
      };
    },
  };
}

export const engine = new Engine();
