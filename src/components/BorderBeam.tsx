/** 移植自 Magic UI 的 Border Beam：一道光沿着边框跑一圈 */
export function BorderBeam({ duration = 9, size = 110 }: { duration?: number; size?: number }) {
  return (
    <div
      className="border-beam"
      style={{ "--beam-size": `${size}px`, "--beam-duration": `${duration}s` } as React.CSSProperties}
      aria-hidden
    />
  );
}
