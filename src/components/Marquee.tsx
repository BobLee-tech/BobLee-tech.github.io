/** 一条慢慢滚动的大字：只放我自己写的那几个词 */
const WORDS = ["CS", "swimming", "anime", "miku"];

export function Marquee() {
  const row = (k: string) => (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={k !== "a"} key={k}>
      {WORDS.map((w) => (
        <span key={w + k} className="flex items-center gap-8">
          <span className="marquee-word">{w}</span>
          <span className="text-miku text-[0.5em] leading-none">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee-wrap relative my-24 overflow-hidden sm:my-28" aria-label="CS、swimming、anime、miku">
      <div className="marquee-track flex w-max text-[clamp(44px,11vw,84px)] font-semibold leading-none tracking-[-0.04em]">
        {row("a")}
        {row("b")}
        {row("c")}
        {row("d")}
      </div>
    </div>
  );
}
