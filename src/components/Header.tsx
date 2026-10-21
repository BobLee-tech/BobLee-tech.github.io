import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { bitmapPath, FONT } from "@/lib/pixel";
import { useTheme } from "@/lib/theme";

const B = bitmapPath(FONT.B, 3, 0, 0);
const L = bitmapPath(FONT.L, 3, 18, 0);

export function Header() {
  const { theme, toggle } = useTheme();
  return (
    <header className="relative z-20 mx-auto flex h-[72px] w-full max-w-[720px] items-center justify-between px-5 sm:px-6">
      <motion.a
        href="#top"
        aria-label="Bob Lee · 回到顶部"
        className="group block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <svg width="33" height="21" viewBox="0 0 33 21" shapeRendering="crispEdges" className="text-fg">
          {[B, L].map((d, i) => (
            <motion.path
              key={i}
              d={d}
              fill="currentColor"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 300, damping: 16 }}
              className="transition-colors group-hover:text-miku"
            />
          ))}
        </svg>
      </motion.a>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={theme === "dark" ? "切换到浅色" : "切换到深色"}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                {theme === "dark" ? <Sun /> : <Moon />}
              </motion.span>
            </AnimatePresence>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{theme === "dark" ? "浅色" : "深色"}</TooltipContent>
      </Tooltip>
    </header>
  );
}
