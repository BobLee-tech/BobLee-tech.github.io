import { useId } from "react";

/** 移植自 Magic UI 的 Dot Pattern：背景里一层极淡的点阵 */
export function DotPattern({ className, gap = 22, r = 1 }: { className?: string; gap?: number; r?: number }) {
  const id = useId();
  return (
    <svg className={className} width="100%" height="100%" aria-hidden>
      <defs>
        <pattern id={id} width={gap} height={gap} patternUnits="userSpaceOnUse" x={-1} y={-1}>
          <circle cx={gap / 2} cy={gap / 2} r={r} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
