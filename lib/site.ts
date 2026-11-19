const defaultSiteUrl = "https://portfolio-phi-one-95.vercel.app"

export function getSiteUrl(path = "") {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const normalizedBase = (() => {
    if (appUrl && appUrl.trim().length > 0) {
      const candidate = appUrl.trim()
      try {
        return new URL(candidate.startsWith("http") ? candidate : `https://${candidate}`)
      } catch (error) {
        console.error("Invalid NEXT_PUBLIC_APP_URL provided", error)
      }
    }

    return new URL(defaultSiteUrl)
  })()

  const pathname = path.startsWith("/") ? path : `/${path}`
  return `${normalizedBase.origin}${pathname === "/" ? "" : pathname}`
}

export const siteProfile = {
  name: "Tim Hauke",
  title: "Full-stack developer",
  defaultDescription:
    "Tim Hauke is a self-taught full-stack developer from Itzehoe and founder of UplyTech. He builds websites, web apps, APIs and Discord bots and runs them on his own servers.",
  locale: "en_US",
  twitterHandle: "@vecto_de",
}
