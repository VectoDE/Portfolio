import type { MetadataRoute } from "next"

import { getSiteUrl, siteProfile } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteProfile.name} | ${siteProfile.title}`,
    short_name: siteProfile.name,
    description: siteProfile.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#4338ca",
    lang: "en",
    icons: [
      {
        src: "/placeholder-logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/placeholder-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/placeholder-logo.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
    scope: "/",
    id: getSiteUrl(),
    categories: ["technology", "portfolio", "software"],
  }
}
