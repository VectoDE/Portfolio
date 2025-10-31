import { Suspense } from "react"
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

              <Suspense fallback={<ProjectsSkeleton />}>
                <ProjectsGrid />
              </Suspense>

              <div className="mt-24 mb-12">
                <Card className="border border-purple-200 dark:border-purple-800 bg-background/60 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <NewsletterForm />
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
