import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { engine, INSTRUMENTS } from "@/lib/audio";
import { ARROW_L, ARROW_R, bitmapPath, CLEF, ICONS, NOTE_HEAD, textPath } from "@/lib/pixel";

/* ---------- 琴键布局（viewBox 270×150，和参考站同比例） ---------- */

const WHITES = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76];
const WHITE_KEYS = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"];
// 黑键：[midi, 位于第几个白键右侧, 键盘字母]
const BLACKS: [number, number, string][] = [
  [61, 0, "w"],
  [63, 1, "e"],
  [66, 3, "t"],
  [68, 4, "y"],
  [70, 5, "u"],
  [73, 7, "o"],
  [75, 8, "p"],
];

const X0 = 25;
const PITCH = 22;
const KEY_W = 20.4;
const KEY_Y = 61;
const KEY_H = 83;
const BLACK_W = 12.6;
const BLACK_H = 50;

const KEYMAP = new Map<string, number>([
  ...WHITE_KEYS.map((k, i) => [k, WHITES[i]] as [string, number]),
  ...BLACKS.map(([m, , k]) => [k, m] as [string, number]),
]);

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const DIATONIC = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

const noteName = (m: number) => NAMES[m % 12] + (Math.floor(m / 12) - 1);
/** 相对 E4（五线谱最下面一条线）的音阶级数 */
const staffStep = (m: number) => (Math.floor(m / 12) - 1) * 7 + DIATONIC[m % 12] - 30;

const whiteX = (i: number) => X0 + i * PITCH;
const blackX = (i: number) => X0 + (i + 1) * PITCH - BLACK_W / 2 - (PITCH - KEY_W) / 2;
const keyCenter = (midi: number) => {
  const wi = WHITES.indexOf(midi);
  if (wi >= 0) return whiteX(wi) + KEY_W / 2;
  const b = BLACKS.find(([m]) => m === midi)!;
  return blackX(b[1]) + BLACK_W / 2;
};

const whitePath = (x: number, h: number) => {
  const r = 2.6;
  return `M${x} ${KEY_Y}h${KEY_W}v${h - r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(KEY_W - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}z`;
};
const blackPath = (x: number, h: number) => {
  const r = 2.2;
  return `M${x} ${KEY_Y}h${BLACK_W}v${h - r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(BLACK_W - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}z`;
};

/* ---------- 预先算好的像素 path ---------- */

const LCD_X = 25;
const LCD_Y = 8;
const LCD_W = 220;
const LCD_H = 46;

const PLAY_PX = 5.2;
const PLAY = textPath("PLAY", PLAY_PX, 0, 0);
const PLAY_X = (LCD_W - PLAY.width) / 2;
const PLAY_Y = (LCD_H - 7 * PLAY_PX) / 2;

const CLEF_D = bitmapPath(CLEF, 1.3, 6, 11.9);
const HEAD_D = bitmapPath(NOTE_HEAD, 1, -3.5, -2.5);
const SHARP = textPath("#", 0.8, -10.5, -2.8);
const ARROW_L_D = bitmapPath(ARROW_L, 1.5, 116, 18);
const ARROW_R_D = bitmapPath(ARROW_R, 1.5, 182, 18);
const ICON_PX = 2.3;
const ICON_D = Object.fromEntries(
  Object.entries(ICONS).map(([k, v]) => [k, bitmapPath(v, ICON_PX, 141, 9.2)]),
) as Record<string, string>;
const NOTE_TEXT = (name: string) => textPath(name, 1, 0, 0);

const STAFF_Y = [11, 16.5, 22, 27.5, 33];
const STEP_H = 2.75;
const SLOT_X = (i: number) => 34 + i * 13.5;
const SLOTS = 6;

const stepFlicker = (t: number) => Math.floor(t * 4) / 4;

type Particle = { id: number; x: number; glyph: string; dx: number; rot: number };
type ScoreNote = { id: number; midi: number };

export default function Synth() {
  const [started, setStarted] = useState(false);
  const [inst, setInst] = useState(0);
  const [down, setDown] = useState<ReadonlySet<number>>(new Set());
  const [score, setScore] = useState<ScoreNote[]>([]);
  const [bop, setBop] = useState(0);
  const [lastName, setLastName] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  const held = useRef(new Map<string, { midi: number; release: () => void }>());
  const instRef = useRef(inst);
  instRef.current = inst;
  const startedRef = useRef(false);
  const idRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const syncDown = () => setDown(new Set([...held.current.values()].map((v) => v.midi)));

  const start = useCallback(() => {
    if (startedRef.current) return;
    if (!engine.unlock()) return;
    startedRef.current = true;
    setStarted(true);
    // 一个小小的开机和弦，让人知道“声音开了”
    [60, 64, 67].forEach((m, i) =>
      window.setTimeout(() => {
        const r = engine.play(m, "piano");
        window.setTimeout(r, 140);
      }, i * 70),
    );
  }, []);

  const spawn = useCallback((midi: number) => {
    const id = ++idRef.current;
    const glyph = ["♪", "♫", "♩", "♬"][id % 4];
    setParticles((p) => [
      ...p.slice(-8),
      { id, x: keyCenter(midi) / 270, glyph, dx: (Math.random() - 0.5) * 70, rot: (Math.random() - 0.5) * 50 },
    ]);
    const name = noteName(midi);
    setLastName(name);
    setScore((s) => [...s.slice(-(SLOTS - 1)), { id, midi }]);
    setBop((b) => b + 1);
  }, []);

  const press = useCallback(
    (src: string, midi: number) => {
      const cur = held.current.get(src);
      if (cur?.midi === midi) return;
      cur?.release();
      const release = engine.play(midi, INSTRUMENTS[instRef.current].id);
      held.current.set(src, { midi, release });
      syncDown();
      spawn(midi);
    },
    [spawn],
  );

  const lift = useCallback((src: string) => {
    const cur = held.current.get(src);
    if (!cur) return;
    cur.release();
    held.current.delete(src);
    syncDown();
  }, []);

  const cycle = useCallback((dir: 1 | -1) => {
    setInst((i) => (i + dir + INSTRUMENTS.length) % INSTRUMENTS.length);
    setBop((b) => b + 1);
  }, []);

  /* 键盘：A S D F G H J K L ; 和 W E T Y U O P，←/→ 换音色 */
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const k = e.key.toLowerCase();
      const midi = KEYMAP.get(k);
      if (midi !== undefined) {
        if (e.repeat) return;
        if (!startedRef.current) start();
        press("k:" + k, midi);
        e.preventDefault();
      } else if (startedRef.current && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        cycle(e.key === "ArrowLeft" ? -1 : 1);
        e.preventDefault();
      }
    };
    const onUp = (e: KeyboardEvent) => lift("k:" + e.key.toLowerCase());
    const onBlur = () => [...held.current.keys()].forEach(lift);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [press, lift, cycle, start]);

  /* 鼠标 / 触屏：按下、滑过琴键都会发声（多指同时按也可以） */
  const keyAt = (x: number, y: number) =>
    (document.elementFromPoint(x, y) as Element | null)?.closest<SVGGElement>("[data-midi]") ?? null;

  const onPointerDown = (e: React.PointerEvent) => {
    const key = (e.target as Element).closest<SVGGElement>("[data-midi]");
    if (!key || !startedRef.current) return;
    e.preventDefault();
    svgRef.current?.setPointerCapture(e.pointerId);
    press("p:" + e.pointerId, Number(key.dataset.midi));
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const src = "p:" + e.pointerId;
    if (!held.current.has(src)) return;
    const key = keyAt(e.clientX, e.clientY);
    if (key) press(src, Number(key.dataset.midi));
    else lift(src);
  };
  const onPointerUp = (e: React.PointerEvent) => lift("p:" + e.pointerId);

  const onRootKeyDown = (e: React.KeyboardEvent) => {
    if (!startedRef.current && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      start();
    }
  };

  /* 轻微的 3D 倾斜：只在有鼠标的设备上 */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 });
  const sy = useSpring(my, { stiffness: 120, damping: 18 });
  const rotY = useTransform(sx, [-1, 1], [-5, 5]);
  const rotX = useTransform(sy, [-1, 1], [4, -4]);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = rootRef.current?.getBoundingClientRect();
      if (!r) return;
      mx.set(Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2))));
      my.set(Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2))));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  const current = INSTRUMENTS[inst];
  const stepsPaths = useMemo(() => new Map<string, ReturnType<typeof NOTE_TEXT>>(), []);
  const nameText = (n: string) => {
    if (!stepsPaths.has(n)) stepsPaths.set(n, NOTE_TEXT(n));
    return stepsPaths.get(n)!;
  };

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 16, delay: 0.55 }}
        style={{ perspective: 900 }}
      >
        <motion.div
          ref={rootRef}
          className={"synth relative " + (started ? "on" : "")}
          tabIndex={0}
          role="group"
          aria-label="玩具钢琴：点击琴键或使用键盘演奏"
          onKeyDown={onRootKeyDown}
          style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        >
          {/* 飘出来的音符 */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute top-8 text-[22px] leading-none text-miku"
                style={{ left: `${p.x * 100}%`, textShadow: "0 1px 0 color-mix(in srgb, var(--miku) 40%, transparent)" }}
                initial={{ opacity: 0, y: 0, x: 0, scale: 0.6, rotate: 0 }}
                animate={{ opacity: [0, 1, 1, 0], y: -88, x: p.dx, scale: 1, rotate: p.rot }}
                transition={{ duration: 1.5, ease: "easeOut", times: [0, 0.15, 0.6, 1] }}
                onAnimationComplete={() => setParticles((a) => a.filter((q) => q.id !== p.id))}
              >
                {p.glyph}
              </motion.span>
            ))}
          </div>

          <svg
            ref={svgRef}
            viewBox="0 0 270 150"
            width="100%"
            role="presentation"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <defs>
              <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
                <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <pattern id="lcd-grid" width="2.2" height="2.2" patternUnits="userSpaceOnUse">
                <path d="M2.2 0V2.2M0 2.2H2.2" stroke="#2f3d1b" strokeOpacity="0.07" strokeWidth="0.35" fill="none" />
              </pattern>
              <clipPath id="lcd-clip">
                <rect width={LCD_W} height={LCD_H} rx="2.5" />
              </clipPath>
            </defs>

            {/* 机身 */}
            <rect width="270" height="150" rx="13" fill="var(--synth-body)" stroke="var(--synth-ring)" strokeWidth="1.5" />
            <rect width="270" height="150" rx="13" fill="url(#shine)" />

            {/* 绿色像素屏 */}
            <g transform={`translate(${LCD_X} ${LCD_Y})`}>
              <rect width={LCD_W} height={LCD_H} rx="2.5" fill="var(--lcd)" />
              <rect width={LCD_W} height={LCD_H} rx="2.5" fill="url(#lcd-grid)" />
              <g clipPath="url(#lcd-clip)" fill="var(--lcd-ink)" shapeRendering="crispEdges">
                <AnimatePresence mode="wait" initial={false}>
                  {!started ? (
                    <motion.g
                      key="idle"
                      className="lcd-blink"
                      style={{ cursor: "pointer" }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18, ease: stepFlicker }}
                      onClick={start}
                    >
                      <rect width={LCD_W} height={LCD_H} fill="transparent" />
                      <path
                        d={PLAY.d}
                        transform={`translate(${PLAY_X + 1.5} ${PLAY_Y + 1.5})`}
                        opacity="0.22"
                        stroke="var(--lcd-ink)"
                        strokeWidth="1"
                        strokeLinejoin="round"
                      />
                      <path
                        d={PLAY.d}
                        transform={`translate(${PLAY_X} ${PLAY_Y})`}
                        stroke="var(--lcd-ink)"
                        strokeWidth="1"
                        strokeLinejoin="round"
                      />
                    </motion.g>
                  ) : (
                    <motion.g
                      key="live"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, ease: stepFlicker }}
                    >
                      {/* 谱表 */}
                      {STAFF_Y.map((y) => (
                        <rect key={y} x="3" y={y - 0.35} width="102" height="0.8" opacity="0.55" />
                      ))}
                      <path d={CLEF_D} />
                      {score.map((n, i) => {
                        const step = staffStep(n.midi);
                        const y = Math.round(33 - step * STEP_H);
                        const x = Math.round(SLOT_X(i));
                        const up = step < 4;
                        const sharp = NAMES[n.midi % 12].includes("#");
                        return (
                          <motion.g
                            key={n.id}
                            transform={`translate(${x} ${y})`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.12 }}
                          >
                            {step <= -2 && <rect x="-6" y="-0.35" width="12" height="0.8" />}
                            <path d={HEAD_D} />
                            <rect x={up ? 2.5 : -3.5} y={up ? -13 : 0} width="1" height="13" />
                            {sharp && <path d={SHARP.d} />}
                          </motion.g>
                        );
                      })}

                      {/* 当前音名 */}
                      {lastName && (
                        <g transform={`translate(${LCD_W - 2 - nameText(lastName).width * 1.4 - 2} 3)`} opacity="0.75">
                          <path d={nameText(lastName).d} transform="scale(1.4)" />
                        </g>
                      )}

                      {/* 音色切换 */}
                      <g
                        role="button"
                        aria-label="上一个音色"
                        style={{ cursor: "pointer" }}
                        onClick={() => cycle(-1)}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <rect x="108" y="4" width="30" height="38" fill="transparent" />
                        <path d={ARROW_L_D} />
                      </g>
                      <g
                        role="button"
                        aria-label="下一个音色"
                        style={{ cursor: "pointer" }}
                        onClick={() => cycle(1)}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <rect x="176" y="4" width="30" height="38" fill="transparent" />
                        <path d={ARROW_R_D} />
                      </g>
                      <g key={current.id + bop} className="lcd-bop">
                        <path d={ICON_D[current.id]} />
                      </g>
                    </motion.g>
                  )}
                </AnimatePresence>
              </g>
              <rect width={LCD_W} height={LCD_H} rx="2.5" fill="none" stroke="#000" strokeOpacity="0.35" />
              <rect x="0.5" y="0.5" width={LCD_W - 1} height="6" rx="2" fill="#fff" opacity="0.08" />
            </g>

            {/* 琴键底板 */}
            <rect x={X0 - 1.2} y={KEY_Y - 1} width={WHITES.length * PITCH + 0.4} height={KEY_H + 1.5} rx="3" fill="#050505" />

            {/* 白键 */}
            {WHITES.map((m, i) => (
              <g key={m} data-midi={m} className={"synth-key white" + (down.has(m) ? " down" : "")} role="button" aria-label={noteName(m)}>
                <g className="key-body">
                  <path d={whitePath(whiteX(i), KEY_H)} fill="var(--key-edge)" />
                  <path className="face" d={whitePath(whiteX(i), KEY_H - 4)} />
                  <text className="key-letter" x={whiteX(i) + KEY_W / 2} y={KEY_Y + KEY_H - 12}>
                    {WHITE_KEYS[i].toUpperCase()}
                  </text>
                </g>
              </g>
            ))}

            {/* 黑键 */}
            {BLACKS.map(([m, i]) => (
              <g key={m} data-midi={m} className={"synth-key black" + (down.has(m) ? " down" : "")} role="button" aria-label={noteName(m)}>
                <g className="key-body">
                  <path d={blackPath(blackX(i), BLACK_H)} fill="#000" />
                  <path className="face" d={blackPath(blackX(i), BLACK_H - 5)} />
                  <rect x={blackX(i) + 1.6} y={KEY_Y + 1.5} width="1.4" height={BLACK_H - 14} rx="0.7" fill="#fff" opacity="0.1" />
                </g>
              </g>
            ))}
          </svg>
        </motion.div>
      </motion.div>

      {/* 说明文字 */}
      <div className="mt-5 flex min-h-10 flex-col items-center gap-1.5 text-center font-mono text-[11.5px] leading-snug text-muted" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={started ? "on" : "off"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {started ? (
              <>
                点琴键，或按 <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> <kbd>F</kbd>… 弹奏 · 屏幕两侧箭头换音色
              </>
            ) : (
              <>点屏幕上的 PLAY，打开声音</>
            )}
          </motion.p>
        </AnimatePresence>
        {started && (
          <p className="flex items-center gap-2">
            <span className="opacity-60">音色</span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={current.id}
                className="text-fg"
                initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
                transition={{ duration: 0.2 }}
              >
                {current.name}
              </motion.span>
            </AnimatePresence>
            <span className="opacity-40">
              {inst + 1}/{INSTRUMENTS.length}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
