import type { Metadata } from "next"

import { siteProfile } from "@/lib/site"

interface PageMetadataInput {
  /** Page title without the site name; the root layout template appends it. */
  title: string
  description: string
  /** Path starting with "/", used for the canonical URL and og:url. */
  path: string
  type?: "website" | "profile" | "article"
  /** Keep the page out of search results (account and form-only pages). */
  noindex?: boolean
  /** Use the title as is, without the site-name template (start page). */
  absoluteTitle?: boolean
}

export const ogImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${siteProfile.name}, ${siteProfile.title} and founder of UplyTech`,
}

/**
 * Builds title, description, canonical URL, Open Graph and Twitter tags for one page.
 * Child metadata replaces the parent's openGraph object in Next.js, so every page sets it fully.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  noindex = false,
  absoluteTitle = false,
}: PageMetadataInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${siteProfile.name}`
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      title: fullTitle,
      description,
      siteName: siteProfile.name,
      locale: siteProfile.locale,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      site: siteProfile.twitterHandle,
      creator: siteProfile.twitterHandle,
      title: fullTitle,
      description,
      images: [ogImage.url],
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  }
}
