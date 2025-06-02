"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, Home, MessageSquare, Users, Video, BookOpen, UserPlus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close the mobile menu when the route changes
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const routes = [
    { href: "/", label: "Home", icon: Home },
    { href: "/forums", label: "Forums", icon: MessageSquare },
    { href: "/experts", label: "Experts", icon: Users },
    { href: "/qa-sessions", label: "Q&A Sessions", icon: Video },
    { href: "/resources", label: "Resources", icon: BookOpen },
    { href: "/mentorship", label: "Mentorship", icon: UserPlus },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open mobile menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[300px]">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <div className="font-bold text-xl">
                  <span className="text-black dark:text-white">APT</span>
                  <span className="text-blue-600">TECH</span>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close mobile menu">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <nav className="flex-1 overflow-auto p-4">
            <ul className="space-y-2">
              {routes.map((route) => {
                const isActive = pathname === route.href
                return (
                  <li key={route.href}>
                    <Link
                      href={route.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <route.icon className="h-5 w-5" />
                      <span>{route.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="p-4 border-t">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
