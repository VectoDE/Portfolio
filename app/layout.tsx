/* eslint-disable react-refresh/only-export-components */
import type { Metadata, Viewport } from "next"
import Script from "next/script"

import { getSiteUrl, siteProfile } from "@/lib/site"
import { Providers } from "@/components/providers"

import "./globals.css"

const metadataBase = new URL(getSiteUrl())

const siteName = siteProfile.name
const siteDescription = siteProfile.defaultDescription

export const metadata: Metadata = {
  metadataBase,
  applicationName: siteName,
  title: {
    default: `${siteName} | Full Stack Developer`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "Tim Hauke",
    "full stack developer",
    "Next.js portfolio",
    "web development projects",
    "TypeScript engineer",
    "frontend developer",
    "backend developer",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/placeholder-logo.svg", type: "image/svg+xml" },
      { url: "/placeholder-logo.png", type: "image/png" },
    ],
    apple: "/placeholder-logo.png",
    shortcut: "/placeholder-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: metadataBase.origin,
    title: `${siteName} | Full Stack Developer`,
    description: siteDescription,
    siteName,
    images: [
      {
        url: `${metadataBase.origin}/placeholder-logo.png`,
        width: 1200,
        height: 630,
        alt: `${siteName} portfolio hero image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: siteProfile.twitterHandle,
    title: `${siteName} | Full Stack Developer`,
    description: siteDescription,
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
    statusBarStyle: "black-translucent",
    title: siteName,
  },
}

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#09090b" }, { color: "#ffffff" }],
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name: siteName,
      url: metadataBase.origin,
      jobTitle: "Full Stack Developer",
      image: `${metadataBase.origin}/placeholder-logo.png`,
      sameAs: [
        "https://www.linkedin.com/in/tim-hauke-b3b24b2b5/",
        "https://github.com/VectoDE",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: "tim.hauke@hauknetz.de",
        contactType: "customer support",
        availableLanguage: ["English", "German"],
      },
    },
    {
      "@type": "WebSite",
      name: siteName,
      url: metadataBase.origin,
      inLanguage: "en",
      description: siteDescription,
      potentialAction: {
        "@type": "SearchAction",
        target: `${metadataBase.origin}/projects?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      name: `${siteName} | Full Stack Developer Portfolio`,
      url: metadataBase.origin,
      description: siteDescription,
      breadcrumb: {
        "@id": `${metadataBase.origin}#breadcrumb`,
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${metadataBase.origin}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: metadataBase.origin,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Projects",
          item: `${metadataBase.origin}/projects`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Contact",
          item: `${metadataBase.origin}/contact`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Newsletter",
          item: `${metadataBase.origin}/newsletter`,
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "Unsubscribe",
          item: `${metadataBase.origin}/unsubscribe`,
        },
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <Providers>{children}</Providers>
        <Script id="structured-data" type="application/ld+json">
          {JSON.stringify(structuredData)}
        </Script>
      </body>
    </html>
  )
}
