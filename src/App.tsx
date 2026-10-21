import { About } from "@/components/About";
import { Cards } from "@/components/Cards";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import Synth from "@/components/Synth";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <div id="top" />
      <div className="grain" aria-hidden />
      <Header />
      <main>
        <Hero />
        <div className="relative px-5 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[min(90vw,720px)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--miku)_16%,transparent),transparent_68%)]"
          />
          <Synth />
        </div>
        <Cards />
        <Marquee />
        <About />
        <Contact />
      </main>
      <Footer />
      <Toaster />
    </TooltipProvider>
  );
}
