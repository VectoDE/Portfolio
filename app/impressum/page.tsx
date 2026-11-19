import type { Metadata } from "next"
import Link from "next/link"

import { operatorFromEnv } from "@/lib/impressum.mjs"
import { pageMetadata } from "@/lib/seo"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { AnimatedSection } from "@/components/animated-section"
import { AnimatedList } from "@/components/animated-list"

export const metadata: Metadata = pageMetadata({
  title: "Impressum",
  description: "Anbieterkennzeichnung für die Website von Tim Hauke.",
  path: "/impressum",
})

const operator = operatorFromEnv(process.env)

// Stand der Rechtstexte.
const UPDATED = "19. November 2026"

const sections = [
  {
    title: "Haftung für Inhalte",
    text: "Ich erstelle die Inhalte dieser Website mit Sorgfalt, kann für Richtigkeit, Vollständigkeit und Aktualität aber keine Gewähr übernehmen. Für eigene Inhalte bin ich nach den allgemeinen Gesetzen verantwortlich. Fremde Informationen, die ich übermittle oder speichere, muss ich nach §§ 7 bis 10 DDG nicht überwachen. Sobald ich von einem Rechtsverstoß erfahre, entferne ich den betreffenden Inhalt.",
  },
  {
    title: "Haftung für Links",
    text: "Diese Website verlinkt auf Seiten Dritter, auf deren Inhalte ich keinen Einfluss habe. Verantwortlich ist jeweils deren Anbieter. Wenn mir ein Rechtsverstoß auf einer verlinkten Seite bekannt wird, entferne ich den Link.",
  },
  {
    title: "Urheberrecht",
    text: "Texte, Fotos und Code auf dieser Website stammen von mir, soweit nicht anders angegeben, und unterliegen dem deutschen Urheberrecht. Der Quellcode der Website steht unter der Lizenz, die im Repository VectoDE/Portfolio angegeben ist.",
  },
]

export default function ImprintPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative z-10 flex min-h-screen flex-col">
        <MainNav />
        <main id="main" lang="de" className="flex-1 py-16">
          <AnimatedSection className="container space-y-10 px-4 md:px-6">
            <header className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-wider text-primary">Rechtliche Hinweise</p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Impressum</h1>
              <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">
                Angaben nach § 5 Digitale-Dienste-Gesetz (DDG) und § 18 Abs. 2
                Medienstaatsvertrag (MStV). Ich betreibe diese Website als Privatperson.
              </p>
            </header>

            <article className="space-y-4 rounded-xl border border-border/60 bg-background/80 p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-primary/90">Angaben gemäß § 5 DDG</h2>
              {operator ? (
                <address className="space-y-1 not-italic text-sm text-muted-foreground sm:text-base">
                  <p className="font-medium text-foreground">{operator.name}</p>
                  <p>{operator.street}</p>
                  <p>{operator.postalCity}</p>
                  <p>{operator.country}</p>
                  <p className="pt-3">
                    E-Mail:{" "}
                    <a href={`mailto:${operator.email}`} className="text-primary underline-offset-4 hover:underline">
                      {operator.email}
                    </a>
                  </p>
                  <p>
                    Kontaktformular:{" "}
                    <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
                      /contact
                    </Link>
                  </p>
                </address>
              ) : (
                <p role="note" className="rounded-md border border-destructive/60 p-4 text-sm sm:text-base">
                  Platzhalter: Die Anbieterangaben sind in dieser Umgebung nicht hinterlegt
                  (Umgebungsvariablen IMPRESSUM_NAME, IMPRESSUM_STRASSE, IMPRESSUM_PLZ_ORT und
                  IMPRESSUM_EMAIL). Die veröffentlichte Website zeigt hier Name, Anschrift und
                  E-Mail-Adresse.
                </p>
              )}
            </article>

            <article className="space-y-4 rounded-xl border border-border/60 bg-background/80 p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-primary/90">
                Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                {operator ? `${operator.name}, Anschrift wie oben.` : "Siehe Angaben gemäß § 5 DDG."}
              </p>
            </article>

            <AnimatedList className="space-y-12" initialDelay={0.08}>
              {sections.map((section) => (
                <article
                  key={section.title}
                  className="space-y-4 rounded-xl border border-border/60 bg-background/80 p-6 shadow-sm"
                >
                  <h2 className="text-2xl font-semibold text-primary/90">{section.title}</h2>
                  <p className="text-sm text-muted-foreground sm:text-base">{section.text}</p>
                </article>
              ))}
            </AnimatedList>

            <p className="text-sm text-muted-foreground">Stand: {UPDATED}</p>
          </AnimatedSection>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
