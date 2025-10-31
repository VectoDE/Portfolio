import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, Mail, MessageCircle, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FeaturedProjects } from "@/components/featured-projects"
import { SkillsShowcase } from "@/components/skills-showcase"
import { CertificatesShowcase } from "@/components/certificates-showcase"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { Card, CardContent } from "@/components/ui/card"
import { ProjectsSkeleton } from "@/components/skeletons/projects-skeleton"
import { CertificatesShowcaseSkeleton } from "@/components/skeletons/certificates-showcase-skeleton"
import { CommunityHighlights } from "@/components/community-highlights"
import { SiteFAQ } from "@/components/site-faq"
import { getEngagementHighlights } from "@/lib/engagement"

export const metadata: Metadata = {
  title: "Full Stack Developer crafting modern web products",
  description:
    "Discover Tim Hauke's professional portfolio featuring production-ready web applications, case studies, technical capabilities, and ways to collaborate.",
  openGraph: {
    title: "Tim Hauke | Full Stack Developer",
    description:
      "Discover production-ready projects, hands-on experience, and direct contact options to work with Tim Hauke on your next web product.",
    url: "/",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
}

export default async function Home() {
  const engagementHighlights = await getEngagementHighlights()

  return (
    <div className="flex flex-col min-h-screen">
      <BackgroundGradientAnimation
        firstColor="rgba(125, 39, 255, 0.2)"
        secondColor="rgba(0, 87, 255, 0.2)"
        thirdColor="rgba(0, 214, 242, 0.2)"
      />

      <div className="relative z-10">
        <MainNav />

        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2 animate-fade-in">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600">
                    Full Stack Developer
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    Building modern web applications with cutting-edge technologies
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-in">
                  <Link href="/projects">
                    <Button className="gap-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300">
                      View Projects <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="gap-1 border-purple-600/50 hover:border-purple-600 transition-all duration-300"
                    >
                      Contact Me <Mail className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30 backdrop-blur-sm">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    My Tech Stack
                  </h2>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    The modern technologies I work with
                  </p>
                </div>
              </div>

              <SkillsShowcase />
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Featured Projects
                  </h2>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    Some of my recent work
                  </p>
                </div>
              </div>

              <Suspense fallback={<ProjectsSkeleton />}>
                <FeaturedProjects />
              </Suspense>

              <div className="mt-12 text-center">
                <Link href="/projects">
                  <Button
                    variant="outline"
                    className="border-purple-600/50 hover:border-purple-600 transition-all duration-300"
                  >
                    View All Projects
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30 backdrop-blur-sm">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Certifications
                  </h2>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    Professional certifications and achievements
                  </p>
                </div>
              </div>

              <Suspense fallback={<CertificatesShowcaseSkeleton />}>
                <CertificatesShowcase />
              </Suspense>

              <div className="mt-12 text-center">
                <Link href="/about">
                  <Button
                    variant="outline"
                    className="border-purple-600/50 hover:border-purple-600 transition-all duration-300"
                  >
                    Learn More About Me
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Let's build something remarkable together
                  </h2>
                  <p className="text-gray-500 md:text-xl dark:text-gray-400">
                    Whether you want to collaborate on a new product, leave feedback on my case studies, or stay informed about future releases, you now have multiple ways to connect.
                  </p>
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="mt-1 h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">Direct contact</h3>
                        <p className="text-sm text-muted-foreground">
                          Reach out instantly via the contact form or email and I will respond within one business day.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <UserPlus className="mt-1 h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">Join the community</h3>
                        <p className="text-sm text-muted-foreground">
                          Create a free account to react to case studies and discuss implementation details with other builders.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Card className="border border-purple-200 dark:border-purple-800 bg-background/60 backdrop-blur-sm shadow-lg">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="text-xl font-semibold">Quick actions</h3>
                      <p className="text-sm text-muted-foreground">
                        Pick the option that fits best—I'm making collaboration and feedback effortless.
                      </p>
                      <div className="grid gap-3">
                        <Link href="/contact">
                          <Button className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300">
                            <Mail className="h-4 w-4" /> Contact Tim
                          </Button>
                        </Link>
                        <Link href="/register">
                          <Button variant="outline" className="w-full gap-2 border-purple-600/50 hover:border-purple-600">
                            <UserPlus className="h-4 w-4" /> Register to comment
                          </Button>
                        </Link>
                        <Link href="/unsubscribe">
                          <Button variant="ghost" className="w-full gap-2 text-primary hover:text-primary">
                            Manage newsletter settings
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          <CommunityHighlights highlights={engagementHighlights} />

          <SiteFAQ />
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
