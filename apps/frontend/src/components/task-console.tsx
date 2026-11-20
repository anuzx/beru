import { Check, GitBranch, GitPullRequest, LoaderCircle } from "lucide-react"
import { GithubIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

const steps = [
  { text: "Cloning anuzx/payments-api into sandbox", done: true },
  { text: "Reading src/webhooks/stripe.handler.ts", done: true },
  { text: "Running test suite — 1 failing", done: true },
  { text: "Patched idempotency key handling", done: true },
  { text: "Pushed branch agent/job-8f3c2", done: true },
]

export function TaskConsole({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-[0_24px_80px_-24px_hsl(0_0%_0%/0.9),0_0_0_1px_hsl(var(--primary)/0.06)] backdrop-blur-xl",
        className,
      )}
    >
      {/* Window bar */}
      <div className="flex h-11 items-center gap-3 border-b border-border/70 bg-background/40 px-4">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <GithubIcon className="size-3.5" />
          <span className="font-mono">anuzx/payments-api</span>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          Running
        </span>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:p-6">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Task</p>
          <p className="max-w-md text-sm leading-relaxed text-foreground sm:text-[15px]">
            Fix the idempotency bug in the Stripe webhook handler and open a PR with a regression test.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-lg border border-border/70 bg-background/50 px-3 py-2 font-mono text-[11px] text-muted-foreground">
          <LoaderCircle className="size-3.5 animate-spin text-primary" />
          00:01:42
        </div>

        <div className="sm:col-span-2">
          <div className="space-y-2.5 border-t border-border/60 pt-5">
            {steps.map((step) => (
              <div key={step.text} className="flex items-center gap-3 font-mono text-xs sm:text-[13px]">
                <span className="grid size-4 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
                <span className="text-muted-foreground">{step.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-primary/25 bg-primary/[0.07] px-4 py-3">
            <GitPullRequest className="size-4 shrink-0 text-primary" />
            <span className="text-sm font-medium text-foreground">Pull request #482 opened</span>
            <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <GitBranch className="size-3" />
              agent/job-8f3c2
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
