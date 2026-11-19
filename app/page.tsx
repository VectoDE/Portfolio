import type { Metadata } from "next"

import { pageMetadata } from "@/lib/seo"
import { Suspense } from "react"
import Link from "next/link"
import { Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FeaturedProjects } from "@/components/featured-projects"
import { SkillsShowcase } from "@/components/skills-showcase"
import { CertificatesShowcase } from "@/components/certificates-showcase"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { ProjectsSkeleton } from "@/components/skeletons/projects-skeleton"
import { CertificatesShowcaseSkeleton } from "@/components/skeletons/certificates-showcase-skeleton"
import { SiteFAQ } from "@/components/site-faq"
import { Portrait } from "@/components/portrait"
import { SectionHeading } from "@/components/section-heading"
import { profile } from "@/lib/content"

export const metadata: Metadata = pageMetadata({
  title: `${profile.name} | Full-stack developer in Itzehoe`,
  description:
    "Tim Hauke builds websites, web apps, APIs and Discord bots and runs them on his own servers. Founder of UplyTech, coding since 2017.",
  path: "/",
  absoluteTitle: true,
})

export const revalidate = 0

const facts = [
  { term: "Based in", detail: profile.location },
  { term: "Coding since", detail: String(profile.codingSince) },
  { term: "Languages", detail: profile.languages.join(", ") },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />

      <main id="main" className="flex-1">
        <section className="container px-4 pb-16 pt-10 md:px-6 md:pb-24 md:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div className="order-2 max-w-2xl lg:order-1">
              <p className="text-base text-muted-foreground">
                {profile.jobTitle}, {profile.role.charAt(0).toLowerCase() + profile.role.slice(1)}
              </p>
              <h1 className="font-display mt-3 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
                {profile.name}
              </h1>
              <p className="mt-6 text-lg leading-relaxed md:text-xl">{profile.summary}</p>
              <p className="mt-4 leading-relaxed text-muted-foreground">{profile.availability}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/projects">See projects</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">Get in touch</Link>
                </Button>
              </div>
              <dl className="mt-10 grid gap-x-8 gap-y-4 border-t pt-6 sm:grid-cols-3">
                {facts.map((fact) => (
                  <div key={fact.term}>
                    <dt className="text-sm text-muted-foreground">{fact.term}</dt>
                    <dd className="mt-1 font-medium">{fact.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="order-1 mx-auto w-full max-w-[14rem] sm:max-w-xs lg:order-2 lg:max-w-sm">
              <div className="inspector-frame">
                <Portrait
                  priority
                  sizes="(min-width: 1024px) 384px, (min-width: 640px) 320px, 224px"
                  className="aspect-[4/5] bg-white"
                />
                <span className="inspector-handle" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="services-heading" className="border-t bg-card">
          <div className="container px-4 py-16 md:px-6 md:py-24">
            <SectionHeading
              id="services-heading"
              title="What I do"
              description="For companies, clubs and founders."
            />
            <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
              {profile.services.map((service) => (
                <li key={service} className="border-t py-5 leading-relaxed">
                  {service}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="projects-heading" className="border-t">
          <div className="container px-4 py-16 md:px-6 md:py-24">
            <SectionHeading
              id="projects-heading"
              title="Selected projects"
              description="Apps and tools I build and run myself."
              action={{ href: "/projects", label: "All projects" }}
            />
            <div className="mt-10">
              <Suspense fallback={<ProjectsSkeleton />}>
                <FeaturedProjects />
              </Suspense>
            </div>
          </div>
        </section>

        <section aria-labelledby="stack-heading" className="border-t bg-card">
          <div className="container px-4 py-16 md:px-6 md:py-24">
            <SectionHeading
              id="stack-heading"
              title="Day-to-day stack"
              description="What I reach for first on client work."
              action={{ href: "/about#stack", label: "Full stack" }}
            />
            <div className="mt-10">
              <SkillsShowcase levels={["Core"]} />
            </div>
          </div>
        </section>

        <section aria-labelledby="certificates-heading" className="border-t">
          <div className="container px-4 py-16 md:px-6 md:py-24">
            <SectionHeading
              id="certificates-heading"
              title="Latest certificates"
              description="Courses from freeCodeCamp, LinkedIn Learning and Programming Hub."
              action={{ href: "/about#certificates", label: "All certificates" }}
            />
            <div className="mt-10">
              <Suspense fallback={<CertificatesShowcaseSkeleton />}>
                <CertificatesShowcase />
              </Suspense>
            </div>
          </div>
        </section>

        <section aria-labelledby="contact-heading" className="border-t bg-card">
          <div className="container grid gap-8 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:items-end md:px-6 md:py-24">
            <div className="max-w-2xl">
              <h2 id="contact-heading" className="font-display text-4xl md:text-5xl">
                Have a project in mind?
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {profile.contact.note}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Button asChild size="lg">
                <Link href="/contact">Write a message</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={`mailto:${profile.contact.email}`}>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {profile.contact.email}
                </a>
              </Button>
            </div>
          </div>
        </section>

        <SiteFAQ />
      </main>

      <SiteFooter />
    </div>
  )
}
