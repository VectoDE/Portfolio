import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()
  const disallow = ["/api/", "/dashboard", "/account"]
  return {
    rules: [
      // Search and AI answer engines may read the public pages; private areas stay closed.
      { userAgent: "*", allow: "/", disallow },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
