"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface CookieConsent {
  necessary: boolean
  analytics: boolean
  timestamp: number
}

const defaultConsent: CookieConsent = {
  necessary: true,
  analytics: false,
  timestamp: Date.now(),
}

const COOKIE_EXPIRATION_DAYS = 7
const COOKIE_EXPIRATION_MS = COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent)
  const [activeTab, setActiveTab] = useState("cookie-policy")
  const trackingInitializedRef = useRef(false)

  useEffect(() => {
    const storedConsent = localStorage.getItem("cookieConsent")

    if (storedConsent) {
      try {
        const parsedConsent = JSON.parse(storedConsent) as CookieConsent
        const isExpired = Date.now() - parsedConsent.timestamp > COOKIE_EXPIRATION_MS

        if (isExpired) {
          setShowBanner(true)
        } else {
          setConsent(parsedConsent)
          setShowBanner(false)
        }
      } catch (error) {
        console.error("Failed to parse stored cookie consent", error)
        setShowBanner(true)
      }
    } else {
      setShowBanner(true)
    }

    const handleOpenCookieSettings = () => {
      setShowDetails(true)
      setShowBanner(false)
    }

    window.addEventListener("open-cookie-settings", handleOpenCookieSettings)

    return () => {
      window.removeEventListener("open-cookie-settings", handleOpenCookieSettings)
    }
  }, [])

  const persistConsent = (updatedConsent: CookieConsent) => {
    localStorage.setItem("cookieConsent", JSON.stringify(updatedConsent))
    setConsent(updatedConsent)
    setShowBanner(false)
    setShowDetails(false)

    if (!updatedConsent.analytics) {
      trackingInitializedRef.current = false
      return
    }

    if (trackingInitializedRef.current) {
      return
    }

    trackingInitializedRef.current = true

    void import("@/lib/track-pageview").then(({ trackPageView }) => {
      void trackPageView(window.location.pathname)
    })
  }

  const saveConsent = (newConsent: Partial<CookieConsent>) => {
    const updatedConsent: CookieConsent = {
      ...consent,
      ...newConsent,
      timestamp: Date.now(),
    }

    persistConsent(updatedConsent)
  }

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
    })
  }

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
    })
  }

  const savePreferences = () => {
    saveConsent(consent)
  }

  const toggleConsent = (type: keyof Omit<CookieConsent, "timestamp">) => {
    if (type === "necessary") return

    setConsent({
      ...consent,
      [type]: !consent[type],
    })
  }

  if (!showBanner && !showDetails) {
    return null
  }

  return (
    <>
      {/* Main Cookie Banner */}
      {showBanner && !showDetails && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="mb-2 font-sans text-lg font-semibold">Cookies and statistics</h2>
                <p className="text-sm text-muted-foreground">
                  Necessary storage keeps the site working. Page-view statistics only run if you
                  allow them, and you can change your choice at any time under Cookie settings.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                <Button variant="outline" onClick={() => setShowDetails(true)}>
                  Cookie settings
                </Button>
                <Button variant="outline" onClick={acceptNecessary}>
                  Necessary only
                </Button>
                <Button onClick={acceptAll}>Accept all</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Cookie Settings Sheet */}
      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto" side="right">
          <SheetHeader className="mb-4">
            <SheetTitle>Cookie settings</SheetTitle>
            <SheetDescription>
              Choose what the site may store. You can change this at any time.
            </SheetDescription>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cookie-policy">Cookie Policy</TabsTrigger>
              <TabsTrigger value="cookie-settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="cookie-policy" className="mt-4 space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">What this site stores</h4>
                <p className="text-sm text-muted-foreground">
                  There are two categories. The site shows no ads and uses no advertising or
                  cross-site tracking.
                </p>

                <div className="space-y-2">
                  <h5 className="font-medium">Necessary</h5>
                  <p className="text-sm text-muted-foreground">
                    Keeps the site working: your sign-in session, your light or dark theme and this
                    cookie choice. These are always on.
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium">Analytics</h5>
                  <p className="text-sm text-muted-foreground">
                    Counts page views on this site only, with a hashed IP address, browser type,
                    referrer and page address. Nothing is shared with other services. Off unless you
                    allow it.
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium">Cookie Expiration</h5>
                  <p className="text-sm text-muted-foreground">
                    Your cookie preferences will be stored for {COOKIE_EXPIRATION_DAYS} days, after
                    which you will be asked to confirm your choices again.
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">
                  Detailed information about how we process personal data can be found in our{" "}
                  <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </TabsContent>

            <TabsContent value="cookie-settings" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="necessary" className="font-medium">
                      Necessary
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Sign-in session, theme and this choice. Always on
                    </p>
                  </div>
                  <Switch id="necessary" checked={consent.necessary} disabled />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics" className="font-medium">
                      Analytics
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Page views on this site, with a hashed IP address
                    </p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={consent.analytics}
                    onCheckedChange={() => toggleConsent("analytics")}
                  />
                </div>

              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={acceptNecessary}>
                  Necessary only
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={acceptAll}>
                    Accept all
                  </Button>
                  <Button onClick={savePreferences}>Save choice</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  )
}
