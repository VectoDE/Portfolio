"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart as RechartsPlePieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

interface AnalyticsData {
    projects: {
        count: number
        change: number
        percentage: number
        daily: { date: string; count: number }[]
    }
    certificates: {
        count: number
        change: number
        percentage: number
        daily: { date: string; count: number }[]
    }
    skills: {
        count: number
        change: number
        percentage: number
        daily: { date: string; count: number }[]
    }
    career: {
        count: number
        change: number
        percentage: number
        daily: { date: string; count: number }[]
    }
    contacts: {
        count: number
        change: number
        percentage: number
        daily: { date: string; count: number }[]
        statusBreakdown?: { status: string; count: number }[]
    }
    pageViews: {
        count: number
        change: number
        percentage: number
        totalViews: number
        dailyViews: { date: string; count: number }[]
        topPages: { path: string; count: number }[]
        uniqueVisitors: number
    }
    // Add the missing properties
    featuredProjects?: {
        id: string
        title: string
        description: string
        technologies: string
        link?: string | null
        imageUrl?: string | null
        githubUrl?: string | null
        featured: boolean
        createdAt: string
        updatedAt: string
        userId: string
    }[]
    recentCertificates?: {
        id: string
        name: string
        issuer: string
        date: string
        link?: string | null
        imageUrl?: string | null
        createdAt: string
        updatedAt: string
        userId: string
    }[]
    recentContacts?: {
        id: string
        name: string
        email: string
        subject?: string | null
        message: string
        status: string
        notes?: string | null
        createdAt: string
        updatedAt: string
    }[]
}

export default function AnalyticsPage() {
    const { toast } = useToast()
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [contactAnalytics, setContactAnalytics] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState("30")
    const [activeTab, setActiveTab] = useState("overview")
    const [activeEntityTab, setActiveEntityTab] = useState("all")

    useEffect(() => {
        async function fetchAnalytics() {
            setLoading(true)
            try {
                // Fetch general analytics
                const response = await fetch(`/api/analytics?period=${period}`)
                if (!response.ok) {
                    throw new Error("Failed to fetch analytics")
                }

                const data = await response.json()
                setAnalytics(data)

                // Fetch contact-specific analytics
                const contactResponse = await fetch(`/api/analytics/contacts?period=${period}`)
                if (!contactResponse.ok) {
                    throw new Error("Failed to fetch contact analytics")
                }

                const contactData = await contactResponse.json()
                setContactAnalytics(contactData)
            } catch (error) {
                console.error("Error fetching analytics:", error)
                toast({
                    title: "Error",
                    description: "Failed to load analytics data",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [period, toast])

    // Colors for status
    const statusColors = {
        unread: "#3b82f6", // blue-500
        read: "#6b7280", // gray-500
        replied: "#22c55e", // green-500
        archived: "#eab308", // yellow-500
    }

    // Get color for status
    const getStatusColor = (status: string) => {
        return statusColors[status.toLowerCase() as keyof typeof statusColors] || "#6b7280"
    }

    // Format data for area charts
    const formatDailyData = (dailyData?: { date: string; count: number }[]) => {
        if (!dailyData) return []

        return dailyData.map((item) => ({
            date: format(new Date(item.date), "MMM d"),
            count: item.count,
        }))
    }

    // Entity colors for charts
    const entityColors = {
        projects: "#3b82f6", // blue
        certificates: "#22c55e", // green
        skills: "#eab308", // yellow
        career: "#ec4899", // pink
        contacts: "#8b5cf6", // purple
        pageViews: "#f97316", // orange
    }

    // Prepare combined data for comparison chart
    const prepareComparisonData = () => {
        if (!analytics) return []

        const dates = analytics.projects.daily.map((item) => item.date)
        const result = dates.map((date, index) => {
            const formattedDate = format(new Date(date), "MMM d")
            return {
                date: formattedDate,
                projects: analytics.projects.daily[index]?.count || 0,
                certificates: analytics.certificates.daily[index]?.count || 0,
                skills: analytics.skills.daily[index]?.count || 0,
                career: analytics.career.daily[index]?.count || 0,
                contacts: analytics.contacts.daily[index]?.count || 0,
                pageViews: analytics.pageViews.dailyViews[index]?.count || 0,
            }
        })

        return result
    }

    // Prepare data for entity distribution pie chart
    const prepareEntityDistributionData = () => {
        if (!analytics) return []

        return [
            { name: "Projects", value: analytics.projects.count, color: entityColors.projects },
            { name: "Certificates", value: analytics.certificates.count, color: entityColors.certificates },
            { name: "Skills", value: analytics.skills.count, color: entityColors.skills },
            { name: "Career", value: analytics.career.count, color: entityColors.career },
            { name: "Contacts", value: analytics.contacts.count, color: entityColors.contacts },
        ]
    }

    return (
        <div className="space-y-6">
            <DashboardHeader heading="Analytics Dashboard" text="Track and analyze your portfolio data and site performance"></DashboardHeader>

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                            <SelectItem value="365">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2 mx-auto mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details">Detailed Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Total Page Views</CardTitle>
                                <CardDescription>All-time site visits</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-10 w-20" />
                                ) : (
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-bold">{analytics?.pageViews?.totalViews || 0}</span>
                                        <span className="text-sm text-muted-foreground mt-1">
                                            {analytics?.pageViews?.uniqueVisitors || 0} unique visitors in the last {period} days
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Total Contacts</CardTitle>
                                <CardDescription>All-time contact submissions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-10 w-20" />
                                ) : (
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-bold">{analytics?.contacts?.count || 0}</span>
                                        <span className="text-sm text-muted-foreground mt-1">
                                            {contactAnalytics?.currentPeriod?.count || 0} in the last {period} days
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Total Content</CardTitle>
                                <CardDescription>Projects, skills, certificates, etc.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="h-10 w-20" />
                                ) : (
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-bold">
                                            {(analytics?.projects?.count || 0) +
                                                (analytics?.certificates?.count || 0) +
                                                (analytics?.skills?.count || 0) +
                                                (analytics?.career?.count || 0)}
                                        </span>
                                        <span className="text-sm text-muted-foreground mt-1">Total portfolio items</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                            <CardHeader>
                                <CardTitle>Content Distribution</CardTitle>
                                <CardDescription>Breakdown of your portfolio content</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="h-80 flex items-center justify-center">
                                        <Skeleton className="h-60 w-full" />
                                    </div>
                                ) : (
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsPlePieChart>
                                                <Pie
                                                    data={prepareEntityDistributionData()}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {prepareEntityDistributionData().map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.color}
                                                            className="stroke-background dark:stroke-background"
                                                            strokeWidth={2}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Type</span>
                                                                            <span className="font-bold text-sm">{payload[0].name}</span>
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Count</span>
                                                                            <span className="font-bold text-sm">{payload[0].value}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        return null
                                                    }}
                                                />
                                                <Legend />
                                            </RechartsPlePieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                            <CardHeader>
                                <CardTitle>Page Views Trend</CardTitle>
                                <CardDescription>Site traffic over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="h-80 flex items-center justify-center">
                                        <Skeleton className="h-60 w-full" />
                                    </div>
                                ) : (
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={formatDailyData(analytics?.pageViews?.dailyViews)}
                                                margin={{
                                                    top: 10,
                                                    right: 30,
                                                    left: 0,
                                                    bottom: 0,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    className="text-muted-foreground"
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    className="text-muted-foreground"
                                                />
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Date</span>
                                                                            <span className="font-bold text-sm">{payload[0].payload.date}</span>
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Views</span>
                                                                            <span className="font-bold text-sm">{payload[0].value}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        return null
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke={entityColors.pageViews}
                                                    fill={`${entityColors.pageViews}33`}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-6">
                        <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                            <CardHeader>
                                <CardTitle>Top Pages</CardTitle>
                                <CardDescription>Most visited pages in the last {period} days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                ) : analytics?.pageViews?.topPages?.length === 0 ? (
                                    <div className="flex h-40 items-center justify-center text-muted-foreground">
                                        No page view data available
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {analytics?.pageViews?.topPages?.map((page, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <span className="font-medium truncate max-w-[300px]">{page.path}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium">{page.count}</span>
                                                        <span className="text-sm text-muted-foreground">views</span>
                                                    </div>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-primary"
                                                        style={{
                                                            width: `${Math.max(...(analytics?.pageViews?.topPages?.map((p) => p.count) || [1])) > 0
                                                                    ? (
                                                                        page.count /
                                                                        Math.max(...(analytics?.pageViews?.topPages?.map((p) => p.count) || [1]))
                                                                    ) * 100
                                                                    : 0
                                                                }%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="details" className="mt-0">
                    <Tabs value={activeEntityTab} onValueChange={setActiveEntityTab} className="w-full">
                        <TabsList className="flex flex-wrap justify-center mb-6">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="pageviews">Page Views</TabsTrigger>
                            <TabsTrigger value="contacts">Contacts</TabsTrigger>
                            <TabsTrigger value="projects">Projects</TabsTrigger>
                            <TabsTrigger value="certificates">Certificates</TabsTrigger>
                            <TabsTrigger value="skills">Skills</TabsTrigger>
                            <TabsTrigger value="career">Career</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-0">
                            <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg mb-6">
                                <CardHeader>
                                    <CardTitle>Activity Comparison</CardTitle>
                                    <CardDescription>Compare activity across all categories</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="h-96 flex items-center justify-center">
                                            <Skeleton className="h-80 w-full" />
                                        </div>
                                    ) : (
                                        <div className="h-96">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart
                                                    data={prepareComparisonData()}
                                                    margin={{
                                                        top: 10,
                                                        right: 30,
                                                        left: 0,
                                                        bottom: 0,
                                                    }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                    <XAxis
                                                        dataKey="date"
                                                        tick={{ fontSize: 12 }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        className="text-muted-foreground"
                                                    />
                                                    <YAxis
                                                        tick={{ fontSize: 12 }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        className="text-muted-foreground"
                                                    />
                                                    <Tooltip
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                return (
                                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <div className="flex flex-col col-span-2 mb-1">
                                                                                <span className="text-xs text-muted-foreground">Date</span>
                                                                                <span className="font-bold text-sm">{payload[0].payload.date}</span>
                                                                            </div>
                                                                            {payload.map((entry, index) => (
                                                                                <div key={index} className="flex flex-col">
                                                                                    <span className="text-xs text-muted-foreground capitalize">{entry.name}</span>
                                                                                    <span className="font-bold text-sm">{entry.value}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            }
                                                            return null
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="pageViews"
                                                        stackId="1"
                                                        stroke={entityColors.pageViews}
                                                        fill={`${entityColors.pageViews}33`}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="contacts"
                                                        stackId="1"
                                                        stroke={entityColors.contacts}
                                                        fill={`${entityColors.contacts}33`}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="projects"
                                                        stackId="1"
                                                        stroke={entityColors.projects}
                                                        fill={`${entityColors.projects}33`}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="certificates"
                                                        stackId="1"
                                                        stroke={entityColors.certificates}
                                                        fill={`${entityColors.certificates}33`}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="skills"
                                                        stackId="1"
                                                        stroke={entityColors.skills}
                                                        fill={`${entityColors.skills}33`}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="career"
                                                        stackId="1"
                                                        stroke={entityColors.career}
                                                        fill={`${entityColors.career}33`}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="grid gap-6 md:grid-cols-3">
                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader>
                                        <CardTitle>Projects</CardTitle>
                                        <CardDescription>Total: {analytics?.projects?.count || 0}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {analytics?.projects?.change !== undefined
                                                ? analytics.projects.change > 0
                                                    ? `+${analytics.projects.change}`
                                                    : analytics.projects.change
                                                : 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Change in the last {period} days ({analytics?.projects?.percentage || 0}%)
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader>
                                        <CardTitle>Certificates</CardTitle>
                                        <CardDescription>Total: {analytics?.certificates?.count || 0}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {analytics?.certificates?.change !== undefined
                                                ? analytics.certificates.change > 0
                                                    ? `+${analytics.certificates.change}`
                                                    : analytics.certificates.change
                                                : 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Change in the last {period} days ({analytics?.certificates?.percentage || 0}%)
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader>
                                        <CardTitle>Skills</CardTitle>
                                        <CardDescription>Total: {analytics?.skills?.count || 0}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {analytics?.skills?.change !== undefined
                                                ? analytics.skills.change > 0
                                                    ? `+${analytics.skills.change}`
                                                    : analytics.skills.change
                                                : 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Change in the last {period} days ({analytics?.skills?.percentage || 0}%)
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="pageviews" className="mt-0">
                            <div className="grid gap-6 md:grid-cols-3 mb-6">
                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Total Views</CardTitle>
                                        <CardDescription>All-time page views</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{analytics?.pageViews?.totalViews || 0}</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Unique Visitors</CardTitle>
                                        <CardDescription>Based on unique IP addresses</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{analytics?.pageViews?.uniqueVisitors || 0}</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Views per Visitor</CardTitle>
                                        <CardDescription>Average pages per visitor</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">
                                            {analytics?.pageViews?.uniqueVisitors
                                                ? (analytics.pageViews.totalViews / analytics.pageViews.uniqueVisitors).toFixed(1)
                                                : "0"}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg mb-6">
                                <CardHeader>
                                    <CardTitle>Page Views Over Time</CardTitle>
                                    <CardDescription>Daily page views for the last {period} days</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={formatDailyData(analytics?.pageViews?.dailyViews)}
                                                margin={{
                                                    top: 10,
                                                    right: 30,
                                                    left: 0,
                                                    bottom: 0,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    className="text-muted-foreground"
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    className="text-muted-foreground"
                                                />
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Date</span>
                                                                            <span className="font-bold text-sm">{payload[0].payload.date}</span>
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Views</span>
                                                                            <span className="font-bold text-sm">{payload[0].value}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        return null
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke={entityColors.pageViews}
                                                    fill={`${entityColors.pageViews}33`}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Top Pages</CardTitle>
                                    <CardDescription>Most visited pages in the last {period} days</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={analytics?.pageViews?.topPages || []}
                                                layout="vertical"
                                                margin={{
                                                    top: 20,
                                                    right: 30,
                                                    left: 20,
                                                    bottom: 5,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis type="number" />
                                                <YAxis
                                                    dataKey="path"
                                                    type="category"
                                                    width={150}
                                                    tick={{ fontSize: 12 }}
                                                    tickFormatter={(value) => (value.length > 20 ? `${value.substring(0, 20)}...` : value)}
                                                />
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                    <div className="grid grid-cols-1 gap-2">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Path</span>
                                                                            <span className="font-bold text-sm">{payload[0].payload.path}</span>
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Views</span>
                                                                            <span className="font-bold text-sm">{payload[0].value}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        return null
                                                    }}
                                                />
                                                <Bar dataKey="count" fill={entityColors.pageViews} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="contacts" className="mt-0">
                            <div className="grid gap-6 md:grid-cols-3 mb-6">
                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Total Contacts</CardTitle>
                                        <CardDescription>All-time contact submissions</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{contactAnalytics?.total || 0}</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Recent Contacts</CardTitle>
                                        <CardDescription>Last {period} days</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{contactAnalytics?.currentPeriod?.count || 0}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {contactAnalytics?.currentPeriod?.change > 0 ? "+" : ""}
                                            {contactAnalytics?.currentPeriod?.change || 0} ({contactAnalytics?.currentPeriod?.percentage || 0}
                                            %)
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Daily Average</CardTitle>
                                        <CardDescription>Contacts per day</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">
                                            {contactAnalytics?.currentPeriod?.count
                                                ? (contactAnalytics.currentPeriod.count / Number(period)).toFixed(1)
                                                : "0"}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 mb-6">
                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader>
                                        <CardTitle>Contact Status Distribution</CardTitle>
                                        <CardDescription>Breakdown by status</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RechartsPlePieChart>
                                                    <Pie
                                                        data={contactAnalytics?.statusBreakdown || []}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="count"
                                                        nameKey="status"
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    >
                                                        {(contactAnalytics?.statusBreakdown || []).map((entry: any, index: number) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={getStatusColor(entry.status)}
                                                                className="stroke-background dark:stroke-background"
                                                                strokeWidth={2}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                return (
                                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <div className="flex flex-col">
                                                                                <span className="text-xs text-muted-foreground">Status</span>
                                                                                <span className="font-bold text-sm capitalize">{payload[0].name}</span>
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-xs text-muted-foreground">Count</span>
                                                                                <span className="font-bold text-sm">{payload[0].value}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            }
                                                            return null
                                                        }}
                                                    />
                                                    <Legend />
                                                </RechartsPlePieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader>
                                        <CardTitle>Contact Trend</CardTitle>
                                        <CardDescription>Daily contacts for the last {period} days</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart
                                                    data={contactAnalytics?.dailyContacts || []}
                                                    margin={{
                                                        top: 10,
                                                        right: 30,
                                                        left: 0,
                                                        bottom: 0,
                                                    }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                    <XAxis
                                                        dataKey="date"
                                                        tick={{ fontSize: 12 }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        className="text-muted-foreground"
                                                        tickFormatter={(value) => format(new Date(value), "MMM d")}
                                                    />
                                                    <YAxis
                                                        tick={{ fontSize: 12 }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        className="text-muted-foreground"
                                                    />
                                                    <Tooltip
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                return (
                                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <div className="flex flex-col">
                                                                                <span className="text-xs text-muted-foreground">Date</span>
                                                                                <span className="font-bold text-sm">
                                                                                    {format(new Date(payload[0].payload.date), "MMM d, yyyy")}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-xs text-muted-foreground">Contacts</span>
                                                                                <span className="font-bold text-sm">{payload[0].value}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            }
                                                            return null
                                                        }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="count"
                                                        stroke={entityColors.contacts}
                                                        fill={`${entityColors.contacts}33`}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Status Comparison</CardTitle>
                                    <CardDescription>Distribution of contact statuses</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={contactAnalytics?.statusBreakdown || []}
                                                margin={{
                                                    top: 20,
                                                    right: 30,
                                                    left: 20,
                                                    bottom: 5,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis
                                                    dataKey="status"
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    className="text-muted-foreground"
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    className="text-muted-foreground"
                                                />
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Status</span>
                                                                            <span className="font-bold text-sm capitalize">{payload[0].payload.status}</span>
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Count</span>
                                                                            <span className="font-bold text-sm">{payload[0].value}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        return null
                                                    }}
                                                />
                                                <Bar dataKey="count">
                                                    {(contactAnalytics?.statusBreakdown || []).map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="projects" className="mt-0">
                            <div className="grid gap-6 md:grid-cols-3 mb-6">
                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Total Projects</CardTitle>
                                        <CardDescription>All-time projects</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{analytics?.projects?.count || 0}</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Recent Projects</CardTitle>
                                        <CardDescription>Last {period} days</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{analytics?.projects?.change || 0}</div>
                                        <div className="text-sm text-muted-foreground">{analytics?.projects?.percentage || 0}% change</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Featured Projects</CardTitle>
                                        <CardDescription>Highlighted projects</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{analytics?.featuredProjects?.length || 0}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Project Activity</CardTitle>
                                    <CardDescription>Projects added over time</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={formatDailyData(analytics?.projects?.daily)}
                                                margin={{
                                                    top: 10,
                                                    right: 30,
                                                    left: 0,
                                                    bottom: 0,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    className="text-muted-foreground"
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    className="text-muted-foreground"
                                                />
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Date</span>
                                                                            <span className="font-bold text-sm">{payload[0].payload.date}</span>
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Projects</span>
                                                                            <span className="font-bold text-sm">{payload[0].value}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        return null
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke={entityColors.projects}
                                                    fill={`${entityColors.projects}33`}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="certificates" className="mt-0">
                            <div className="grid gap-6 md:grid-cols-3 mb-6">
                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Total Certificates</CardTitle>
                                        <CardDescription>All-time certificates</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{analytics?.certificates?.count || 0}</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Recent Certificates</CardTitle>
                                        <CardDescription>Last {period} days</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{analytics?.certificates?.change || 0}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {analytics?.certificates?.percentage || 0}% change
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Latest Certificate</CardTitle>
                                        <CardDescription>Most recent achievement</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-lg font-medium truncate">
                                            {analytics?.recentCertificates?.[0]?.name || "None"}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {analytics?.recentCertificates?.[0]?.issuer || ""}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Certificate Activity</CardTitle>
                                    <CardDescription>Certificates added over time</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={formatDailyData(analytics?.certificates?.daily)}
                                                margin={{
                                                    top: 10,
                                                    right: 30,
                                                    left: 0,
                                                    bottom: 0,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    className="text-muted-foreground"
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    className="text-muted-foreground"
                                                />
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Date</span>
                                                                            <span className="font-bold text-sm">{payload[0].payload.date}</span>
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Certificates</span>
                                                                            <span className="font-bold text-sm">{payload[0].value}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        return null
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke={entityColors.certificates}
                                                    fill={`${entityColors.certificates}33`}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="skills" className="mt-0">
                            <div className="grid gap-6 md:grid-cols-3 mb-6">
                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Total Skills</CardTitle>
                                        <CardDescription>All-time skills</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{analytics?.skills?.count || 0}</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Recent Skills</CardTitle>
                                        <CardDescription>Last {period} days</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{analytics?.skills?.change || 0}</div>
                                        <div className="text-sm text-muted-foreground">{analytics?.skills?.percentage || 0}% change</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Skill Growth</CardTitle>
                                        <CardDescription>Monthly average</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">
                                            {analytics?.skills?.count && period
                                                ? ((analytics.skills.count / (365 * 2)) * 30).toFixed(1)
                                                : "0"}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Skills per month (est.)</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Skill Activity</CardTitle>
                                    <CardDescription>Skills added over time</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={formatDailyData(analytics?.skills?.daily)}
                                                margin={{
                                                    top: 10,
                                                    right: 30,
                                                    left: 0,
                                                    bottom: 0,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    className="text-muted-foreground"
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    className="text-muted-foreground"
                                                />
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Date</span>
                                                                            <span className="font-bold text-sm">{payload[0].payload.date}</span>
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Skills</span>
                                                                            <span className="font-bold text-sm">{payload[0].value}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        return null
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke={entityColors.skills}
                                                    fill={`${entityColors.skills}33`}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="career" className="mt-0">
                            <div className="grid gap-6 md:grid-cols-3 mb-6">
                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Total Career Entries</CardTitle>
                                        <CardDescription>All-time career items</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{analytics?.career?.count || 0}</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Recent Entries</CardTitle>
                                        <CardDescription>Last {period} days</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{analytics?.career?.change || 0}</div>
                                        <div className="text-sm text-muted-foreground">{analytics?.career?.percentage || 0}% change</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Career Growth</CardTitle>
                                        <CardDescription>Yearly average</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">
                                            {analytics?.career?.count ? (analytics.career.count / 5).toFixed(1) : "0"}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Positions per year (est.)</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Career Activity</CardTitle>
                                    <CardDescription>Career entries added over time</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={formatDailyData(analytics?.career?.daily)}
                                                margin={{
                                                    top: 10,
                                                    right: 30,
                                                    left: 0,
                                                    bottom: 0,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    className="text-muted-foreground"
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    className="text-muted-foreground"
                                                />
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Date</span>
                                                                            <span className="font-bold text-sm">{payload[0].payload.date}</span>
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-muted-foreground">Career Entries</span>
                                                                            <span className="font-bold text-sm">{payload[0].value}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        return null
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke={entityColors.career}
                                                    fill={`${entityColors.career}33`}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </TabsContent>
            </Tabs>
        </div>
    )
}
