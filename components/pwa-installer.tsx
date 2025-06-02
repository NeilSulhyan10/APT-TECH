"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, WifiOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isOnline, setIsOnline] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check if the user is online
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: "You're back online!",
        description: "You can now access all features of APT-TECH Connect.",
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "You're offline",
        description: "Some features may be limited until you reconnect.",
        variant: "destructive",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [toast])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)

    if (outcome === "accepted") {
      toast({
        title: "Thanks for installing!",
        description: "APT-TECH Connect has been added to your home screen.",
      })
    }
  }

  if (!isOnline) {
    return (
      <div className="fixed bottom-6 left-6 z-40">
        <Button variant="destructive" size="sm" className="rounded-full shadow-lg">
          <WifiOff className="h-4 w-4 mr-2" />
          Offline Mode
        </Button>
      </div>
    )
  }

  if (deferredPrompt) {
    return (
      <div className="fixed bottom-6 left-6 z-40">
        <Button onClick={handleInstallClick} size="sm" className="rounded-full shadow-lg">
          <Download className="h-4 w-4 mr-2" />
          Install App
        </Button>
      </div>
    )
  }

  return null
}
