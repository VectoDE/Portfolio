import Link from "next/link"
import { Github, Linkedin, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"

export function SiteFooter() {
    return (
        <footer className="w-full border-t py-6 bg-background/80 backdrop-blur-sm">
            <div className="container flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6">
                <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Tim Hauke. All rights reserved.</p>
                <div className="flex items-center gap-4">
                    <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-purple-600/10 hover:text-purple-600 transition-all duration-300"
                        >
                            <Github className="h-5 w-5" />
                            <span className="sr-only">GitHub</span>
                        </Button>
                    </Link>
                    <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-blue-600/10 hover:text-blue-600 transition-all duration-300"
                        >
                            <Linkedin className="h-5 w-5" />
                            <span className="sr-only">LinkedIn</span>
                        </Button>
                    </Link>
                    <Link href="mailto:contact@example.com">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-cyan-600/10 hover:text-cyan-600 transition-all duration-300"
                        >
                            <Mail className="h-5 w-5" />
                            <span className="sr-only">Email</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </footer>
    )
}

