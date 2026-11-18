import { useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import GradientASCII from "@/components/GradientASCII";
import GradientASCII2D from "@/components/GradientASCII2D";
import type { GradientASCIIProps } from "@/components/GradientASCII";
import { TaskConsole } from "@/components/task-console";
import { Button } from "@/components/ui/button";

const asciiProps: GradientASCIIProps = {
  colors: ["#05070d", "#0a1636", "#1645a5", "#3f83ff", "#a9cbff"],
  characters: " =+xX0S8#@",
  cellSize: 16,
  density: 0.85,
  glyphOpacity: 1,
  glow: 0.28,
  flicker: 0.15,
  softness: 0.7,
  scale: 1.1,
  flow: 0.4,
  speed: 0.6,
  gradientOpacity: 0.95,
  grain: 0.05,
  mouseInteraction: true,
  clickEffect: "wave",
  intro: true,
};

export function Hero() {
  // Client-only app, so probing WebGL2 during the first render is safe.
  const [hasWebGL2] = useState(() =>
    Boolean(document.createElement("canvas").getContext("webgl2"))
  );

  return (
    <section
      id="home"
      className="relative isolate overflow-hidden pb-20 pt-36 sm:pt-40"
    >
      {/* Last-resort CSS texture in case both canvas renderers are unavailable. */}
      {!hasWebGL2 && (
        <div className="hero-texture-fallback pointer-events-none absolute inset-0 -z-30" />
      )}

      {/* GradientASCII in the user's black → dark blue → lighter blue ramp.
          WebGL2 browsers get the shader version; everything else gets the
          Canvas 2D replica with the same field, palette and glyph ramp. */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        {hasWebGL2 ? (
          <GradientASCII {...asciiProps} shape="horizon" />
        ) : (
          <GradientASCII2D {...asciiProps} />
        )}
      </div>

      {/* Only a light wash behind the copy so the texture stays visible. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background via-background/55 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center sm:px-6">
        <h1 className="hero-in hero-in-2 mx-auto mt-2 max-w-4xl text-balance text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-[76px]">
          Give it a repo.
          <br />
          <span className="text-gradient-mono">Get a pull request.</span>
        </h1>

        <p className="hero-in hero-in-3 mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-neutral-300 [text-shadow:0_2px_16px_rgba(0,0,0,0.9)] sm:text-lg">
          Beru takes a GitHub link and a plain-English task, works inside an
          isolated sandbox, and ships a review-ready PR. You describe the change
          it handles the rest.
        </p>

        <div className="hero-in hero-in-4 mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="h-11 rounded-full px-6">
            <Link to="/signup">
              Start building free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 rounded-full px-6 bg-background/40"
          >
            <a href="#how-it-works">
              <Play className="size-3.5 fill-current" />
              See how it works
            </a>
          </Button>
        </div>

        <p className="hero-in hero-in-5 mx-auto mt-5 inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 rounded-full border border-white/10 bg-black/50 px-4 py-1.5 font-mono text-[11px] text-neutral-300 backdrop-blur-sm sm:text-xs">
          No credit card required <span className="text-white/25">·</span>{" "}
          Scoped GitHub App access <span className="text-white/25">·</span>{" "}
          Sandboxed by default
        </p>

        <TaskConsole className="hero-in hero-in-6 mx-auto mt-14 max-w-3xl text-left sm:mt-16" />
      </div>
    </section>
  );
}
