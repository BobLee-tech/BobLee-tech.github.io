import { useRef } from "react";
import { motion } from "motion/react";

/* ---------- 卡片里的小插画：纯 CSS / SVG，不引用任何外部素材 ---------- */

function ArtCS() {
  return (
    <div className="absolute inset-0 bg-[#121411]">
      <div
        className="absolute inset-0 opacity-[0.5] [background-image:radial-gradient(rgba(207,226,154,0.28)_1px,transparent_1.3px)] [background-size:24px_24px]"
        style={{ animation: "drift 6s linear infinite" }}
      />
      <span className="absolute left-4 top-3.5 font-mono text-[11px] tracking-wide text-[#cfe29a]/55">UNSW</span>
      <span className="absolute right-4 top-3.5 font-mono text-[11px] text-[#cfe29a]/35">{"{ }"}</span>
      <div className="absolute inset-0 flex items-center justify-center font-mono text-[clamp(52px,12vw,76px)] font-bold leading-none tracking-tight text-[#cfe29a]">
        CS
        <span
          className="ml-1 inline-block h-[0.78em] w-[0.42em] translate-y-[0.02em] bg-[#cfe29a]"
          style={{ animation: "caret 1.1s steps(1) infinite" }}
        />
      </div>
    </div>
  );
}

function Wave({ d, color, dur, top }: { d: string; color: string; dur: number; top: string }) {
  return (
    <svg
      className="absolute left-0 h-[48%] w-[200%]"
      style={{ top, animation: `wave-slide ${dur}s linear infinite` }}
      viewBox="0 0 800 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path d={d} fill={color} />
    </svg>
  );
}

function ArtSwim() {
  const w1 = "M0 40 Q50 10 100 40 T200 40 T300 40 T400 40 T500 40 T600 40 T700 40 T800 40 V100 H0Z";
  const w2 = "M0 50 Q50 80 100 50 T200 50 T300 50 T400 50 T500 50 T600 50 T700 50 T800 50 V100 H0Z";
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#e3f1f4] to-[#b9d9e4]">
      {/* 泳道线与浮标 */}
      <div className="absolute inset-x-0 top-[26%] h-px bg-[#0d4b63]/25" />
      <div className="absolute inset-x-0 top-[26%] -translate-y-1/2 [background-image:radial-gradient(circle,#e8554e_3.5px,transparent_4px),radial-gradient(circle,#fff_3.5px,transparent_4px)] [background-position:0_0,14px_0] [background-size:28px_8px] opacity-80" />
      <Wave d={w1} color="rgba(40,140,175,0.28)" dur={9} top="36%" />
      <Wave d={w2} color="rgba(30,120,160,0.34)" dur={6} top="48%" />
      <Wave d={w1} color="rgba(14,90,130,0.55)" dur={4.2} top="62%" />
      <span className="absolute bottom-3 left-4 font-mono text-[11px] tracking-wide text-white/80">swimming</span>
    </div>
  );
}

function ArtAnime() {
  return (
    <div className="absolute inset-0 bg-[#cdb8f0]">
      {/* 网点 + 集中线，漫画味 */}
      <div className="absolute inset-0 [background-image:radial-gradient(#7a4fc2_1.4px,transparent_1.8px)] [background-size:11px_11px] [mask-image:radial-gradient(circle_at_50%_50%,transparent_28%,#000_95%)] opacity-55" />
      <div className="absolute inset-[-40%] opacity-[0.22] [background:repeating-conic-gradient(from_0deg,#4b2a8c_0deg_1.2deg,transparent_1.2deg_7deg)] [mask-image:radial-gradient(circle,transparent_22%,#000_68%)]" style={{ animation: "spin-slow 60s linear infinite" }} />
      <div className="absolute inset-0 flex items-center justify-center text-[clamp(40px,10vw,60px)] font-black leading-none tracking-tight text-[#1e0f3d] [text-shadow:3px_3px_0_#fff,-1px_-1px_0_#fff,3px_-1px_0_#fff,-1px_3px_0_#fff]">
        アニメ
      </div>
      {[
        ["12%", "20%", 0],
        ["84%", "30%", 0.6],
        ["74%", "78%", 1.2],
        ["18%", "76%", 1.8],
      ].map(([l, t, d], i) => (
        <span
          key={i}
          className="absolute text-[16px] text-white [text-shadow:0_0_6px_rgba(255,255,255,0.9)]"
          style={{ left: l as string, top: t as string, animation: `twinkle 2.4s ease-in-out ${d}s infinite` }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

function ArtMiku() {
  const bars = Array.from({ length: 22 }, (_, i) => i);
  return (
    <div className="absolute inset-0 bg-[#39c5bb]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(255,255,255,0.35),transparent_60%)]" />
      <div className="absolute inset-0 flex items-center justify-center text-[clamp(52px,13vw,84px)] font-black tracking-[-0.04em] text-white/90 mix-blend-soft-light">
        MIKU
      </div>
      <div className="absolute inset-x-5 bottom-0 flex h-[72%] items-end justify-between gap-[3px]">
        {bars.map((i) => (
          <span
            key={i}
            className="w-full origin-bottom rounded-t-[2px] bg-[#0b4f4a]/80"
            style={{
              height: `${42 + ((i * 37) % 58)}%`,
              animation: `eq ${0.9 + ((i * 53) % 70) / 50}s ease-in-out ${-((i * 29) % 17) / 10}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const CARDS = [
  { id: "cs", title: "计算机科学", label: "UNSW", Art: ArtCS },
  { id: "swim", title: "游泳", label: "兴趣", Art: ArtSwim },
  { id: "anime", title: "动漫", label: "兴趣", Art: ArtAnime },
  { id: "miku", title: "Miku", label: "喜欢", Art: ArtMiku },
];

function Card({ c, i }: { c: (typeof CARDS)[number]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    ref.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
    ref.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <motion.article
      id={c.id}
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (i % 2) * 0.09, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={ref}
        onPointerMove={onMove}
        className="card-art group relative aspect-[1.9] overflow-hidden rounded-[10px] ring-1 ring-black/5 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)]"
      >
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.045]">
          <c.Art />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(180px_circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,0.22),transparent_70%)]" />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-[17px] font-semibold tracking-[-0.01em]">{c.title}</h3>
        <span className="font-mono text-[12.5px] text-muted">{c.label}</span>
      </div>
    </motion.article>
  );
}

export function Cards() {
  return (
    <section className="mx-auto w-full max-w-[720px] px-5 sm:px-6" aria-labelledby="things">
      <motion.h2
        id="things"
        className="mb-6 text-[22px] font-semibold tracking-[-0.02em]"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        我喜欢的东西
      </motion.h2>
      <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2">
        {CARDS.map((c, i) => (
          <Card key={c.id} c={c} i={i} />
        ))}
      </div>
    </section>
  );
}
