import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Chatbot from "@/components/chatbot"
import PWAInstaller from "@/components/pwa-installer"
import OfflineBanner from "@/components/offline-banner"
import RegisterServiceWorker from "./register-sw"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "APT-TECH Connect | Student-Expert Engagement Platform",
  description: "Connect with industry professionals, resolve doubts, and build your career with APT-TECH experts",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Chatbot />
            <PWAInstaller />
            <OfflineBanner />
            <RegisterServiceWorker />
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
