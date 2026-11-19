import { CtaSection } from "@/components/cta-section"
import { Features } from "@/components/features"
import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import Footer from "@/components/shadcn-studio/blocks/footer-component-01/footer-component-01"
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
      <Footer />
    </div>
  )
}
