import type { Metadata } from "next"

import { operatorFromEnv } from "@/lib/impressum.mjs"
import { pageMetadata } from "@/lib/seo"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { AnimatedSection } from "@/components/animated-section"
import { AnimatedList } from "@/components/animated-list"

export const metadata: Metadata = pageMetadata({
  title: "Datenschutzerklärung",
  description:
    "Welche Daten diese Website verarbeitet: Hosting, Kontaktformular, Newsletter, Konten und die optionale Besuchsstatistik.",
  path: "/privacy",
})

const operator = operatorFromEnv(process.env)

const controller = operator
  ? [
      `${operator.name}, ${operator.street}, ${operator.postalCity}, ${operator.country}.`,
      `E-Mail: ${operator.email}. Alternativ erreichen Sie mich über das Kontaktformular.`,
    ]
  : [
      "Platzhalter: Die Angaben zum Verantwortlichen sind in dieser Umgebung nicht hinterlegt (Umgebungsvariablen IMPRESSUM_NAME, IMPRESSUM_STRASSE, IMPRESSUM_PLZ_ORT und IMPRESSUM_EMAIL). Die veröffentlichte Website zeigt hier Name, Anschrift und E-Mail-Adresse.",
    ]

const sections = [
  {
    title: "1. Verantwortlicher",
    content: [
      ...controller,
      "Ich betreibe diese Website als Privatperson. Einen Datenschutzbeauftragten gibt es nicht, weil keine Pflicht dazu besteht.",
    ],
  },
  {
    title: "2. Hosting und Server-Logs",
    content: [
      "Die Website läuft bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA. Bei jedem Aufruf verarbeitet Vercel technisch notwendige Daten: IP-Adresse, Zeitpunkt, aufgerufene Adresse, Referrer und Browserkennung. Ohne diese Daten kann die Seite nicht ausgeliefert und nicht vor Angriffen geschützt werden.",
      "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren, erreichbaren Website). Vercel ist nach eigenen Angaben unter dem EU-US Data Privacy Framework zertifiziert (Art. 45 DSGVO) und nutzt zusätzlich die Standardvertragsklauseln der EU-Kommission. Wie lange Vercel Logdaten aufbewahrt, regelt Vercel selbst.",
    ],
  },
  {
    title: "3. Schutz vor Missbrauch",
    content: [
      "Die Schnittstellen für die Besuchsstatistik und für Fehlermeldungen aus dem Browser begrenzen die Zahl der Anfragen je IP-Adresse. Dafür wird die IP-Adresse für die Dauer des Zeitfensters im Arbeitsspeicher des Servers oder in einem Redis-Zwischenspeicher gehalten und danach automatisch verworfen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (Schutz vor Missbrauch).",
    ],
  },
  {
    title: "4. Kontaktformular",
    content: [
      "Wenn Sie mir schreiben, speichere ich Name, E-Mail-Adresse, Betreff und Nachricht in der Datenbank der Website und bekomme eine Benachrichtigung per E-Mail. Ich nutze die Angaben nur, um Ihre Anfrage zu beantworten.",
      "Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, wenn es um ein mögliches Projekt oder eine Stelle geht, sonst Art. 6 Abs. 1 lit. f DSGVO (Beantwortung Ihrer Nachricht). Ich lösche die Anfrage, wenn sie erledigt ist und keine gesetzliche Aufbewahrungspflicht besteht.",
    ],
  },
  {
    title: "5. Newsletter",
    content: [
      "Für den Newsletter speichere ich Ihre E-Mail-Adresse und die gewählten Themen. Die Anmeldung gilt erst, wenn Sie den Link in der Bestätigungsmail anklicken (Double-Opt-in). Rechtsgrundlage ist Ihre Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO.",
      "Jede Ausgabe enthält einen Abmeldelink. Nach der Abmeldung lösche ich Ihre Adresse aus dem Verteiler.",
    ],
  },
  {
    title: "6. Benutzerkonten",
    content: [
      "Die Anmeldung ist für die Verwaltung der Website gedacht; eine freie Registrierung ist in der Regel abgeschaltet. Für ein Konto speichere ich E-Mail-Adresse, Name, Benutzername und das Passwort als bcrypt-Hash, nie im Klartext. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.",
    ],
  },
  {
    title: "7. E-Mail-Versand",
    content: [
      "Bestätigungen, Benachrichtigungen und der Newsletter gehen über einen SMTP-Dienstleister (Auftragsverarbeiter nach Art. 28 DSGVO) hinaus. Er erhält dafür Empfängeradresse und Inhalt der jeweiligen E-Mail.",
    ],
  },
  {
    title: "8. Speicherung im Browser und Besuchsstatistik",
    content: [
      "Notwendig und immer aktiv: das Sitzungscookie nach einer Anmeldung (ein signiertes Token, gelöscht beim Abmelden oder nach Ablauf), Ihre Wahl zwischen hellem und dunklem Design und Ihre Cookie-Entscheidung (beides im lokalen Speicher des Browsers). Rechtsgrundlage ist § 25 Abs. 2 Nr. 2 TDDDG, weil die Website diese Angaben für die von Ihnen gewünschten Funktionen braucht.",
      "Nur mit Ihrer Einwilligung: eine eigene Besuchsstatistik. Gezählt werden aufgerufene Seite, Referrer, Browserkennung und die IP-Adresse als Hash (SHA-256 mit geheimem Salt); die IP-Adresse selbst wird nicht gespeichert. Die Daten bleiben in der Datenbank dieser Website und gehen an niemanden weiter. Rechtsgrundlage sind § 25 Abs. 1 TDDDG und Art. 6 Abs. 1 lit. a DSGVO.",
      'Ihre Entscheidung gilt 7 Tage, danach fragt die Website erneut. Sie können sie jederzeit über „Cookie-Einstellungen“ im Footer ändern oder widerrufen.',
      "Es gibt keine Werbung, kein Tracking durch Dritte und keine Social-Media-Plugins. Die Schriften sind auf dem eigenen Server eingebunden; beim Laden der Seite geht keine Anfrage an Google oder andere Schriftanbieter.",
    ],
  },
  {
    title: "9. Empfänger",
    content: [
      "Personenbezogene Daten erhalten nur die genannten Dienstleister für Hosting, Datenbank und E-Mail-Versand, jeweils im Rahmen eines Vertrags zur Auftragsverarbeitung. Ich verkaufe keine Daten und gebe sie nicht für Werbung weiter.",
    ],
  },
  {
    title: "10. Ihre Rechte",
    content: [
      "Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f (Art. 21). Eine Einwilligung können Sie jederzeit für die Zukunft widerrufen.",
      "Sie können sich bei einer Datenschutzaufsichtsbehörde beschweren, zum Beispiel beim Unabhängigen Landeszentrum für Datenschutz Schleswig-Holstein (ULD), Holstenstraße 98, 24103 Kiel.",
      "Eine automatisierte Entscheidung oder Profilbildung nach Art. 22 DSGVO findet nicht statt.",
    ],
  },
  {
    title: "11. Stand",
    content: ["19. November 2026."],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative z-10 flex min-h-screen flex-col">
        <MainNav />
        <main id="main" lang="de" className="flex-1 py-16">
          <AnimatedSection className="container space-y-10 px-4 md:px-6">
            <header className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-wider text-primary">Rechtliche Hinweise</p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Datenschutzerklärung
              </h1>
              <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">
                Welche Daten diese Website verarbeitet, wozu und auf welcher Rechtsgrundlage.
              </p>
            </header>

            <AnimatedList className="space-y-12" initialDelay={0.08}>
              {sections.map((section) => (
                <article
                  key={section.title}
                  className="space-y-4 rounded-xl border border-border/60 bg-background/80 p-6 shadow-sm"
                >
                  <h2 className="text-2xl font-semibold text-primary/90">{section.title}</h2>
                  <AnimatedList
                    className="space-y-3 text-sm text-muted-foreground sm:text-base"
                    stagger={0.1}
                  >
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
