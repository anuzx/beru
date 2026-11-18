import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { SpotlightNavbar } from "@/components/ui/spotlight-navbar"

const navItems = [
  { label: "Home", href: "#home" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
]

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-start gap-4 px-4 sm:px-6">
        <SpotlightNavbar
          items={navItems}
          className="hidden w-full md:flex"
          actions={
            <>
              <Button asChild variant="ghost" size="sm" className="h-8 rounded-full px-3 text-xs">
                <Link to="/signin">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="h-8 rounded-full px-4 text-xs">
                <Link to="/signup">Get started</Link>
              </Button>
            </>
          }
        />

        <div className="mx-auto flex items-center gap-2 pt-6 sm:pt-8 md:hidden">
          <Button asChild variant="ghost" size="sm" className="h-8 rounded-full px-3 text-xs">
            <Link to="/signin">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="h-8 rounded-full px-3.5 text-xs">
            <Link to="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
