import type { ReactNode } from "react"

interface AnimatedSectionProps {
  children: ReactNode
  /** Kept for call-site compatibility; sections no longer animate on scroll. */
  delay?: number
  className?: string
  id?: string
  "aria-labelledby"?: string
}

// Sections render statically: scroll-triggered fade-ins hid content until it was
// scrolled into view and added motion without telling the reader anything.
export function AnimatedSection({
  children,
  className,
  id,
  "aria-labelledby": labelledBy,
}: Readonly<AnimatedSectionProps>) {
  return (
    <section className={className} id={id} aria-labelledby={labelledBy}>
      {children}
    </section>
  )
}
