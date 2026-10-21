import { motion } from "motion/react";

export function About() {
  return (
    <motion.section
      id="about"
      className="mx-auto w-full max-w-[720px] scroll-mt-24 px-5 sm:px-6"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="mb-6 text-[22px] font-semibold tracking-[-0.02em]">关于我</h2>
      <p className="text-[clamp(30px,7vw,48px)] font-semibold leading-[1.12] tracking-[-0.03em]">
        I like{" "}
        <span className="relative inline-block">
          miku
          <svg className="absolute -bottom-1.5 left-0 h-[0.28em] w-full text-miku" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden>
            <motion.path
              d="M0 5 Q6.25 0 12.5 5 T25 5 T37.5 5 T50 5 T62.5 5 T75 5 T87.5 5 T100 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: 0.4, ease: "easeInOut" }}
            />
          </svg>
        </span>
        .
      </p>
      <p className="mt-5 font-mono text-[12.5px] text-muted">UNSW · CS</p>
    </motion.section>
  );
}
