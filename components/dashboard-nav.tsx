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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
        { href: "/dashboard/newsletter", label: "Newsletter", icon: BarChart },
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
            {/* Desktop Sidebar Header */}
            <div className="hidden md:flex flex-col w-[260px] fixed top-0 left-0 h-screen border-r border-border bg-background/80 backdrop-blur-md z-30 transition-all duration-300">
                <div className="flex h-16 items-center justify-between border-b px-4">
                    <Link href="/" className={cn("flex items-center gap-2 font-bold", isCollapsed ? "justify-center" : "")}>
                        <LayoutDashboard className="h-6 w-6 text-primary" />
                        {!isCollapsed && <span>Tim Hauke</span>}
                    </Link>
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
                                    isCollapsed && "justify-center px-0"
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

                {/* Footer with User & Theme Switch */}
                <div className="border-t p-4">
                    <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
                        {session?.user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size={isCollapsed ? "icon" : "sm"} className={cn("gap-2", isCollapsed && "p-0 rounded-full")}>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                                            <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
                                        </Avatar>
                                        {!isCollapsed && (
                                            <div className="flex flex-col items-start text-left">
                                                <span className="text-sm font-medium">{session.user.name}</span>
                                                <span className="text-xs text-muted-foreground">{session.user.email}</span>
                                            </div>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Topbar */}
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full p-0">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                                        <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <div className="flex flex-col p-2">
                                    <span className="text-sm font-medium">{session.user.name}</span>
                                    <span className="text-xs text-muted-foreground">{session.user.email}</span>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-md">
                    <div className="flex h-full flex-col overflow-y-auto bg-background shadow-lg">
                        {/* Header with close button */}
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

                        {/* User info with dropdown menu */}
                        {session?.user && (
                            <div className="flex items-center gap-3 px-4 py-3 border-b">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                                    <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-medium">{session.user.name}</p>
                                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Settings className="h-5 w-5" />
                                            <span className="sr-only">Settings</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleLogout}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Logout</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}

                        {/* Navigation items */}
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

                        {/* Footer with logout */}
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

