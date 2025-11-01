"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Code2, Menu, X, Moon, Sun, Settings, LayoutDashboard, LogOut, User } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const isAdmin = session?.user?.role === "Admin"
  const { setTheme, theme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/newsletter", label: "Newsletter" },
  ]

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "There was a problem logging out",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string | null | undefined, email?: string | null) => {
    const source = name?.trim() || email?.trim() || "User"
    return source
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2)
      .padEnd(1, "U")
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        isScrolled ? "bg-background/80 backdrop-blur-md border-b" : "bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Code2 className="h-5 w-5 text-primary" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            Tim Hauke
          </span>
        </Link>

        <nav className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isMounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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

          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 hidden md:inline-flex">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user?.image || session.user?.imageUrl || undefined}
                      alt={session.user?.name || session.user?.email || "User"}
                    />
                    <AvatarFallback>
                      {getInitials(session.user?.name, session.user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{session.user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/account")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Account</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-600/50 hover:border-purple-600 transition-all duration-300"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                >
                  Register
                </Button>
              </Link>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md md:hidden">
          <div className="flex h-full flex-col overflow-y-auto bg-background shadow-lg">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-xl"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Code2 className="h-5 w-5 text-primary" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                  Tim Hauke
                </span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <div className="flex-1 overflow-auto py-8 px-4">
              <nav className="flex flex-col gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      pathname === item.href ? "text-primary" : "text-muted-foreground",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                {status === "authenticated" ? (
                  <>
                    <div className="flex items-center gap-3 py-3 border-t border-b">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={session.user?.image || session.user?.imageUrl || undefined}
                          alt={session.user?.name || session.user?.email || "User"}
                        />
                        <AvatarFallback>
                          {getInitials(session.user?.name, session.user?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{session.user?.name}</p>
                        <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/account"
                      className="text-lg font-medium flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      Account
                    </Link>
                    {isAdmin && (
                      <>
                        <Link
                          href="/dashboard"
                          className="text-lg font-medium flex items-center gap-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-5 w-5" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          className="text-lg font-medium flex items-center gap-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Settings className="h-5 w-5" />
                          Settings
                        </Link>
                      </>
                    )}
                    <button
                      className="text-lg font-medium flex items-center gap-2 text-red-500"
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 text-lg font-medium">
                    <Link
                      href="/login"
                      className="text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Jetzt registrieren
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
