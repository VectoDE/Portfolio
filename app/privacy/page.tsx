import type { Metadata } from "next"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { AnimatedSection } from "@/components/animated-section"
import { AnimatedList } from "@/components/animated-list"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Datenschutzerklärung für das Portfolio von Tim Hauke mit Informationen zur DSGVO, TTDSG und NIS-2 konformen Verarbeitung.",
}

const sections = [
  {
    title: "1. Verantwortlicher",
    content: [
      "Tim Hauke, Hauknetz, 25524 Itzehoe, Deutschland.",
      "E-Mail: tim.hauke@hauknetz.de | Telefon: +49 172 6166860.",
      "Für sämtliche Fragen rund um Datenschutz und Informationssicherheit können Sie sich jederzeit an die oben genannten Kontaktdaten wenden.",
    ],
  },
  {
    title: "2. Allgemeine Hinweise zur Datenverarbeitung",
    content: [
      "Wir verarbeiten personenbezogene Daten ausschließlich gemäß den Vorgaben der Datenschutz-Grundverordnung (DSGVO), des Telekommunikation-Telemedien-Datenschutz-Gesetzes (TTDSG) sowie der einschlägigen Spezialgesetze. Die Verarbeitung erfolgt nur, sofern eine gesetzliche Erlaubnisnorm (Art. 6 Abs. 1 DSGVO) vorliegt.",
      "Technische und organisatorische Maßnahmen (TOM) gemäß Art. 32 DSGVO orientieren sich am anerkannten Stand der Technik, insbesondere den BSI IT-Grundschutz-Bausteinen, den Kontrollen der ISO/IEC 27001 sowie den OWASP Top 10 Richtlinien für Webanwendungen.",
    ],
  },
  {
    title: "3. Bereitstellung der Website und Server-Logs",
    content: [
      "Beim Aufruf dieser Website verarbeitet unser Hosting-Provider automatisch Verbindungsdaten (Browsertyp, Betriebssystem, Referrer-URL, Datum/Uhrzeit des Zugriffs, IP-Adresse).",
      "Die IP-Adresse wird vor der Speicherung mittels SHA-256 Hash (mit optionalem Salt) pseudonymisiert, sodass kein direkter Personenbezug mehr besteht.",
      "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bereitstellung und Sicherheit der Website). Logdaten werden spätestens nach 30 Tagen gelöscht, sofern keine sicherheitsrelevante Auswertung erforderlich ist.",
    ],
  },
  {
    title: "4. Kontaktanfragen",
    content: [
      "Über das Kontaktformular erhobene Daten (Name, E-Mail-Adresse, Betreff, Nachricht) werden ausschließlich zur Bearbeitung Ihrer Anfrage und etwaiger Anschlussfragen verarbeitet.",
      "Die Eingabe des Formulars setzt eine ausdrückliche Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) voraus. Darüber hinaus erfolgt die Verarbeitung zur Durchführung vorvertraglicher Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO).",
      "Nach Abschluss der Anfrage werden die Daten spätestens nach 6 Monaten gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.",
    ],
  },
  {
    title: "5. Newsletter und Nutzerkonten",
    content: [
      "Falls Sie sich für Updates registrieren oder ein Benutzerkonto anlegen, verarbeiten wir Ihre Angaben zur Erfüllung des Vertrages (Art. 6 Abs. 1 lit. b DSGVO).",
      "Sie können Ihre Einwilligung in Marketing-Kommunikation jederzeit widerrufen. Für Pflichtmitteilungen (z. B. Sicherheitsrelevantes) bleibt Art. 6 Abs. 1 lit. c und lit. f DSGVO maßgeblich.",
    ],
  },
  {
    title: "6. Cookies & Tracking nach TTDSG",
    content: [
      "Wir setzen nur essenzielle Cookies, funktionale Einstellungen sowie – nach Ihrer ausdrücklichen Einwilligung – Analyse- und Marketing-Cookies ein.",
      "Nicht-essenzielle Cookies werden erst nach Opt-in über das Cookie-Banner geladen (Art. 6 Abs. 1 lit. a DSGVO i. V. m. § 25 Abs. 1 TTDSG). Die Präferenzen können jederzeit über den Link \"Cookie-Einstellungen\" im Footer geändert werden.",
      "Essenzielle Cookies stützen sich auf § 25 Abs. 2 TTDSG und Art. 6 Abs. 1 lit. f DSGVO, da sie für den Betrieb der Website zwingend erforderlich sind.",
    ],
  },
  {
    title: "7. Analyse der Website",
    content: [
      "Seitenaufrufe werden ausschließlich nach vorheriger Einwilligung ausgewertet. Dabei speichern wir nur pseudonymisierte Informationen (gehashte IP-Adresse, User-Agent, Referrer, aufgerufene URL).",
      "Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Die Auswertung dient der Optimierung des Angebots gemäß OWASP-Empfehlungen zur sicheren Konfiguration.",
      "Daten werden nach 13 Monaten aggregiert und spätestens nach 24 Monaten gelöscht oder anonymisiert.",
    ],
  },
  {
    title: "8. IT-Sicherheit und Meldungen gemäß NIS-2 / IT-Sicherheitsgesetz",
    content: [
      "Wir betreiben ein Informationssicherheits-Managementsystem, das sich an ISO/IEC 27001 und den BSI IT-Grundschutz-Kompendien orientiert.",
      "Sicherheitsvorfälle werden gemäß gesetzlichen Meldepflichten bewertet und – sofern meldepflichtig – unverzüglich an die zuständigen Behörden (z. B. BSI) gemeldet.",
      "Technische Maßnahmen umfassen regelmäßige Penetrationstests, Härtung der Serverkonfiguration, Zugriffsbeschränkungen nach dem Need-to-know-Prinzip, Verschlüsselung ruhender und übertragener Daten sowie kontinuierliches Monitoring.",
    ],
  },
  {
    title: "9. Empfänger und Drittlandtransfers",
    content: [
      "Ihre Daten werden ausschließlich innerhalb der Europäischen Union verarbeitet. Eine Übermittlung in Drittländer findet nicht statt, sofern nicht ausdrücklich angegeben und nur unter Einhaltung der Art. 44 ff. DSGVO.",
      "Externe Dienstleister (z. B. Hosting, E-Mail) wurden datenschutzkonform beauftragt und vertraglich auf Vertraulichkeit, TOMs sowie Datenschutzstandards verpflichtet.",
    ],
  },
  {
    title: "10. Ihre Rechte",
    content: [
      "Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO) sowie Widerspruch (Art. 21 DSGVO).",
      "Sie können erteilte Einwilligungen jederzeit mit Wirkung für die Zukunft widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt unberührt.",
      "Beschwerden richten Sie an die zuständige Aufsichtsbehörde: Unabhängiges Landeszentrum für Datenschutz Schleswig-Holstein (ULD).",
    ],
  },
  {
    title: "11. Pflicht zur Bereitstellung",
    content: [
      "Die Bereitstellung personenbezogener Daten ist für die Nutzung bestimmter Funktionen (z. B. Kontaktformular, Login) erforderlich. Ohne diese Angaben kann der jeweilige Dienst nicht genutzt werden.",
    ],
  },
  {
    title: "12. Automatisierte Entscheidungsfindung",
    content: [
      "Es findet keine automatisierte Entscheidungsfindung einschließlich Profiling gemäß Art. 22 DSGVO statt.",
    ],
  },
  {
    title: "13. Aktualität",
    content: [
      "Diese Datenschutzerklärung wurde zuletzt am 1. Mai 2024 aktualisiert. Wir passen die Inhalte regelmäßig an, sobald neue gesetzliche oder technische Entwicklungen dies erfordern.",
    ],
  },
]

export default function PrivacyPolicyPage() {
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
          <AnimatedSection className="container space-y-10 px-4 md:px-6">
            <header className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-wider text-primary">Rechtliche Hinweise</p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Datenschutzerklärung</h1>
              <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">
                Wir legen großen Wert auf Transparenz und Sicherheit bei der Verarbeitung Ihrer personenbezogenen Daten.
                Nachfolgend informieren wir Sie umfassend über sämtliche Verarbeitungsprozesse im Sinne der DSGVO, des
                TTDSG, der NIS-2-Richtlinie sowie der anerkannten Sicherheitsstandards.
              </p>
            </header>

            <AnimatedList className="space-y-12" initialDelay={0.08}>
              {sections.map((section) => (
                <article
                  key={section.title}
                  className="space-y-4 rounded-xl border border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur"
                >
                  <h2 className="text-2xl font-semibold text-primary/90">{section.title}</h2>
                  <AnimatedList className="space-y-3 text-sm text-muted-foreground sm:text-base" stagger={0.1}>
                    {section.content.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </AnimatedList>
                </article>
              ))}
            </AnimatedList>
          </AnimatedSection>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
