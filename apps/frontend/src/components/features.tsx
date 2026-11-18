import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    title: "GitHub native",
    description:
      "A scoped GitHub App creates short-lived tokens to clone, push branches and open pull requests.",
  },
  {
    title: "Isolated sandboxes",
    description:
      "Every job runs in its own E2B sandbox and is torn down the moment the agent is finished.",
  },
  {
    title: "Long-running context",
    description:
      "Multi-step reasoning with automatic summarization keeps huge repositories inside the context window.",
  },
  {
    title: "Real tooling",
    description:
      "The agent reads files, runs shell commands, inspects tests and verifies its own changes before pushing.",
  },
  {
    title: "Clean history",
    description:
      "One branch per job, committed with the app's bot identity — your main branch is never touched directly.",
  },
  {
    title: "Least privilege",
    description:
      "Installation tokens are limited to the selected repository and revoked automatically after each run.",
  },
]

export function Features() {
  return (
    <section id="features" className="relative border-t border-border/50 py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.12]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow font-mono text-xs uppercase tracking-[0.2em] text-primary">Built for real repos</p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            An engineer that fits your workflow
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Everything happens through the tools and review process your team already uses.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/70 bg-card/60 transition-colors hover:border-primary/30 hover:bg-card"
            >
              <CardHeader>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
