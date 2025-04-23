/**
 * Track a page view
 * @param path The path to track
 */
export async function trackPageView(path: string) {
    if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "true") {
        return
    }

    try {
        if (process.env.NODE_ENV === "development") {
            console.log(`Page view: ${path}`)
            return
        }

        await fetch("/api/analytics/pageview", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                path,
                userAgent: navigator.userAgent,
                referrer: document.referrer,
            }),
        })
    } catch (error) {
        console.error("Error tracking page view:", error)
    }
}
