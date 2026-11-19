/* eslint-disable react-refresh/only-export-components */
import type { Metadata, Viewport } from "next"
import { Gloock, Onest } from "next/font/google"
import Script from "next/script"

import { profile } from "@/lib/content"
import { ogImage } from "@/lib/seo"
import { getSiteUrl, siteProfile } from "@/lib/site"
import { Providers } from "@/components/providers"

import "./globals.css"

// Typefaces of the VectoDE profile artwork, both under the SIL Open Font License.
// next/font downloads them at build time and serves them from this site.
const fontSans = Onest({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
})
const fontDisplay = Gloock({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
})

const metadataBase = new URL(getSiteUrl())

const siteName = siteProfile.name
const siteDescription = siteProfile.defaultDescription

export const metadata: Metadata = {
  metadataBase,
  applicationName: siteName,
  title: {
    default: `${siteName} | ${siteProfile.title}`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "Tim Hauke",
    "VectoDE",
    "UplyTech",
    "full-stack developer",
    "web developer Itzehoe",
    "Next.js developer",
    "TypeScript",
    "Discord bot developer",
  ],
  authors: [{ name: siteName, url: metadataBase.origin }],
  creator: siteName,
  publisher: siteName,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteProfile.locale,
    url: "/",
    title: `${siteName} | ${siteProfile.title}`,
    description: siteDescription,
    siteName,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    site: siteProfile.twitterHandle,
    creator: siteProfile.twitterHandle,
    title: `${siteName} | ${siteProfile.title}`,
    description: siteDescription,
    images: [ogImage.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? {
          "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
        }
      : undefined,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
}

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#0C1424" }, { color: "#F7F9FC" }],
}

const personId = `${metadataBase.origin}/#person`

// Only public, professional data: no street address, birth date or phone number.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: profile.name,
      alternateName: profile.handle,
      url: metadataBase.origin,
      jobTitle: profile.jobTitle,
      description: siteDescription,
      image: `${metadataBase.origin}/images/tim-hauke/square-1024.webp`,
      email: `mailto:${profile.contact.email}`,
      address: { "@type": "PostalAddress", addressLocality: "Itzehoe", addressCountry: "DE" },
      knowsLanguage: ["de", "en"],
      knowsAbout: [
        "TypeScript",
        "Next.js",
        "React",
        "Node.js",
        "Python",
        "Go",
        "Docker",
        "Cloudflare",
        "Discord bots",
      ],
      founder: { "@type": "Organization", name: "UplyTech", url: "https://www.uplytech.de" },
      sameAs: profile.links.filter((link) => link.label !== "UplyTech").map((link) => link.url),
    },
    {
      "@type": "WebSite",
      "@id": `${metadataBase.origin}/#website`,
      name: siteName,
      url: metadataBase.origin,
      inLanguage: "en",
      description: siteDescription,
      author: { "@id": personId },
      publisher: { "@id": personId },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontDisplay.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <Providers>{children}</Providers>
        <Script id="structured-data" type="application/ld+json">
          {JSON.stringify(structuredData)}
        </Script>
      </body>
    </html>
  )
}
