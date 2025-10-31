import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BookOpenCheck, FileCode2, Globe, HeartHandshake, Target, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { CareerTimeline } from "@/components/career-timeline"

export const metadata = {
  title: "About | Tim Hauke",
  description: "Learn more about Tim Hauke, Full Stack Developer",
  openGraph: {
    title: "About | Tim Hauke",
    description: "Learn more about Tim Hauke, Full Stack Developer",
    url: "/about",
    type: "profile",
  },
  alternates: {
    canonical: "/about",
  },
}

export default function AboutPage() {
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
                    About Me
                  </h1>
                  <p className="mx-auto max-w-[760px] text-gray-500 md:text-xl dark:text-gray-400">
                    Full stack developer from Itzehoe, Germany, spotlighting the people and missions behind every digital
                    product I build.
                  </p>
                </div>
              </div>

              <div className="grid gap-10 md:grid-cols-2 md:gap-16">
                <div>
                  <div className="aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 p-1">
                    <div className="h-full w-full overflow-hidden rounded-lg">
                      <Image
                        src="/placeholder.svg?height=600&width=600"
                        alt="Profile"
                        width={600}
                        height={600}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                      My Journey
                    </h2>
                    <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                      I'm a passionate full stack developer with over 10 years of experience building web applications. I
                      specialise in modern TypeScript tooling, React ecosystems, and scalable backend infrastructures that stay
                      maintainable long after handover.
                    </p>
                    <p className="text-gray-500 md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed dark:text-gray-400">
                      My projects weave together strategy, design, and engineering. Whether it's a sports club managing
                      thousands of members or a startup validating its first product, I translate complex requirements into
                      approachable digital experiences.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Education</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Secondary School Certificate
                      <br />
                      RBZ Itzehoe, 2020-2021
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Professional Experience</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      I've worked with startups, clubs, and associations, helping them develop scalable and maintainable web
                      applications. My focus is on creating exceptional user experiences with clean, efficient code.
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      Outside of delivering client projects, I mentor aspiring developers, produce technical documentation, and
                      contribute to open-source initiatives that keep European tech communities thriving.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                      <CardContent className="p-4 space-y-2">
                        <Users className="h-6 w-6 text-primary" />
                        <h4 className="text-lg font-semibold">People-first mindset</h4>
                        <p className="text-sm text-muted-foreground">
                          I design workshops, onboarding flows, and documentation that empower teams and volunteers alike.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                      <CardContent className="p-4 space-y-2">
                        <Globe className="h-6 w-6 text-primary" />
                        <h4 className="text-lg font-semibold">International collaboration</h4>
                        <p className="text-sm text-muted-foreground">
                          Working across borders taught me to balance localisation, accessibility, and compliance from day one.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30 backdrop-blur-sm">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Career Timeline
                  </h2>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    My professional journey in the tech industry
                  </p>
                </div>
              </div>

              <CareerTimeline />
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Skills & Expertise
                  </h2>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    Here are some of the technologies and tools I work with
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-2">
                      <FileCode2 className="h-12 w-12 text-primary" />
                      <h3 className="text-xl font-bold">Frontend Development</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-center">
                        React, Next.js, TypeScript, Tailwind CSS, PHP, HTML/CSS
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-2">
                      <FileCode2 className="h-12 w-12 text-primary" />
                      <h3 className="text-xl font-bold">Backend Development</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-center">
                        Node.js, Express, TypeScript, PHP, C++, REST APIs, Prisma
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-2">
                      <FileCode2 className="h-12 w-12 text-primary" />
                      <h3 className="text-xl font-bold">Database & DevOps</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-center">
                        PostgreSQL, MongoDB, MySQL, Docker, CI/CD, Git
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30 backdrop-blur-sm">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Values I bring to every collaboration
                  </h2>
                  <p className="mx-auto max-w-[760px] text-gray-500 md:text-xl dark:text-gray-400">
                    My approach combines technical craftsmanship with empathy for the people relying on the final product.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 space-y-3">
                    <Target className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold">Purpose-driven planning</h3>
                    <p className="text-sm text-muted-foreground">
                      I align development roadmaps with the goals of your members, customers, and partners so success feels
                      tangible for everyone involved.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 space-y-3">
                    <HeartHandshake className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold">Transparent collaboration</h3>
                    <p className="text-sm text-muted-foreground">
                      From weekly demos to accessible documentation, I keep every stakeholder informed and empowered to make
                      confident decisions.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 space-y-3">
                    <BookOpenCheck className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold">Continuous learning</h3>
                    <p className="text-sm text-muted-foreground">
                      I invest in ongoing education, share lessons publicly, and bring that knowledge into every engagement I
                      lead.
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
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Beyond the screen
                  </h2>
                  <p className="mx-auto max-w-[760px] text-gray-500 md:text-xl dark:text-gray-400">
                    I believe great products reflect their communities, so I stay close to grassroots initiatives and creative
                    circles.
                  </p>
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                  <CardContent className="p-6 space-y-2 text-left">
                    <Users className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold">Community mentorship</h3>
                    <p className="text-sm text-muted-foreground">
                      I mentor students and junior developers, helping them navigate real-world projects and contribute to
                      open-source safely.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                  <CardContent className="p-6 space-y-2 text-left">
                    <Globe className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold">Local initiatives</h3>
                    <p className="text-sm text-muted-foreground">
                      In Itzehoe, I collaborate with associations to digitalise workflows and showcase the people keeping our
                      region vibrant.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                  <CardContent className="p-6 space-y-2 text-left">
                    <FileCode2 className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold">Story-driven writing</h3>
                    <p className="text-sm text-muted-foreground">
                      I publish case studies and technical deep dives that celebrate collaborators while demystifying the code
                      powering their success.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30 backdrop-blur-sm">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Let's Connect
                  </h2>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    I'm always open to discussing new projects, creative ideas, or opportunities to
                    be part of your vision.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                  <Link href="/contact">
                    <Button className="gap-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300">
                      Contact Me <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/projects">
                    <Button
                      variant="outline"
                      className="gap-1 border-purple-600/50 hover:border-purple-600 transition-all duration-300"
                    >
                      View My Work <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
