import Link from "next/link"
import Image from "next/image"
import { ExternalLink, Github } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllProjects } from "@/lib/projects"

// Add proper type for projects
import type { Project } from "@/types/database"

export async function ProjectsGrid() {
    const projects = await getAllProjects()

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fix the map function by adding proper type */}
            {projects.map((project: Project) => (
                <Card
                    key={project.id}
                    className="overflow-hidden group bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <div className="aspect-video relative bg-muted overflow-hidden">
                        <Image
                            src={`/placeholder.svg?height=400&width=600&text=${encodeURIComponent(project.title)}`}
                            alt={project.title}
                            width={600}
                            height={400}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-none">
                                    <Github className="h-4 w-4 mr-1" /> Code
                                </Button>
                                {project.link && (
                                    <Button size="sm" variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-none">
                                        <ExternalLink className="h-4 w-4 mr-1" /> Demo
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    <CardHeader>
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    </CardHeader>
                    {/* Card content */}
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {project.technologies.split(", ").map((tech: string) => (
                                <span
                                    key={tech}
                                    className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                    {/* Rest of the card */}
                    <CardFooter>
                        <Link href={`/projects/${project.id}`} className="w-full">
                            <Button variant="outline" size="sm" className="w-full">
                                View Details
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

