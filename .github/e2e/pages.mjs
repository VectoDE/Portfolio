// Public pages covered by the screenshot and accessibility runs.
export const pages = [
  { name: "home", path: "/" },
  { name: "about", path: "/about" },
  { name: "projects", path: "/projects" },
  { name: "project-detail", path: "/projects/tellersonne" },
  { name: "contact", path: "/contact" },
  { name: "newsletter", path: "/newsletter" },
  { name: "unsubscribe", path: "/unsubscribe" },
  { name: "login", path: "/login" },
  { name: "register", path: "/register" },
  { name: "privacy", path: "/privacy" },
  { name: "impressum", path: "/impressum" },
  { name: "not-found", path: "/this-page-does-not-exist" },
]

export const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]

export const themes = ["light", "dark"]

// Stored consent hides the cookie banner so it does not cover the page.
export function initScript(theme) {
  const consent = { necessary: true, analytics: false }
  return `
    try {
      localStorage.setItem("theme", ${JSON.stringify(theme)});
      localStorage.setItem("cookieConsent", JSON.stringify(Object.assign(${JSON.stringify(consent)}, { timestamp: Date.now() })));
    } catch (e) {}
  `
}

// Scrolls through the page so scroll-triggered sections render before capture.
export async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {})
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8))
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 120))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(800)
}
