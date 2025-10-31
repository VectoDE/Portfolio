import type { Metadata } from "next"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung gemäß § 5 TMG und § 55 RStV für das Portfolio von Tim Hauke.",
}

const sections = [
  {
    title: "Angaben gemäß § 5 TMG",
    rows: [
      { label: "Verantwortlich", value: "Tim Hauke" },
      { label: "Unternehmensname", value: "Hauknetz" },
      { label: "Adresse", value: "Ludwig-Braun-Straße 42, 25524 Itzehoe, Deutschland" },
      { label: "Telefon", value: "+49 172 6166860" },
      { label: "E-Mail", value: "tim.hauke@hauknetz.de" },
    ],
  },
  {
    title: "Umsatzsteuer-ID",
    text: "Nicht umsatzsteuerpflichtig nach § 19 UStG (Kleinunternehmerregelung).",
  },
  {
    title: "Aufsichtsbehörde",
    text: "Unabhängiges Landeszentrum für Datenschutz Schleswig-Holstein, Holstenstraße 98, 24103 Kiel, Deutschland.",
  },
  {
    title: "Berufshaftpflicht",
    text: "Eine gesonderte Berufshaftpflichtversicherung ist für die angebotenen Leistungen nicht erforderlich.",
  },
  {
    title: "Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV",
    text: "Tim Hauke, Anschrift wie oben.",
  },
  {
    title: "Haftung für Inhalte",
    text: "Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.",
  },
  {
    title: "Haftung für Links",
    text: "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für diese fremden Inhalte können wir daher keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.",
  },
  {
    title: "Urheberrecht",
    text: "Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.",
  },
  {
    title: "Alternative Streitbeilegung",
    text: "Die EU-Kommission stellt eine Plattform für die außergerichtliche Online-Streitbeilegung (OS-Plattform) bereit: https://ec.europa.eu/consumers/odr. Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
  },
]

export default function ImprintPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <BackgroundGradientAnimation
        firstColor="rgba(125, 39, 255, 0.08)"
        secondColor="rgba(0, 87, 255, 0.08)"
        thirdColor="rgba(0, 214, 242, 0.08)"
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 py-16">
          <section className="container space-y-10 px-4 md:px-6">
            <header className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-wider text-primary">Rechtliche Hinweise</p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Impressum</h1>
              <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">
                Angaben nach dem Telemediengesetz (TMG) und Rundfunkstaatsvertrag (RStV) für den Betreiber dieser Website.
              </p>
            </header>

            <div className="space-y-12">
              {sections.map((section) => (
                <article
                  key={section.title}
                  className="space-y-4 rounded-xl border border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur"
                >
                  <h2 className="text-2xl font-semibold text-primary/90">{section.title}</h2>
                  {section.rows ? (
                    <dl className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 sm:text-base">
                      {section.rows.map((row) => (
                        <div key={row.label} className="flex flex-col">
                          <dt className="font-medium text-foreground/80">{row.label}</dt>
                          <dd>{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-sm text-muted-foreground sm:text-base">{section.text}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
