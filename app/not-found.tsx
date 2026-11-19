import Link from "next/link"

import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main id="main" className="container flex flex-1 flex-col justify-center px-4 py-20 md:px-6">
        <p className="text-sm text-muted-foreground">Error 404</p>
        <h1 className="font-display mt-2 text-5xl md:text-6xl">This page does not exist</h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
          The link may be old or mistyped. Try the start page or browse the projects.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/">Go to the start page</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/projects">See projects</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
