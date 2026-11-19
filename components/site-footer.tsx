"use client"

import Link from "next/link"

import { profile } from "@/lib/content"

const footerLinks = [
  { href: "/newsletter", label: "Newsletter" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/impressum", label: "Impressum" },
]

const linkClass = "text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"

export function SiteFooter() {
  const handleOpenCookieSettings = () => {
    window.dispatchEvent(new Event("open-cookie-settings"))
  }

  return (
    <footer className="w-full border-t bg-card">
      <div className="container grid gap-8 px-4 py-10 md:grid-cols-[1fr_auto] md:px-6">
        <div>
          <p className="font-display text-2xl">{profile.name}</p>
          <p className="mt-2 text-muted-foreground">
            {profile.jobTitle} in {profile.location}.{" "}
            <a
              href={`mailto:${profile.contact.email}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {profile.contact.email}
            </a>
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Profiles">
            {profile.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className={linkClass}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Legal and settings" className="md:text-right">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm md:flex-col md:items-end">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <button type="button" onClick={handleOpenCookieSettings} className={linkClass}>
                Cookie settings
              </button>
            </li>
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            © {new Date().getFullYear()} {profile.name}
          </p>
        </nav>
      </div>
    </footer>
  )
}
