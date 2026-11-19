import { ChevronRight } from "lucide-react"
import { Collapsible } from "radix-ui"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"

export type TraceStatus = "running" | "error"

/* ------------------------------------------------------------------ layout */

export function Trace({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex w-full flex-col gap-1 text-sm", className)} {...props} />
}

export function TraceLine({
  status,
  className,
  ...props
}: ComponentProps<"div"> & { status?: TraceStatus }) {
  return (
    <div
      data-status={status}
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-xs text-neutral-400",
        status === "running" && "text-neutral-100",
        status === "error" && "text-red-400",
        className,
      )}
      {...props}
    />
  )
}

export function TraceIcon({ className, children, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-4 shrink-0 place-items-center [&_svg]:size-3.5",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export function TraceTitle({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "min-w-0 flex-1 truncate text-left text-xs font-medium text-neutral-300",
        className,
      )}
      {...props}
    />
  )
}

/* ------------------------------------------------------------- collapsible */

export function TraceCollapsible({
  className,
  ...props
}: ComponentProps<typeof Collapsible.Root>) {
  return <Collapsible.Root className={cn("w-full", className)} {...props} />
}

export function TraceCollapsibleTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof Collapsible.Trigger>) {
  return (
    <Collapsible.Trigger
      className={cn(
        "group flex w-full min-w-0 items-center gap-1 rounded-xs text-left transition-colors",
        "hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500",
        className,
      )}
      {...props}
    >
      {children as ReactNode}
      <ChevronRight
        aria-hidden="true"
        className="mr-1 size-3 shrink-0 text-neutral-600 transition-transform group-data-[state=open]:rotate-90"
      />
    </Collapsible.Trigger>
  )
}

export function TraceCollapsibleContent({
  className,
  ...props
}: ComponentProps<typeof Collapsible.Content>) {
  return (
    <Collapsible.Content
      className={cn(
        "overflow-hidden pl-8 pr-2 pb-2 text-xs leading-relaxed text-neutral-500",
        "data-[state=closed]:hidden",
        className,
      )}
      {...props}
    />
  )
}

export default Trace