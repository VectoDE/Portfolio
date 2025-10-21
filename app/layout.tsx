"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"

import { NextAuthProvider } from "@/components/next-auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { PageViewTracker } from "@/components/page-view-tracker"
import { CookieBanner } from "@/components/cookie-banner"
import { Logger } from "@/components/logger"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Logger />
            <PageViewTracker />
            {children}
            <Toaster />
            <CookieBanner />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
