import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { GithubIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { signIn, useSession } from "@/lib/auth-client"
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
  const navigate = useNavigate()
  const { data: session } = useSession()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Already signed in (e.g. back button after OAuth) -> straight to the app.
  useEffect(() => {
    if (session) navigate("/", { replace: true })
  }, [session, navigate])

  async function handleGithubAuth() {
    setError(null)
    setIsRedirecting(true)

    const { error: authError } = await signIn.social({
      provider: "github",
      callbackURL: "/",
    })

    if (authError) {
      setError(authError.message ?? "Could not start GitHub sign in.")
      setIsRedirecting(false)
    }
  }

  return (
    <main className="relative flex min-h-svh flex-col-reverse bg-[rgb(20,20,20)] lg:flex-row">
      <aside className="relative hidden overflow-hidden border-r border-border/60 lg:block lg:w-[46%]">
        {/* Soft, light-grey light wash behind the copy. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_20%,hsl(0_0%_88%/0.10),transparent_70%)]" />
        <div className="absolute inset-0 bg-grid opacity-[0.18]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />

        <div className="relative flex h-full flex-col justify-center px-14 xl:px-20">
          <div className="max-w-md">
            <h2 className="text-balance text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl xl:text-[40px]">
              Your team's autonomous
              <br />
              <span className="text-gradient-mono">software engineer</span>
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Beru runs in the cloud inside an isolated sandbox, tests all the edge cases, and won't stop
              until the PR is ready to merge
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

      <div className="flex w-full flex-col px-5 py-6 sm:px-8 lg:w-[54%]">
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
                disabled={isRedirecting}
                onClick={handleGithubAuth}
                className="h-11 w-full gap-3 bg-background/40 text-sm font-medium"
              >
                <GithubIcon className="size-[18px]" />
                {isRedirecting
                  ? "Redirecting to GitHub…"
                  : isSignUp
                    ? "Sign up with GitHub"
                    : "Sign in with GitHub"}
              </Button>

              {error && (
                <p role="alert" className="text-center text-xs leading-relaxed text-red-400">
                  {error}
                </p>
              )}

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

              <p className="text-center text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "New to Beru?"}{" "}
                <Link
                  to={isSignUp ? "/signin" : "/signup"}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  {isSignUp ? "Sign in" : "Create an account"}
                  <ArrowRight className="size-3" />
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
