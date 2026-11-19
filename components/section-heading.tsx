import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface SectionHeadingProps {
  id: string
  title: string
  description?: string
  action?: { href: string; label: string }
  as?: "h1" | "h2"
}

/** Left-aligned section title with an optional one-line description and link. */
export function SectionHeading({
  id,
  title,
  description,
  action,
  as: Heading = "h2",
}: Readonly<SectionHeadingProps>) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <Heading
          id={id}
          className={`font-display ${Heading === "h1" ? "text-5xl md:text-6xl" : "text-4xl md:text-5xl"}`}
        >
          {title}
        </Heading>
        {description ? (
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 font-medium text-primary underline-offset-4 hover:underline"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  )
}
