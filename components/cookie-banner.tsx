"use client"

import { useState, useEffect } from "react"
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
  marketing: boolean
  preferences: boolean
  timestamp: number
}

const defaultConsent: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
  timestamp: Date.now(),
}

const COOKIE_EXPIRATION_DAYS = 7
const COOKIE_EXPIRATION_MS = COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent)
  const [activeTab, setActiveTab] = useState("cookie-policy")

  useEffect(() => {
    const storedConsent = localStorage.getItem("cookieConsent")

    if (storedConsent) {
      const parsedConsent = JSON.parse(storedConsent) as CookieConsent
      const isExpired = Date.now() - parsedConsent.timestamp > COOKIE_EXPIRATION_MS

      if (isExpired) {
        setShowBanner(true)
      } else {
        setConsent(parsedConsent)
        setShowBanner(false)
      }
    } else {
      setShowBanner(true)
    }
  }, [])

  const saveConsent = (newConsent: Partial<CookieConsent>) => {
    const updatedConsent = {
      ...consent,
      ...newConsent,
      timestamp: Date.now(),
    }

    localStorage.setItem("cookieConsent", JSON.stringify(updatedConsent))
    setConsent(updatedConsent)
    setShowBanner(false)
    setShowDetails(false)

    trackUserActivity()
  }

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    })
  }

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    })
  }

  const savePreferences = () => {
    saveConsent(consent)
  }

  const trackUserActivity = () => {
    console.log("User activity tracking initialized regardless of consent")

    const currentPath = window.location.pathname

    import("@/lib/track-pageview").then(({ trackPageView }) => {
      trackPageView(currentPath)

      const originalPushState = history.pushState
      history.pushState = function (state: unknown, title: string, url?: string | URL | null) {
        originalPushState.call(this, state, title, url)
        trackPageView(window.location.pathname)
      }

      window.addEventListener("popstate", () => {
        trackPageView(window.location.pathname)
      })
    })
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
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">We value your privacy</h3>
                <p className="text-sm text-muted-foreground">
                  We use cookies to enhance your browsing experience, serve personalized ads or
                  content, and analyze our traffic. By clicking "Accept All", you consent to our use
                  of cookies.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                <Button variant="outline" onClick={() => setShowDetails(true)}>
                  Cookie Settings
                </Button>
                <Button variant="outline" onClick={acceptNecessary}>
                  Necessary Only
                </Button>
                <Button onClick={acceptAll}>Accept All</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Cookie Settings Sheet */}
      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto" side="right">
          <SheetHeader className="mb-4">
            <SheetTitle>Cookie Settings</SheetTitle>
            <SheetDescription>
              Customize your cookie preferences. You can change these settings at any time.
            </SheetDescription>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cookie-policy">Cookie Policy</TabsTrigger>
              <TabsTrigger value="cookie-settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="cookie-policy" className="mt-4 space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">About Cookies</h4>
                <p className="text-sm text-muted-foreground">
                  Cookies are small text files that are stored on your browser or device by
                  websites, apps, online media, and advertisements. We use cookies for various
                  purposes including:
                </p>

                <div className="space-y-2">
                  <h5 className="font-medium">Necessary Cookies</h5>
                  <p className="text-sm text-muted-foreground">
                    These cookies are essential for the website to function properly. They enable
                    basic functions like page navigation and access to secure areas of the website.
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium">Analytics Cookies</h5>
                  <p className="text-sm text-muted-foreground">
                    These cookies help us understand how visitors interact with our website by
                    collecting and reporting information anonymously.
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium">Marketing Cookies</h5>
                  <p className="text-sm text-muted-foreground">
                    These cookies are used to track visitors across websites. The intention is to
                    display ads that are relevant and engaging for the individual user.
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium">Preference Cookies</h5>
                  <p className="text-sm text-muted-foreground">
                    These cookies enable the website to remember information that changes the way
                    the website behaves or looks, like your preferred language or the region you are
                    in.
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium">Cookie Expiration</h5>
                  <p className="text-sm text-muted-foreground">
                    Your cookie preferences will be stored for {COOKIE_EXPIRATION_DAYS} days, after
                    which you will be asked to confirm your choices again.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cookie-settings" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="necessary" className="font-medium">
                      Necessary Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Required for the website to function properly
                    </p>
                  </div>
                  <Switch id="necessary" checked={consent.necessary} disabled />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics" className="font-medium">
                      Analytics Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Help us improve our website by collecting anonymous data
                    </p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={consent.analytics}
                    onCheckedChange={() => toggleConsent("analytics")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing" className="font-medium">
                      Marketing Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Used to deliver personalized advertisements
                    </p>
                  </div>
                  <Switch
                    id="marketing"
                    checked={consent.marketing}
                    onCheckedChange={() => toggleConsent("marketing")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="preferences" className="font-medium">
                      Preference Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Remember your settings and preferences
                    </p>
                  </div>
                  <Switch
                    id="preferences"
                    checked={consent.preferences}
                    onCheckedChange={() => toggleConsent("preferences")}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={acceptNecessary}>
                  Necessary Only
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={acceptAll}>
                    Accept All
                  </Button>
                  <Button onClick={savePreferences}>Save Preferences</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  )
}
