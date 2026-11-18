import { Link } from "react-router-dom"
import { Brand } from "@/components/brand"

const currentYear = new Date().getFullYear()

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
        <Brand />
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <Link to="/signin" className="transition-colors hover:text-foreground">
            Sign in
          </Link>
        </nav>
        <p className="font-mono text-xs text-muted-foreground/70">© {currentYear} Beru</p>
      </div>
    </footer>
  )
}
