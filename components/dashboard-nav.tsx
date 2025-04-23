"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
    LayoutDashboard,
    FolderKanban,
    GraduationCap,
    Languages,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Moon,
    Sun,
    ChevronLeft,
    BarChart,
    Contact,
    LineChart,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function DashboardNav() {
    const pathname = usePathname()
    const router = useRouter()
    const { toast } = useToast()
    const { setTheme, theme } = useTheme()
    const { data: session } = useSession()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)

    useEffect(() => {
        setIsMounted(true)

        // Check if sidebar state is stored in localStorage
        const storedState = localStorage.getItem("dashboard-sidebar-state")
        if (storedState) {
            setIsCollapsed(storedState === "collapsed")
        }
    }, [])

    const toggleSidebar = () => {
        const newState = !isCollapsed
        setIsCollapsed(newState)
        localStorage.setItem("dashboard-sidebar-state", newState ? "collapsed" : "expanded")
    }

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/analytics", label: "Analytics", icon: LineChart },
        { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
        { href: "/dashboard/certificates", label: "Certificates", icon: GraduationCap },
        { href: "/dashboard/skills", label: "Skills", icon: Languages },
        { href: "/dashboard/career", label: "Career", icon: FileText },
        { href: "/dashboard/contacts", label: "Contacts", icon: Contact },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ]

    const isActive = (path: string) => {
        if (path === "/dashboard" && pathname === "/dashboard") {
            return true
        }
        return path !== "/dashboard" && pathname.startsWith(path)
    }

    const handleLogout = async () => {
        try {
            await signOut({ redirect: false })
            toast({
                title: "Logged out successfully",
                description: "You have been logged out of your account",
            })
            router.push("/login")
        } catch (error) {
            console.error("Logout error:", error)
            toast({
                title: "Logout failed",
                description: "There was a problem logging out",
                variant: "destructive",
            })
        }
    }

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "U"
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    return (
        <>
            {/* Desktop Navigation */}
            <div
                className={cn(
                    "hidden md:flex h-screen flex-col fixed left-0 top-0 border-r border-border bg-background/80 backdrop-blur-md z-30 transition-all duration-300",
                    isCollapsed ? "w-16" : "w-64",
                )}
            >
                <div className="flex h-16 items-center justify-between border-b px-4">
                    <Link
                        href="/dashboard"
                        className={cn("flex items-center gap-2 font-bold", isCollapsed ? "justify-center" : "")}
                    >
                        <LayoutDashboard className="h-6 w-6 text-primary" />
                        {!isCollapsed && <span>Tim Hauke</span>}
                    </Link>
                    {!isCollapsed && session?.user && (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/placeholder.svg" alt={session.user.name || "User"} />
                                <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
                            </Avatar>
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-auto py-4 px-3">
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                    isActive(item.href)
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                    isCollapsed && "justify-center px-0",
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon className="h-5 w-5" />
                                {!isCollapsed && (
                                    <>
                                        <span>{item.label}</span>
                                        {isActive(item.href) && <ChevronRight className="ml-auto h-4 w-4" />}
                                    </>
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="border-t p-4">
                    <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
                        {!isCollapsed && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-muted-foreground hover:text-foreground"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </Button>
                        )}
                        {isCollapsed && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={handleLogout}
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        )}
                        {isMounted && !isCollapsed && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                        <span className="sr-only">Toggle theme</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setTheme("light")}>
                                        <Sun className="mr-2 h-4 w-4" />
                                        <span>Light</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                                        <Moon className="mr-2 h-4 w-4" />
                                        <span>Dark</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("system")}>
                                        <span>System</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                {/* Toggle button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-3 top-20 h-6 w-6 rounded-full border shadow-md bg-background"
                    onClick={toggleSidebar}
                >
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center justify-between h-16 border-b px-4 bg-background/80 backdrop-blur-md sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                        <span>Tim Hauke</span>
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    {isMounted && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                    <span className="sr-only">Toggle theme</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setTheme("light")}>
                                    <Sun className="mr-2 h-4 w-4" />
                                    <span>Light</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>
                                    <Moon className="mr-2 h-4 w-4" />
                                    <span>Dark</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>
                                    <span>System</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    {session?.user && (
                        <Avatar className="h-8 w-8" onClick={() => router.push("/dashboard/settings")}>
                            <AvatarImage src="/placeholder.svg" alt={session.user.name || "User"} />
                            <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-md">
                    <div className="flex h-full flex-col overflow-y-auto bg-background shadow-lg">
                        <div className="flex h-16 items-center justify-between border-b px-4">
                            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                                <LayoutDashboard className="h-6 w-6 text-primary" />
                                <span>Tim Hauke</span>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                <X className="h-5 w-5" />
                                <span className="sr-only">Close menu</span>
                            </Button>
                        </div>

                        {session?.user && (
                            <div className="flex items-center gap-3 px-4 py-3 border-b">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src="/placeholder.svg" alt={session.user.name || "User"} />
                                    <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{session.user.name}</p>
                                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-auto py-4 px-4">
                            <nav className="flex flex-col gap-2">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                            isActive(item.href)
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                        )}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.label}</span>
                                        {isActive(item.href) && <ChevronRight className="ml-auto h-5 w-5" />}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="border-t p-4">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    handleLogout()
                                    setIsMobileMenuOpen(false)
                                }}
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Logout</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content wrapper */}
            <div className={cn("transition-all duration-300 md:ml-64", isCollapsed && "md:ml-16")}>
                {/* This is where the main content will be rendered */}
            </div>
        </>
    )
}

