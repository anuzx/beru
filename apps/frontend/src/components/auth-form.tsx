import { ArrowRight, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { Brand } from "@/components/brand"
import { GithubIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface AuthFormProps {
  mode: "signin" | "signup"
}

export function AuthForm({ mode }: AuthFormProps) {
  const isSignUp = mode === "signup"

  return (
    <main className="relative flex min-h-svh bg-background">
      <div className="flex w-full flex-col px-5 py-6 sm:px-8 lg:w-[54%]">
        <Brand />

        <div className="flex flex-1 items-center justify-center py-14">
          <Card className="w-full max-w-md border-border/70 bg-card/70 backdrop-blur-xl">
            <CardHeader className="space-y-2.5 text-center">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                {isSignUp ? "Create your account" : "Welcome back"}
              </CardTitle>
              <CardDescription>
                {isSignUp
                  ? "Start shipping changes with your autonomous coding agent."
                  : "Sign in to pick up where your agents left off."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Button
                variant="outline"
                size="lg"
                type="button"
                className="h-11 w-full gap-3 bg-background/40 text-sm font-medium"
              >
                <GithubIcon className="size-[18px]" />
                {isSignUp ? "Sign up with GitHub" : "Sign in with GitHub"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/70" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Secure OAuth via GitHub
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-background/40 p-3.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Beru only requests access to repositories you explicitly choose. Tokens are short-lived
                  and revoked after every run.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="pb-4 text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "New to Beru?"}{" "}
          <Link
            to={isSignUp ? "/signin" : "/signup"}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            {isSignUp ? "Sign in" : "Create an account"}
            <ArrowRight className="size-3" />
          </Link>
        </p>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-border/60 lg:block lg:w-[46%]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,hsl(var(--primary)/0.2),transparent_70%)]" />
        <div className="absolute inset-0 bg-grid opacity-[0.18]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />

        <div className="relative flex h-full flex-col justify-center px-14 xl:px-20">
          <div className="max-w-md">
            <p className="eyebrow font-mono text-xs uppercase tracking-[0.2em] text-primary">Autonomous by design</p>
            <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
              Describe the task. Review the diff. Merge.
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Beru runs in an isolated sandbox, keeps its own context, and opens a clean pull request —
              without touching your local machine.
            </p>

            <div className="mt-9 rounded-2xl border border-border/70 bg-card/70 p-5 font-mono text-xs backdrop-blur-xl">
              <p className="text-muted-foreground">
                <span className="text-primary">$</span> beru run --repo acme/api
              </p>
              <p className="mt-3 text-foreground/80">&nbsp;&nbsp;✓ sandbox ready</p>
              <p className="mt-1.5 text-foreground/80">&nbsp;&nbsp;✓ 3 files changed</p>
              <p className="mt-1.5 text-primary">&nbsp;&nbsp;✓ PR #482 opened</p>
            </div>
          </div>
        </div>
      </aside>
    </main>
  )
}
