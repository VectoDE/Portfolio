import type { MetadataRoute } from "next"

import { getSiteUrl, siteProfile } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteProfile.name} | ${siteProfile.title}`,
    short_name: siteProfile.name,
    description: siteProfile.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#0C1424",
    theme_color: "#0C1424",
    lang: "en",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
    scope: "/",
    id: getSiteUrl(),
    categories: ["technology", "portfolio", "software"],
  }
}
