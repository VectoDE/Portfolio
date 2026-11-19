import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { CareerTimeline } from "@/components/career-timeline"
import { CertificatesShowcase } from "@/components/certificates-showcase"
import { SkillsShowcase } from "@/components/skills-showcase"
import { Portrait } from "@/components/portrait"
import { SectionHeading } from "@/components/section-heading"
import { profile } from "@/lib/content"

export const metadata: Metadata = {
  title: "About",
  description:
    "Tim Hauke is a self-taught full-stack developer from Itzehoe and founder of UplyTech. Career, stack, certificates and how to reach him.",
  alternates: { canonical: "/about" },
  openGraph: { type: "profile", url: "/about" },
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />

      <main id="main" className="flex-1">
        <section className="container px-4 py-12 md:px-6 md:py-20">
          <div className="grid gap-12 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-16 lg:grid-cols-[minmax(0,24rem)_1fr]">
            <div className="mx-auto w-full max-w-[16rem] md:max-w-none">
              <div className="inspector-frame">
                <Portrait
                  sizes="(min-width: 1024px) 384px, (min-width: 768px) 320px, 256px"
                  className="aspect-[4/5] bg-white"
                />
                <span className="inspector-handle" aria-hidden="true" />
              </div>
            </div>
            <div className="max-w-2xl">
              <h1 className="font-display text-5xl md:text-6xl">About me</h1>
              <div className="mt-6 space-y-4 text-lg leading-relaxed">
                {profile.about.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <dl className="mt-10 grid gap-x-8 gap-y-5 border-t pt-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Based in</dt>
                  <dd className="mt-1 font-medium">{profile.location}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Languages</dt>
                  <dd className="mt-1 font-medium">{profile.languages.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Education</dt>
                  {profile.education.map((entry) => (
                    <dd key={entry.title} className="mt-1 font-medium">
                      {entry.title}, {entry.institution} ({entry.period})
                    </dd>
                  ))}
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Open to</dt>
                  <dd className="mt-1 font-medium">{profile.availability}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section id="career" aria-labelledby="career-heading" className="border-t bg-card">
          <div className="container px-4 py-16 md:px-6 md:py-24">
            <SectionHeading
              id="career-heading"
              title="Career"
              description="Projects, clubs and teams since 2017."
            />
            <div className="mt-10">
              <CareerTimeline />
            </div>
          </div>
        </section>

        <section id="stack" aria-labelledby="stack-heading" className="border-t">
          <div className="container px-4 py-16 md:px-6 md:py-24">
            <SectionHeading
              id="stack-heading"
              title="Stack"
              description="Everything here is in my own code, public or private. Outlined entries are my first choice on client work."
            />
            <div className="mt-10">
              <SkillsShowcase />
            </div>
          </div>
        </section>

        <section
          id="certificates"
          aria-labelledby="certificates-heading"
          className="border-t bg-card"
        >
          <div className="container px-4 py-16 md:px-6 md:py-24">
            <SectionHeading
              id="certificates-heading"
              title="Certificates"
              description="Online courses from freeCodeCamp, LinkedIn Learning and Programming Hub. Where a course offers a public check, the link goes there; otherwise it opens the PDF."
            />
            <div className="mt-10 max-w-4xl">
              <CertificatesShowcase limit={0} />
            </div>
          </div>
        </section>

        <section aria-labelledby="contact-heading" className="border-t">
          <div className="container flex flex-col gap-6 px-4 py-16 md:flex-row md:items-end md:justify-between md:px-6 md:py-24">
            <div className="max-w-2xl">
              <h2 id="contact-heading" className="font-display text-4xl md:text-5xl">
                Get in touch
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                {profile.contact.note}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/contact">Write a message</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/projects">See projects</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
