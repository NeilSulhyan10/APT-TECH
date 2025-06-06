import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Chatbot from "@/components/chatbot";
import PWAInstaller from "@/components/pwa-installer";
import OfflineBanner from "@/components/offline-banner";
import RegisterServiceWorker from "./register-sw";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "APT-TECH Connect | Student-Expert Engagement Platform",
  description:
    "Connect with industry professionals, resolve doubts, and build your career with APT-TECH experts",
  manifest: "/manifest.json",
  generator: "v0.dev",
};

// Move viewport and themeColor to generateViewport
export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <AuthProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <Chatbot />
              <PWAInstaller />
              <OfflineBanner />
              <RegisterServiceWorker />
              <Toaster />
            </AuthProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
