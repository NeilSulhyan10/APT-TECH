"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, User } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import Image from "next/image"
import MobileNav from "./mobile-nav"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname()

  const routes = [
    { href: "/", label: "Home" },
    { href: "/forums", label: "Forums" },
    { href: "/experts", label: "Experts" },
    { href: "/qa-sessions", label: "Q&A Sessions" },
    { href: "/resources", label: "Resources" },
    { href: "/mentorship", label: "Mentorship" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/apt-tech-logo.png" alt="APT-TECH Logo" width={40} height={40} className="h-10 w-auto" />
            <span className="font-bold text-xl hidden sm:inline-block">
              <span className="text-black dark:text-white">APT</span>
              <span className="text-blue-600">TECH</span>
              <span className="text-xs block text-muted-foreground -mt-1">Campus Recruitment Training</span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => {
            const isActive = pathname === route.href
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {route.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Link href="/login" className="hidden md:block">
            <Button variant="outline" size="sm" className="gap-1">
              <User className="h-4 w-4" />
              <span>Login</span>
            </Button>
          </Link>
          <Link href="/register" className="hidden md:block">
            <Button size="sm" className="gap-1">
              <BookOpen className="h-4 w-4" />
              <span>Register</span>
            </Button>
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
