import { ArrowUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="mx-auto mt-24 w-full max-w-[720px] px-5 sm:px-6">
      <div className="flex items-center justify-between border-t border-line py-7 font-mono text-[12px] text-muted">
        <span>© 2026 Bob Lee</span>
        <a href="#top" className="group inline-flex items-center gap-1.5 transition-colors hover:text-fg">
          回到顶部
          <ArrowUp className="size-3.5 transition-transform group-hover:-translate-y-0.5" />
        </a>
      </div>
    </footer>
  );
}
