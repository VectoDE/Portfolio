"use client"

import type { ReactNode } from "react"

import { NextAuthProvider } from "@/components/next-auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { PageViewTracker } from "@/components/page-view-tracker"
import { CookieBanner } from "@/components/cookie-banner"
import { Logger } from "@/components/logger"
import { RealtimeProvider } from "@/components/realtime-provider"
import { Toaster } from "@/components/ui/toaster"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <NextAuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <Logger />
        <PageViewTracker />
        <RealtimeProvider>{children}</RealtimeProvider>
        <Toaster />
        <CookieBanner />
      </ThemeProvider>
    </NextAuthProvider>
  )
}
