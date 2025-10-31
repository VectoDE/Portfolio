import { Suspense } from "react"
import { Lightbulb, LineChart, Users, Zap } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { ProjectsGrid } from "@/components/projects-grid"
import { ProjectsSkeleton } from "@/components/skeletons/projects-skeleton"
import { NewsletterForm } from "@/components/newsletter-form"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Projects | Tim Hauke",
  description: "Explore my portfolio of web development projects",
  openGraph: {
    title: "Projects | Tim Hauke",
    description: "Explore my portfolio of web development projects",
    url: "/projects",
    type: "website",
  },
  alternates: {
    canonical: "/projects",
  },
}

export default function ProjectsPage() {
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
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    My Projects
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    A showcase of my recent work and projects
                  </p>
                </div>
              </div>

              <div className="mx-auto max-w-3xl space-y-4 text-center text-gray-500 md:text-lg dark:text-gray-400">
                <p>
                  Each case study captures more than a feature list—it documents the mission behind the build, the community it
                  serves, and the measurable impact delivered after launch. I combine clean design systems with sustainable
                  backend choices so clients inherit software they can confidently evolve.
                </p>
                <p>
                  Explore a mix of membership platforms, operational dashboards, and bespoke automations created for clubs,
                  associations, and founders across Europe. When you're ready, reach out and we'll map how these approaches can
                  accelerate your vision.
                </p>
              </div>

              <div className="mt-12 grid gap-6 md:grid-cols-3">
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 space-y-3 text-left">
                    <Lightbulb className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold">Strategy first</h3>
                    <p className="text-sm text-muted-foreground">
                      Workshops and discovery sessions shape a roadmap tied to real KPIs, not vanity metrics.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 space-y-3 text-left">
                    <Users className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold">Human-centric UX</h3>
                    <p className="text-sm text-muted-foreground">
                      Interfaces are prototyped with stakeholder feedback so communities recognise themselves on screen.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 space-y-3 text-left">
                    <LineChart className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold">Measurable growth</h3>
                    <p className="text-sm text-muted-foreground">
                      Launch retrospectives include engagement dashboards and documentation that keep improvements on track.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Suspense fallback={<ProjectsSkeleton />}>
                <ProjectsGrid />
              </Suspense>

              <div className="mt-24 space-y-6 text-gray-500 md:text-lg dark:text-gray-400">
                <p>
                  You will find both solo builds and collaborative efforts here. I highlight the roles I played—from product
                  strategy to deployment automation—so you can see exactly how I plug into multidisciplinary teams.
                </p>
                <p>
                  Curious about a specific implementation detail? Use the contact page to request private architecture notes or
                  extended documentation—I'm happy to dive deeper.
                </p>
              </div>

              <div className="mt-16 mb-12">
                <Card className="border border-purple-200 dark:border-purple-800 bg-background/60 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <NewsletterForm />
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30 backdrop-blur-sm">
            <div className="container px-4 md:px-6">
              <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-start">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Behind every showcase is a partnership
                  </h2>
                  <p className="text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                    I work closely with project leads to surface the people involved—the volunteers, administrators, and
                    customers powering each release. Expect transparent updates, collaborative tooling, and documentation that
                    puts names and faces next to milestones.
                  </p>
                  <p className="text-gray-500 md:text-lg/relaxed dark:text-gray-400">
                    Ready to start yours? Let's discuss timelines, technical requirements, and the story you want your audience
                    to remember.
                  </p>
                </div>
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 space-y-3 text-left">
                    <h3 className="text-xl font-semibold">Project essentials</h3>
                    <p className="text-sm text-muted-foreground">
                      Every engagement includes these foundations to keep momentum high.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Lightbulb className="mt-0.5 h-4 w-4 text-primary" />
                        Discovery workshop with stakeholder mapping and success metrics.
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="mt-0.5 h-4 w-4 text-primary" />
                        Iterative delivery with preview environments for quick feedback.
                      </li>
                      <li className="flex items-start gap-2">
                        <LineChart className="mt-0.5 h-4 w-4 text-primary" />
                        Post-launch analytics summary and action plan for the next sprint.
                      </li>
                    </ul>
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
