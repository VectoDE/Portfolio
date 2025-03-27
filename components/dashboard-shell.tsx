"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  FolderKanban,
  GraduationCap,
  Languages,
  FileText,
  Settings,
  LogOut,
  User,
  Menu,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if we're on a mobile device
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIsMobile()

    // Listen for window resize
    window.addEventListener("resize", checkIsMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // Check if the menu item should be active
  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true
    }
    return path !== "/dashboard" && pathname.startsWith(path)
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
    { href: "/dashboard/certificates", label: "Certificates", icon: GraduationCap },
    { href: "/dashboard/skills", label: "Skills", icon: Languages },
    { href: "/dashboard/career", label: "Career", icon: FileText },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  // Mobile navigation
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] p-0">
                <div className="flex h-16 items-center border-b px-4">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-6 w-6" />
                    <span className="font-bold">Tim Hauke</span>
                  </div>
                </div>
                <div className="py-4">
                  <nav className="grid gap-2 px-2">
                    {navItems.map((item) => (
                      <Button
                        key={item.href}
                        variant={isActive(item.href) ? "secondary" : "ghost"}
                        className="justify-start gap-2"
                        onClick={() => {
                          router.push(item.href)
                          setIsOpen(false)
                        }}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    ))}
                    <Button variant="ghost" className="justify-start gap-2 mt-4 text-red-500" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6" />
              <span className="font-bold">Tim Hauke</span>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/settings")}>
            <User className="h-4 w-4" />
            <span className="sr-only">User</span>
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    )
  }

  // Desktop navigation
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="w-full flex-1">
            <nav className="flex items-center justify-end gap-4">
              <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/settings")}>
                <User className="h-4 w-4" />
                <span className="sr-only">User Settings</span>
              </Button>
            </nav>
          </div>
        </header>
        <div className="flex flex-1">
          <Sidebar>
            <SidebarHeader>
              <div className="flex h-16 items-center gap-2 px-4">
                <LayoutDashboard className="h-6 w-6" />
                <span className="font-bold">Tim Hauke</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                      <a
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault()
                          router.push(item.href)
                        }}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Logout">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        handleLogout()
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

