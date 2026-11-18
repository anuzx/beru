import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="border-t border-border/50 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/60 px-6 py-14 text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.15]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%)]" />
          <div className="relative">
            <p className="eyebrow font-mono text-xs uppercase tracking-[0.2em] text-primary">Get started</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Your next issue could already be a pull request.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
              Connect GitHub, hand Beru a task, and come back to a branch ready for review.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 h-11 rounded-full px-6"
            >
              <Link to="/signup">
                Get started free
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
