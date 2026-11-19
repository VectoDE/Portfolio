import type { Metadata } from "next"

import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to comment on projects and manage your newsletter settings.",
  path: "/login",
  noindex: true,
})

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
