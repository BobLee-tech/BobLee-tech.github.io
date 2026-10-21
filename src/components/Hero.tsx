import { motion } from "motion/react";
import { DotPattern } from "@/components/DotPattern";

type Piece = { t: string; href?: string };

const LINES: Piece[][] = [
  [{ t: "Bob Lee", href: "#about" }, { t: " 在 " }, { t: "UNSW", href: "#cs" }, { t: " 读 CS" }],
  [{ t: "也喜欢 " }, { t: "Miku", href: "#miku" }],
];

export function Hero() {
  let n = 0;
  return (
    <section className="relative px-5 pt-5 sm:px-6 sm:pt-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-[72px] h-[560px] text-fg/[0.13] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_38%,#000_20%,transparent_72%)]"
      >
        <DotPattern />
      </div>

      <h1 className="relative mx-auto max-w-[720px] text-center text-[clamp(28px,7.2vw,46px)] font-semibold leading-[1.18] tracking-[-0.025em]">
        {LINES.map((line, li) => (
          <span key={li} className="block">
            {line.map((p, pi) => {
              const delay = 0.1 + n++ * 0.07;
              const inner = (
                <motion.span
                  className="inline-block whitespace-pre"
                  initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  {p.t}
                </motion.span>
              );
              return p.href ? (
                <a key={pi} href={p.href} className="ul-sweep" style={{ animationDelay: `${delay + 0.45}s` }}>
                  {inner}
                </a>
              ) : (
                <span key={pi}>{inner}</span>
              );
            })}
          </span>
        ))}
      </h1>
    </section>
  );
}
