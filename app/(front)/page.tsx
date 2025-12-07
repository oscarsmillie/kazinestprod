import { Hero } from "@/components/front-pages/hero"
import { ValuePropositions } from "@/components/front-pages/value-propositions"
import { FeaturesGrid } from "@/components/front-pages/features-grid"
import { AboutSection } from "@/components/front-pages/about-section"
import { ToolsSection } from "@/components/front-pages/tools-section"
import { Testimonials } from "@/components/front-pages/testimonials"
import { CTASection } from "@/components/front-pages/cta-section"

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ValuePropositions />
      <FeaturesGrid />
      <AboutSection />
      <ToolsSection />
      <Testimonials />
      <CTASection />
    </main>
  )
}
