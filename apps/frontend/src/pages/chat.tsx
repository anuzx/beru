import {
  CircleCheckIcon,
  CircleXIcon,
  LoaderCircleIcon,
  Plus,
  X,
} from "lucide-react"
import { Suspense, lazy, type FormEvent, useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  ApiRequestError,
  fetchMe,
  saveInstallation,
  signOut,
  type AuthUser,
} from "@/api/auth"
import { ChatSidebar, type ChatSession } from "@/components/chat-sidebar"
import { AiPromptBar } from "@/components/ui/ai-prompt-bar"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace"
import { cn } from "@/lib/utils"

// Heavy highlighter bundle — only loaded when a diff actually appears.
const CodeDiffPreview = lazy(() => import("@/components/code-diff-preview"))

interface ChatMessage {
  id: string
  text: string
}

type StepStatus = "pending" | "running" | "done"

interface OrchestrationStep {
  id: string
  label: string
  output?: string
  diff?: { fileName: string; language: string; oldContent: string; newContent: string }
}

const ORCHESTRATION: OrchestrationStep[] = [
  {
    id: "clone",
    label: "Cloning repository",
    output: "git clone git@github.com:anuzx/beru.git → /sandbox/beru",
  },
  {
    id: "sandbox",
    label: "Starting sandbox",
    output: "e2b sandbox ready · node 24 · 4 vCPU · 8 GB RAM",
  },
  {
    id: "read",
    label: "Reading repository",
    output: "indexed 42 files · found apps/frontend, apps/backend, apps/worker",
  },
  {
    id: "edit",
    label: "Applying changes",
    output: "1 file changed · apps/frontend/src/pages/chat.tsx",
    diff: {
      fileName: "apps/frontend/src/pages/chat.tsx",
      language: "typescript",
      oldContent: `export default function Chat() {
  const [prompt, setPrompt] = useState("")

  function handleSubmit(value: string) {
    setPrompt("")
  }

  return <AiPromptBar value={prompt} onValueChange={setPrompt} onSubmit={handleSubmit} />
}`,
      newContent: `export default function Chat() {
  const [prompt, setPrompt] = useState("")
  const [isOrchestrating, setIsOrchestrating] = useState(false)

  function handleSubmit(value: string) {
    setIsOrchestrating(true)
    setPrompt("")
  }

  return (
    <AiPromptBar
      value={prompt}
      onValueChange={setPrompt}
      onSubmit={handleSubmit}
      isLoading={isOrchestrating}
    />
  )
}`,
    },
  },
  {
    id: "verify",
    label: "Running checks",
    output: "tsc --noEmit ✓ · oxlint ✓ · 12 tests passed",
  },
  {
    id: "pr",
    label: "Opening pull request",
    output: "PR #483 opened → github.com/anuzx/beru/pull/483",
  },
]

interface TraceEntry extends OrchestrationStep {
  status: StepStatus
}

const STEP_DELAY = 1100

/**
 * Chat workspace at /chat.
 * Sending a prompt runs the orchestration trace; once a file changes the code
 * diff opens in the right-hand preview panel.
 */
export default function Chat() {
  const [prompt, setPrompt] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [repositories, setRepositories] = useState<string[]>([])
  const [isAddingRepository, setIsAddingRepository] = useState(false)
  const [repositoryInput, setRepositoryInput] = useState("")
  const [trace, setTrace] = useState<TraceEntry[]>([])
  const [isOrchestrating, setIsOrchestrating] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [account, setAccount] = useState<AuthUser | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const handledInstallation = useRef(false)

  const hasStarted = trace.length > 0 || messages.length > 0
  const diff = trace.find((step) => step.diff)?.diff

  // GitHub redirects back here after installation with `?installation_id=...`.
  // Persist it against the signed-in user, then drop it from the URL.
  useEffect(() => {
    const installationId = searchParams.get("installation_id")
    if (!installationId || handledInstallation.current) return
    handledInstallation.current = true

    saveInstallation(installationId)
      .catch((cause) => {
        setNotice(
          cause instanceof ApiRequestError
            ? cause.message
            : "Could not save your GitHub App installation",
        )
      })
      .finally(() => {
        const next = new URLSearchParams(searchParams)
        next.delete("installation_id")
        next.delete("setup_action")
        next.delete("state")
        setSearchParams(next, { replace: true })
      })
  }, [searchParams, setSearchParams])

  // Load the signed-in user (also verifies the stored token).
  useEffect(() => {
    fetchMe()
      .then((result) => setAccount(result.user))
      .catch((cause) => {
        if (cause instanceof ApiRequestError && cause.status === 401) {
          navigate("/signin", { replace: true })
        }
      })
  }, [navigate])

  function handleSignOut() {
    signOut()
    navigate("/signin", { replace: true })
  }

  // Walk the stubbed orchestration once the prompt is sent.
  useEffect(() => {
    if (!isOrchestrating) return

    const timer = setTimeout(() => {
      const runningIndex = trace.findIndex((entry) => entry.status === "running")

      if (runningIndex === -1) {
        setIsOrchestrating(false)
        return
      }

      const nextTrace = trace.map((entry, index) => {
        if (index === runningIndex) return { ...entry, status: "done" as StepStatus }
        if (index === runningIndex + 1) return { ...entry, status: "running" as StepStatus }
        return entry
      })

      setTrace(nextTrace)

      if (runningIndex + 1 >= trace.length) setIsOrchestrating(false)
    }, STEP_DELAY)

    return () => clearTimeout(timer)
  }, [isOrchestrating, trace])

  function resetRun() {
    setTrace([])
    setIsOrchestrating(false)
  }

  function handleSubmit(value: string) {
    setMessages((current) => [...current, { id: crypto.randomUUID(), text: value }])
    setTrace(
      ORCHESTRATION.map((step, index) => ({
        ...step,
        status: index === 0 ? ("running" as StepStatus) : ("pending" as StepStatus),
      })),
    )
    setIsOrchestrating(true)
    setPrompt("")
  }

  function handleNewSession() {
    setMessages([])
    setPrompt("")
    resetRun()

    const session: ChatSession = {
      id: crypto.randomUUID(),
      title: "New session",
    }
    setSessions((current) => [session, ...current])
    setActiveSessionId(session.id)
  }

  function handleRenameSession(session: ChatSession, title: string) {
    setSessions((current) =>
      current.map((item) => (item.id === session.id ? { ...item, title } : item)),
    )
  }

  function handleDeleteSession(session: ChatSession) {
    setSessions((current) => current.filter((item) => item.id !== session.id))

    if (activeSessionId === session.id) {
      setActiveSessionId(null)
      setMessages([])
      setPrompt("")
      resetRun()
    }
  }

  function handleAddRepository(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const repository = repositoryInput.trim()
    if (!repository) return

    setRepositories((current) =>
      current.includes(repository) ? current : [...current, repository],
    )
    setRepositoryInput("")
    setIsAddingRepository(false)
  }

  function handleRemoveRepository(repository: string) {
    setRepositories((current) => current.filter((item) => item !== repository))
  }

  return (
    <div className="flex h-svh overflow-hidden bg-[rgb(20,20,20)] text-foreground">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewSession={handleNewSession}
        onSelectSession={(session) => setActiveSessionId(session.id)}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
        collapsed={isSidebarCollapsed}
        onToggleCollapsed={() => setIsSidebarCollapsed((current) => !current)}
        className="hidden md:flex"
      />

      <main className="flex min-h-0 flex-1 flex-col px-4">
        <div className="flex min-h-14 items-center justify-end gap-3">
          {notice && (
            <p role="alert" className="mr-auto font-mono text-xs text-red-400">
              {notice}
            </p>
          )}

          {account && (
            <span className="font-mono text-xs text-neutral-500">
              @{account.username}
            </span>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-xs border border-neutral-800 bg-[rgb(31,31,32)] px-2.5 py-1 font-sans text-xs text-neutral-300 transition-colors hover:bg-[rgb(38,38,40)] hover:text-white"
          >
            Sign out
          </button>
        </div>

        <div
          className={cn(
            "mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-6 px-1 transition-all duration-500 ease-out",
            hasStarted ? "pb-6 pt-8" : "justify-center pb-10",
          )}
        >
          {hasStarted && (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto pt-6">
              <div className="w-full max-w-xl">
                {messages.at(-1) && (
                  <div className="mb-4 flex justify-end">
                    <p className="max-w-[80%] whitespace-pre-wrap rounded-xs border border-neutral-800 bg-[rgb(31,31,31)] px-3 py-2 text-xs leading-relaxed text-neutral-300">
                      {messages.at(-1)?.text}
                    </p>
                  </div>
                )}

                <Trace>
                  {trace.map((entry) => {
                    const isRunning = entry.status === "running"
                    const isDone = entry.status === "done"

                    const line = (
                      <TraceLine status={isRunning ? "running" : undefined}>
                        <TraceIcon className={isRunning ? "text-neutral-100" : undefined}>
                          {isRunning ? (
                            <LoaderCircleIcon className="animate-spin" />
                          ) : isDone ? (
                            <CircleCheckIcon className="text-neutral-400" />
                          ) : (
                            <CircleXIcon className="text-neutral-700" />
                          )}
                        </TraceIcon>
                        <TraceTitle
                          className={cn(entry.status === "pending" && "text-neutral-600")}
                        >
                          {entry.label}
                        </TraceTitle>
                      </TraceLine>
                    )

                    if (!entry.output) {
                      return <div key={entry.id}>{line}</div>
                    }

                    return (
                      <TraceCollapsible key={entry.id} defaultOpen={isRunning}>
                        <TraceCollapsibleTrigger>
                          {line}
                        </TraceCollapsibleTrigger>
                        <TraceCollapsibleContent className="whitespace-pre-wrap font-mono">
                          {entry.output}
                        </TraceCollapsibleContent>
                      </TraceCollapsible>
                    )
                  })}
                </Trace>
              </div>
            </div>
          )}

          {repositories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {repositories.map((repository) => (
                <span
                  key={repository}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 font-mono text-xs text-neutral-300"
                >
                  {repository}
                  <button
                    type="button"
                    onClick={() => handleRemoveRepository(repository)}
                    aria-label={`Remove ${repository}`}
                    className="text-neutral-500 transition-colors hover:text-neutral-200"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {isAddingRepository && (
            <form
              onSubmit={handleAddRepository}
              className="flex items-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 p-2"
            >
              <input
                autoFocus
                value={repositoryInput}
                onChange={(event) => setRepositoryInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setIsAddingRepository(false)
                }}
                placeholder="owner/repo"
                aria-label="Repository"
                className="flex-1 bg-transparent px-2 py-1.5 font-mono text-sm text-neutral-100 outline-none placeholder:text-neutral-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
              >
                Add
              </button>
            </form>
          )}

          <div className={cn("transition-all duration-500 ease-out", hasStarted && "mt-auto")}>
            <AiPromptBar
              value={prompt}
              onValueChange={setPrompt}
              onSubmit={handleSubmit}
              placeholder="Ask Beru to build features, fix bugs, or work on your code"
              label="Message Beru"
              maxLength={8000}
              minRows={hasStarted ? 2 : 3}
              maxRows={10}
              autoFocus
              isLoading={isOrchestrating}
              className="p-3"
              leading={
                <button
                  type="button"
                  onClick={() => setIsAddingRepository((current) => !current)}
                  aria-label="Add repositories"
                  aria-expanded={isAddingRepository}
                  className={cn(
                    "inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-neutral-500 transition-colors",
                    "hover:bg-neutral-100 hover:text-neutral-900",
                    "dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500",
                  )}
                >
                  <Plus className="size-4" aria-hidden="true" />
                </button>
              }
            />
          </div>
        </div>
      </main>

      {diff && (
        <aside
          aria-label="Change preview"
          className="hidden w-[42%] shrink-0 flex-col border-l border-neutral-800 bg-[rgb(16,16,16)] lg:flex"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
            <h2 className="text-xs font-semibold tracking-tight text-white">Preview</h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              {diff.fileName}
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-3">
            <Suspense
              fallback={
                <p className="font-mono text-xs text-neutral-600">Loading diff…</p>
              }
            >
              <CodeDiffPreview
                fileName={diff.fileName}
                language={diff.language}
                oldContent={diff.oldContent}
                newContent={diff.newContent}
              />
            </Suspense>
          </div>
        </aside>
      )}
    </div>
  )
}