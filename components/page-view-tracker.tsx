"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { trackPageView } from "@/lib/track-pageview"

function PageViewTrackerInner() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (pathname) {
            trackPageView(pathname)
        }
    }, [pathname, searchParams])

    return null
}

export function PageViewTracker() {
    return (
        <Suspense fallback={null}>
            <PageViewTrackerInner />
        </Suspense>
    )
}
