import type { Metadata } from "next"

import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Write to Tim Hauke about a project, freelance work or a job. German or English, by form or email at contact@uplytech.de.",
  path: "/contact",
})

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
