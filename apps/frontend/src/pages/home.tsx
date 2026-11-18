import { CtaSection } from "@/components/cta-section"
import { Features } from "@/components/features"
import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  )
}
