const steps = [
  {
    title: "Connect a repository",
    description:
      "Install the Beru GitHub App, paste a repo link, and describe the issue or feature in plain English.",
  },
  {
    title: "The agent gets to work",
    description:
      "A fresh E2B sandbox clones the repo. Beru reads the code, makes edits, runs commands and iterates until it's done.",
  },
  {
    title: "Review a pull request",
    description:
      "Changes are pushed to a dedicated branch and a PR is opened with a summary of everything the agent did.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative border-t border-border/50 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow font-mono text-xs uppercase tracking-[0.2em] text-primary">How it works</p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            From issue to PR in three steps
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            No local setup, no copy-pasting context. Beru works where your code already lives.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="group relative rounded-2xl border border-border/70 bg-card/50 p-6 transition-colors hover:border-primary/30"
            >
              <span className="font-mono text-xs text-muted-foreground/70">0{index + 1}</span>
              <h3 className="mt-8 text-base font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
