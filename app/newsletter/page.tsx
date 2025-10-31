import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, Inbox, MailPlus, ShieldCheck, Sparkles, Users } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { NewsletterForm } from "@/components/newsletter-form"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Newsletter Hub",
  description:
    "Subscribe to project updates, manage your notifications, and access an instant unsubscribe link in one place.",
  openGraph: {
    title: "Tim Hauke Newsletter Hub",
    description:
      "Stay up to date with new projects, articles, and behind-the-scenes notes—or manage your subscription in seconds.",
    url: "/newsletter",
  },
  alternates: {
    canonical: "/newsletter",
  },
}

export default function NewsletterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <BackgroundGradientAnimation
        firstColor="rgba(125, 39, 255, 0.2)"
        secondColor="rgba(0, 87, 255, 0.2)"
        thirdColor="rgba(0, 214, 242, 0.2)"
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600">
                    Newsletter Control Center
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    Choose what you receive, try new features early, and unsubscribe instantly—no buried links.
                  </p>
                  <p className="mx-auto max-w-[760px] text-gray-500 md:text-lg dark:text-gray-400">
                    I share behind-the-scenes notes from client projects, reflections on community work in Itzehoe, and early
                    prototypes you can test before public launches. You'll always know who's writing, why it matters, and how to
                    respond.
                  </p>
                </div>
              </div>
              <div className="mt-12 grid gap-8 lg:grid-cols-[2fr_3fr]">
                <Card className="border border-purple-200 dark:border-purple-800 bg-background/60 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-2xl font-semibold">Why subscribe?</h2>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                        <span>Be the first to review new product launches and detailed case studies.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Inbox className="mt-0.5 h-4 w-4 text-primary" />
                        <span>Receive curated roundups—never more than twice per month.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                        <span>One-click unsubscribe and transparent data usage, compliant with GDPR.</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-left text-sm text-muted-foreground">
                      <p className="font-medium text-primary">Already on the list?</p>
                      <p>
                        Every email includes your personal link to manage preferences. Need it again? Follow the steps in the
                        <Link href="/#faq" className="font-medium text-primary underline-offset-4 hover:underline">
                          newsletter FAQ
                        </Link>{" "}
                        or visit the subscription manager directly when you have your token ready.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-purple-200 dark:border-purple-800 bg-background/60 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <NewsletterForm />
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30 backdrop-blur-sm">
            <div className="container px-4 md:px-6">
              <div className="grid gap-8 md:grid-cols-3">
                <Card className="bg-background/80 border border-purple-200 dark:border-purple-800">
                  <CardContent className="p-6 space-y-3">
                    <MailPlus className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold">Choose your updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Opt into project launches, technical deep dives, or business announcements individually.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-background/80 border border-purple-200 dark:border-purple-800">
                  <CardContent className="p-6 space-y-3">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold">Privacy first</h3>
                    <p className="text-sm text-muted-foreground">
                      Your email address is stored securely via Prisma ORM with encrypted credentials.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-background/80 border border-purple-200 dark:border-purple-800">
                  <CardContent className="p-6 space-y-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold">Feedback welcome</h3>
                    <p className="text-sm text-muted-foreground">
                      Reply to any email or use the contact form to shape future topics.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    What subscribers receive
                  </h2>
                  <p className="mx-auto max-w-[760px] text-gray-500 md:text-xl dark:text-gray-400">
                    My emails are intentional, occasional, and crafted to represent the collaborations I'm proud of.
                  </p>
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                  <CardContent className="p-6 space-y-3 text-left">
                    <Sparkles className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold">In-depth breakdowns</h3>
                    <p className="text-sm text-muted-foreground">
                      Discover the decisions behind recent launches, complete with architecture diagrams, accessibility notes,
                      and performance insights.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                  <CardContent className="p-6 space-y-3 text-left">
                    <Users className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold">Community invitations</h3>
                    <p className="text-sm text-muted-foreground">
                      Join beta programmes, office hours, and collaborative sessions where we shape upcoming features together.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
