const defaultSiteUrl = "https://www.hauknetz.de"

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
  title: "Full Stack Developer",
  defaultDescription:
    "Full stack developer portfolio showcasing projects, technical skills, case studies, and newsletter updates.",
  locale: "en_US",
  twitterHandle: "@TimHauke",
}
