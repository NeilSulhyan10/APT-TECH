import { Button } from "@/components/ui/button"
import { UserPlus, CalendarCheck } from "lucide-react"
import Link from "next/link"

export default function CallToAction() {
  return (
    <section className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground py-16">
      <div className="container px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Ready to Transform Your <span className="text-yellow-300">Campus Recruitment</span> Journey?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of students who have cracked top MNCs with APT-TECH's expert guidance.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link href="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-medium">
              <UserPlus className="mr-2 h-5 w-5" />
              Sign Up for Free
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="outline" className="border-white/20 bg-white/10 hover:bg-white/20">
              <CalendarCheck className="mr-2 h-5 w-5" />
              Book Demo Session
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
