// app/layout.tsx
"use client"; // <--- This directive makes the component a client component

import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation"; // <--- Added this import
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Chatbot from "@/components/chatbot";
import PWAInstaller from "@/components/pwa-installer";
import OfflineBanner from "@/components/offline-banner";
import RegisterServiceWorker from "./register-sw";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/authContext";

const inter = Inter({ subsets: ["latin"] });

// Removed export const metadata and export const viewport from this client component.
// Metadata and Viewport exports are only allowed in server components in Next.js App Router.
// If you need global metadata, define it in a separate server layout or a top-level layout.ts file.


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // <--- Get the current path

  // Define routes where the footer should be hidden
  const hideFooterRoutes = ['/chat']; // Add '/chat' to hide footer on chat page

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
              {/* Conditionally render the Footer */}
              {!hideFooterRoutes.includes(pathname) && <Footer />} {/* <--- Modified line */}
              <Chatbot />
              <PWAInstaller />
              <OfflineBanner />
              <RegisterServiceWorker />
              <Toaster />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
