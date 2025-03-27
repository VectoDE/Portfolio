import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FeaturedProjects } from "@/components/featured-projects"
import { SkillsShowcase } from "@/components/skills-showcase"
import { CertificatesShowcase } from "@/components/certificates-showcase"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { ProjectsSkeleton } from "@/components/skeletons/projects-skeleton"
import { CertificatesShowcaseSkeleton } from "@/components/skeletons/certificates-showcase-skeleton"

export default function Home() {
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
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}

