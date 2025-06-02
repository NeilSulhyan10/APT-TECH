import Hero from "@/components/hero"
import Features from "@/components/features"
import ExpertDirectory from "@/components/expert-directory"
import ResourceLibrary from "@/components/resource-library"
import UpcomingQA from "@/components/upcoming-qa"
import Testimonials from "@/components/testimonials"
import CallToAction from "@/components/call-to-action"

export default function Home() {
  return (
    <div>
      <Hero />
      <Features />
      <ExpertDirectory />
      <ResourceLibrary />
      <UpcomingQA />
      <Testimonials />
      <CallToAction />
    </div>
  )
}
