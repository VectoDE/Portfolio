/**
 * Track a page view
 * @param path The path to track
 */
export async function trackPageView(path: string) {
  if (typeof window === "undefined") {
    return
  }

  if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "true") {
    return
  }

  try {
    if (process.env.NODE_ENV === "development") {
      console.log(`Page view: ${path}`)
      return
    }

    const storedConsent = localStorage.getItem("cookieConsent")
    let analyticsEnabled = false
    let consentStatus = "No consent stored"

    if (storedConsent) {
      try {
        const consent = JSON.parse(storedConsent)
        analyticsEnabled = consent.analytics
        consentStatus = analyticsEnabled ? "Consented" : "Declined"
      } catch (e) {
        console.error("Error parsing cookie consent:", e)
      }
    }

    if (!analyticsEnabled) {
      return
    }

    console.log(`Tracking with consent status: ${consentStatus}`)

    await fetch("/api/analytics/pageview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        consentStatus,
        consentGranted: analyticsEnabled,
      }),
    })
  } catch (error) {
    console.error("Error tracking page view:", error)
  }
}
