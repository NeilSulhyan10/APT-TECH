import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
      <div className="container px-4 py-16 md:py-24 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Connect with <span className="text-yellow-300">APT-TECH Experts</span> for Career Success
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-[600px]">
              Get personalized mentorship, resolve doubts in real-time, and access expert resources for your campus
              recruitment journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-yellow-400 text-primary hover:bg-yellow-300 font-medium" asChild>
                <Link href="/register">
                  Join Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/20"
                asChild
              >
                <Link href="/demo">
                  <Play className="mr-2 h-4 w-4" /> Watch Demo
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-sm">Live Q&A Session</span>
              </div>
              <div className="bg-primary-foreground/10 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-600 text-white">SK</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">Mr. Sanir Kittur</p>
                    <p className="text-xs opacity-70">Founder, APT-TECH</p>
                  </div>
                </div>
                <p className="text-sm mb-4">
                  "Today we'll cover advanced Vedic Math techniques for TCS NQT. Remember, speed with accuracy is key!"
                </p>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="bg-primary/30 px-2 py-1 rounded">125 attending</span>
                  <span className="bg-green-500/30 px-2 py-1 rounded">Live Now</span>
                </div>
              </div>
              <div className="bg-primary-foreground/10 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-purple-500 text-white">S</AvatarFallback>
                  </Avatar>
                  <input
                    type="text"
                    placeholder="Ask your question..."
                    className="bg-primary-foreground/10 text-primary-foreground px-3 py-2 rounded-full w-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <Button size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20"></div>
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-400 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
