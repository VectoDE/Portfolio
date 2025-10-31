import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Award,
  Compass,
  Globe,
  Layers,
  Mail,
  MessageCircle,
  Rocket,
  Sparkles,
  Target,
  UserPlus,
  Users,
} from "lucide-react"

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
import { AnimatedSection } from "@/components/animated-section"
import { AnimatedList } from "@/components/animated-list"
import { HeroVisualizationBlock } from "@/components/hero-visualization-block"

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
  const heroStats = [
    {
      label: "Community builders",
      value: engagementHighlights.memberCount,
    },
    {
      label: "Project reactions",
      value: engagementHighlights.totalReactions,
    },
    {
      label: "Discussion threads",
      value: engagementHighlights.totalComments,
    },
  ]

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
          <AnimatedSection className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
                <div className="order-2 flex flex-col items-start space-y-8 lg:order-1">
                  <div className="space-y-4 text-left">
                    <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                      Purpose-built web products for ambitious teams
                    </span>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400">
                      Modern digital experiences crafted with intent
                    </h1>
                    <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                      I partner with clubs, associations, and ambitious founders to transform ideas into reliable web products
                      that feel personal, perform at scale, and stay easy to maintain long after launch.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <Link href="/projects">
                      <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300">
                        View projects <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button
                        variant="outline"
                        className="gap-2 border-purple-600/50 hover:border-purple-600 transition-all duration-300"
                      >
                        Contact me <Mail className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <AnimatedList className="grid w-full gap-4 sm:grid-cols-3" initialDelay={0.1}>
                    {heroStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-border/60 bg-background/40 p-4 shadow-sm backdrop-blur"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">{stat.label}</p>
                        <p className="mt-2 text-2xl font-semibold">
                          {Intl.NumberFormat("en", { notation: "compact" }).format(stat.value)}
                        </p>
                      </div>
                    ))}
                  </AnimatedList>
                </div>
                <div className="order-1 lg:order-2">
                  <HeroVisualizationBlock />
                </div>
              </div>
            </div>
          </AnimatedSection>

          <section className="w-full py-12 md:py-24 lg:py-32">
            <AnimatedSection delay={0.06} className="container px-4 md:px-6">
              <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:items-start">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Meet the builder behind the work
                  </h2>
                  <p className="text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                    I'm a full stack developer based in Itzehoe, Germany, with a passion for designing resilient systems and
                    inviting communities into the process. From non-profits that rely on reliable infrastructure to companies
                    shipping their first SaaS product, I translate complex requirements into friendly, future-proof software.
                  </p>
                  <p className="text-gray-500 md:text-lg/relaxed dark:text-gray-400">
                    My work blends technical depth with storytelling. Every interface should highlight the humans behind a
                    project—so I document decisions, surface impact metrics, and make sure clients can continue the story once a
                    project is delivered.
                  </p>
                  <AnimatedList className="grid gap-6 sm:grid-cols-2" initialDelay={0.12}>
                    <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6 space-y-2">
                        <Award className="h-8 w-8 text-primary" />
                        <h3 className="text-xl font-semibold">Seasoned delivery</h3>
                        <p className="text-sm text-muted-foreground">
                          Over a decade of iterating on web platforms, internal tools, and membership portals with measurable
                          results.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6 space-y-2">
                        <Globe className="h-8 w-8 text-primary" />
                        <h3 className="text-xl font-semibold">European perspective</h3>
                        <p className="text-sm text-muted-foreground">
                          Collaborating with organisations across Germany and neighbouring countries with multilingual, GDPR-ready
                          experiences.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6 space-y-2">
                        <Users className="h-8 w-8 text-primary" />
                        <h3 className="text-xl font-semibold">Community driven</h3>
                        <p className="text-sm text-muted-foreground">
                          I design onboarding, feedback loops, and moderation workflows that help members feel seen and heard.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6 space-y-2">
                        <Sparkles className="h-8 w-8 text-primary" />
                        <h3 className="text-xl font-semibold">Crafted details</h3>
                        <p className="text-sm text-muted-foreground">
                          From accessibility to microcopy, I sweat the small things so every release feels intentional and polished.
                        </p>
                      </CardContent>
                    </Card>
                  </AnimatedList>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/about">
                      <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                        Learn more about my story <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/projects">
                      <Button
                        variant="outline"
                        className="gap-2 border-purple-600/50 hover:border-purple-600"
                      >
                        Explore client outcomes <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold">What collaboration looks like</h3>
                    <p className="text-sm text-muted-foreground">
                      Each engagement is transparent, structured, and shaped around your stakeholders.
                    </p>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <Target className="mt-0.5 h-4 w-4 text-primary" />
                        <span>Workshops to align on user value, success metrics, and long-term maintainability.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Layers className="mt-0.5 h-4 w-4 text-primary" />
                        <span>Composable architectures that keep future iterations predictable and well-tested.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                        <span>Launch assets, changelog updates, and documentation that empower your team.</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AnimatedSection>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30 backdrop-blur-sm">
            <AnimatedSection delay={0.08} className="container px-4 md:px-6">
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
            </AnimatedSection>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32">
            <AnimatedSection delay={0.1} className="container px-4 md:px-6">
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
            </AnimatedSection>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30 backdrop-blur-sm">
            <AnimatedSection delay={0.12} className="container px-4 md:px-6">
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
            </AnimatedSection>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32">
            <AnimatedSection delay={0.14} className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    How I turn requirements into results
                  </h2>
                  <p className="mx-auto max-w-[760px] text-gray-500 md:text-xl dark:text-gray-400">
                    Clear communication, focused experiments, and measurable outcomes keep every collaboration moving forward.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 space-y-3 text-left">
                    <Compass className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold">Discover the story</h3>
                    <p className="text-sm text-muted-foreground">
                      I start by mapping stakeholders, constraints, and existing systems to uncover the narrative behind your
                      product.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 space-y-3 text-left">
                    <Layers className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold">Design the architecture</h3>
                    <p className="text-sm text-muted-foreground">
                      Wireframes, component systems, and APIs are aligned early so development flows smoothly across teams.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 space-y-3 text-left">
                    <Rocket className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold">Launch, learn, iterate</h3>
                    <p className="text-sm text-muted-foreground">
                      After launch I analyse engagement, document improvements, and plan the next release with your team.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </AnimatedSection>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32">
            <AnimatedSection delay={0.16} className="container px-4 md:px-6">
              <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Let's build something remarkable together
                  </h2>
                  <p className="text-gray-500 md:text-xl dark:text-gray-400">
                    Whether you want to collaborate on a new product, leave feedback on my case studies, or stay informed about future releases, you now have multiple ways to connect.
                  </p>
                  <AnimatedList className="grid gap-4" stagger={0.12}>
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
                  </AnimatedList>
                </div>

                <div className="space-y-4">
                  <Card className="border border-purple-200 dark:border-purple-800 bg-background/60 backdrop-blur-sm shadow-lg">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="text-xl font-semibold">Quick actions</h3>
                      <p className="text-sm text-muted-foreground">
                        Pick the option that fits best—I'm making collaboration and feedback effortless.
                      </p>
                      <AnimatedList className="grid gap-3" stagger={0.1}>
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
                        <Link href="/#faq">
                          <Button variant="ghost" className="w-full gap-2 text-primary hover:text-primary">
                            Newsletter FAQ & unsubscribe help
                          </Button>
                        </Link>
                      </AnimatedList>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </AnimatedSection>
          </section>

          <AnimatedSection delay={0.18}>
            <CommunityHighlights highlights={engagementHighlights} />
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <SiteFAQ />
          </AnimatedSection>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
