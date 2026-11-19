import type { Metadata } from "next"

import { pageMetadata } from "@/lib/seo"
import { Suspense } from "react"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { ProjectsGrid } from "@/components/projects-grid"
import { ProjectsSkeleton } from "@/components/skeletons/projects-skeleton"
import { NewsletterForm } from "@/components/newsletter-form"
import { SectionHeading } from "@/components/section-heading"

export const dynamic = "force-dynamic"

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description:
    "Apps, bots and tools by Tim Hauke, from the cooking app Tellersonne to the Discord bot VectoBeat. Most of them are open source.",
  path: "/projects",
})

export default function ProjectsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />

      <main id="main" className="flex-1">
        <div className="container px-4 py-12 md:px-6 md:py-20">
          <SectionHeading
            as="h1"
            id="projects-title"
            title="Projects"
            description="Most of them started as fixes for my own problems. The open-source ones link to their code."
          />
          <div className="mt-12">
            <Suspense fallback={<ProjectsSkeleton />}>
              <ProjectsGrid />
            </Suspense>
          </div>
        </div>

        <section aria-labelledby="newsletter-heading" className="border-t bg-card">
          <div className="container grid gap-8 px-4 py-16 md:grid-cols-2 md:px-6">
            <div className="max-w-xl">
              <h2 id="newsletter-heading" className="font-display text-3xl md:text-4xl">
                New projects by email
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                I send a short note when a project launches or changes a lot. You can unsubscribe
                with one click.
              </p>
            </div>
            <NewsletterForm showIntro={false} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
