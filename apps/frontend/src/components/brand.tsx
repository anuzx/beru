import { Terminal } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

interface BrandProps {
  className?: string
  compact?: boolean
}

export function Brand({ className, compact = false }: BrandProps) {
  return (
    <Link to="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label="Beru home">
      <span className="relative grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Terminal className="size-[18px]" strokeWidth={2.3} />
      </span>
      {!compact && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          beru<span className="text-primary">.</span>
        </span>
      )}
    </Link>
  )
}
