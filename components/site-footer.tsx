"use client"

import Link from "next/link"
import { Github, Linkedin, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"

export function SiteFooter() {
  const handleOpenCookieSettings = () => {
    if (typeof window === "undefined") return
    window.dispatchEvent(new Event("open-cookie-settings"))
  }

  return (
    <footer className="w-full border-t py-6 bg-background/80 backdrop-blur-sm">
      <div className="container flex flex-col gap-4 px-4 md:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Hauknetz. All rights reserved.
          </p>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <Link href="/newsletter" className="hover:text-primary hover:underline underline-offset-4">
              Newsletter
            </Link>
            <Link href="/unsubscribe" className="hover:text-primary hover:underline underline-offset-4">
              Manage Subscription
            </Link>
            <Link href="/register" className="hover:text-primary hover:underline underline-offset-4">
              Join to Comment
            </Link>
            <Link href="/privacy" className="hover:text-primary hover:underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link href="/impressum" className="hover:text-primary hover:underline underline-offset-4">
              Impressum
            </Link>
            <button
              type="button"
              onClick={handleOpenCookieSettings}
              className="text-left hover:text-primary hover:underline underline-offset-4"
            >
              Cookie-Einstellungen
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="https://github.com/VectoDE" target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-purple-600/10 hover:text-purple-600 transition-all duration-300"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Button>
          </Link>
          <Link
            href="https://www.linkedin.com/in/tim-hauke-b3b24b2b5/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-blue-600/10 hover:text-blue-600 transition-all duration-300"
            >
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Button>
          </Link>
          <Link href="mailto:tim.hauke@hauknetz.de">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-cyan-600/10 hover:text-cyan-600 transition-all duration-300"
            >
              <Mail className="h-5 w-5" />
              <span className="sr-only">Email</span>
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  )
}
