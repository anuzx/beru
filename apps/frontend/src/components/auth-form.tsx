import { ArrowRight } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  ApiRequestError,
  GITHUB_APP_INSTALL_URL,
  setToken,
  signIn,
  signUp,
} from "@/api/auth"
import { GithubIcon, GoogleIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Signin/signup hit the backend, persist the returned token in localStorage,
   * then route to /chat when the GitHub App is already installed — otherwise
   * hand the browser over to GitHub's installation page. GitHub sends the
   * browser back to /chat with `?installation_id=...`, which /chat stores.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedEmail = email.trim()
    const trimmedUsername = username.trim()

    if (isSignUp ? !trimmedUsername || !trimmedEmail || !password : !trimmedEmail || !password) {
      toast.error(
        isSignUp ? "Enter username, email and password" : "Enter email and password",
      )
      return
    }

    setIsSubmitting(true)

    try {
      const result = isSignUp
        ? await signUp({ email: trimmedEmail, username: trimmedUsername, password })
        : await signIn({ email: trimmedEmail, password })

      setToken(result.token)

      if (result.hasInstallation) {
        navigate("/chat", { replace: true })
        return
      }

      window.location.assign(GITHUB_APP_INSTALL_URL)
    } catch (cause) {
      if (cause instanceof ApiRequestError) {
        // 400 = the payload was rejected (e.g. malformed email), 401 = bad credentials.
        const message =
          cause.status === 400
            ? isSignUp
              ? "Enter a valid email address"
              : "Invalid email or password"
            : cause.message

        toast.error(message)
      } else {
        toast.error("Something went wrong")
      }

      setIsSubmitting(false)
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
                <span className="text-primary">$</span> beru run --repo anuzx/api
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
              {!isSignUp && (
                <CardDescription>Sign in to pick up where your agents left off.</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-5">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      placeholder="octocat"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="h-11 bg-background/40"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11 bg-background/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 bg-background/40"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="h-11 w-full text-sm font-medium"
                >
                  {isSubmitting
                    ? isSignUp
                      ? "Creating account..."
                      : "Signing in..."
                    : isSignUp
                      ? "Create account"
                      : "Sign in"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/70" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  size="lg"
                  type="button"
                  className="h-11 w-full gap-2 bg-background/40 text-sm font-medium"
                >
                  <GithubIcon className="size-[18px]" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  type="button"
                  className="h-11 w-full gap-2 bg-background/40 text-sm font-medium"
                >
                  <GoogleIcon className="size-[18px]" />
                  Google
                </Button>
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
