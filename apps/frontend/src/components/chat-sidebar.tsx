import {
  Check,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export interface ChatSession {
  id: string
  title: string
}

export interface ChatSidebarProps {
  /** Sessions shown under "Recent". */
  sessions?: ChatSession[]
  /** Currently open session id (highlighted in the list). */
  activeSessionId?: string | null
  onNewSession?: () => void
  onSelectSession?: (session: ChatSession) => void
  /** Called with the new title once the user confirms the rename. */
  onRenameSession?: (session: ChatSession, title: string) => void
  onDeleteSession?: (session: ChatSession) => void
  /** Collapses the sidebar down to a narrow rail. */
  collapsed?: boolean
  onToggleCollapsed?: () => void
  className?: string
}

const iconButtonClasses = cn(
  "grid place-items-center rounded-xs text-neutral-500 transition-colors",
  "hover:bg-[rgb(38,38,40)] hover:text-white",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500",
)

export function ChatSidebar({
  sessions = [],
  activeSessionId = null,
  onNewSession,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
  collapsed = false,
  onToggleCollapsed,
  className,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState("")

  function startEditing(session: ChatSession) {
    setEditingId(session.id)
    setDraftTitle(session.title)
  }

  function cancelEditing() {
    setEditingId(null)
    setDraftTitle("")
  }

  function commitEditing(session: ChatSession) {
    const title = draftTitle.trim()
    if (title && title !== session.title) onRenameSession?.(session, title)
    cancelEditing()
  }

  return (
    <aside
      aria-label="Chat sessions"
      data-collapsed={collapsed}
      className={cn(
        "flex h-svh shrink-0 flex-col overflow-hidden border-r border-neutral-800 bg-[rgb(20,20,20)] py-4",
        "transition-[width] duration-300 ease-out",
        collapsed ? "w-14 items-center gap-3 px-2" : "w-64 gap-5 px-3",
        className,
      )}
    >
      {collapsed ? (
        <>
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label="Expand sidebar"
            aria-expanded={false}
            className={cn(iconButtonClasses, "size-9")}
          >
            <PanelLeftOpen className="size-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onNewSession}
            aria-label="New session"
            className={cn(
              iconButtonClasses,
              "size-9 border border-neutral-800 bg-[rgb(31,31,32)] text-neutral-300",
            )}
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between px-2 pt-1">
            <h2 className="font-sans text-sm font-semibold tracking-tight text-white">Sessions</h2>

            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label="Collapse sidebar"
              aria-expanded
              className={cn(iconButtonClasses, "size-7")}
            >
              <PanelLeftClose className="size-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={onNewSession}
            className={cn(
              "inline-flex items-center gap-2 rounded-xs border border-neutral-800 bg-[rgb(31,31,32)] px-3 py-2 font-sans text-sm font-medium text-neutral-200 transition-colors",
              "hover:bg-[rgb(38,38,40)] hover:text-white",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500",
            )}
          >
            <Plus className="size-4" aria-hidden="true" />
            New session
          </button>

          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <h3 className="flex items-center gap-2 px-2 font-sans text-xs font-medium tracking-tight text-neutral-400">
              <Clock className="size-3.5" aria-hidden="true" />
              Recent
            </h3>

            {sessions.length === 0 ? (
              <p className="px-2 text-xs text-neutral-600">No sessions yet</p>
            ) : (
              <ul className="flex min-h-0 flex-col gap-1 overflow-y-auto">
                {sessions.map((session) => {
                  const isActive = session.id === activeSessionId
                  const isEditing = session.id === editingId

                  return (
                    <li
                      key={session.id}
                      className={cn(
                        "group flex items-center gap-1 rounded-xs pr-1 transition-colors",
                        isActive ? "bg-neutral-800" : "hover:bg-neutral-900",
                      )}
                    >
                      {isEditing ? (
                        <form
                          onSubmit={(event) => {
                            event.preventDefault()
                            commitEditing(session)
                          }}
                          className="flex flex-1 items-center gap-1 py-1 pl-1"
                        >
                          <input
                            autoFocus
                            value={draftTitle}
                            onChange={(event) => setDraftTitle(event.target.value)}
                            onFocus={(event) => event.currentTarget.select()}
                            onKeyDown={(event) => {
                              if (event.key === "Escape") {
                                event.preventDefault()
                                cancelEditing()
                              }
                            }}
                            onBlur={() => commitEditing(session)}
                            aria-label={`Rename ${session.title}`}
                            className="min-w-0 flex-1 rounded-xs border border-neutral-600 bg-neutral-950 px-2 py-1 font-sans text-sm text-neutral-100 outline-none focus:border-neutral-400"
                          />
                          <button
                            type="submit"
                            aria-label="Save name"
                            className={cn(iconButtonClasses, "size-7 text-neutral-400")}
                          >
                            <Check className="size-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            aria-label="Cancel rename"
                            className={cn(iconButtonClasses, "size-7 text-neutral-400")}
                          >
                            <X className="size-3.5" aria-hidden="true" />
                          </button>
                        </form>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onSelectSession?.(session)}
                            aria-current={isActive ? "true" : undefined}
                            className={cn(
                              "min-w-0 flex-1 truncate rounded-xs px-2 py-2 font-sans text-left text-sm transition-colors",
                              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500",
                              isActive
                                ? "text-white"
                                : "text-neutral-400 group-hover:text-neutral-100",
                            )}
                          >
                            {session.title}
                          </button>

                          <button
                            type="button"
                            onClick={() => startEditing(session)}
                            aria-label={`Rename ${session.title}`}
                            className={cn(
                              iconButtonClasses,
                              "size-7 shrink-0 opacity-0 focus-visible:opacity-100 group-hover:opacity-100",
                            )}
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteSession?.(session)}
                            aria-label={`Delete ${session.title}`}
                            className={cn(
                              iconButtonClasses,
                              "size-7 shrink-0 opacity-0 hover:text-red-400 focus-visible:opacity-100 group-hover:opacity-100",
                            )}
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                          </button>
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </aside>
  )
}

export default ChatSidebar