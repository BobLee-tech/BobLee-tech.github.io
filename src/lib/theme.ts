import { useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const read = (): Theme => (document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);

  /** 从点击的位置圆形展开新主题（支持 View Transitions 的浏览器），其余浏览器直接切换 */
  const toggle = useCallback((origin?: { x: number; y: number }) => {
    const next: Theme = read() === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.setAttribute("data-theme", next);
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#191918" : "#f7f5ef");
      try {
        localStorage.setItem("theme", next);
      } catch {
        /* 隐私模式下可能不可用 */
      }
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (origin) {
      document.documentElement.style.setProperty("--tx", `${origin.x}px`);
      document.documentElement.style.setProperty("--ty", `${origin.y}px`);
    }
    if (!document.startViewTransition || reduce) apply();
    else document.startViewTransition(apply);
  }, []);

  return { theme, toggle };
}
