import type { Metadata } from "next"

import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Create an account",
  description: "Create an account to react to projects and join the discussion.",
  path: "/register",
  noindex: true,
})

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
