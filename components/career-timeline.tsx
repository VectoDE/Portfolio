import { Suspense } from "react"

import { getAllCareerEntries } from "@/lib/career"
import { CareerTimelineSkeleton } from "@/components/skeletons/career-timeline-skeleton"

function period(start: Date | string, end: Date | string | null) {
  // Content only records years reliably, so the timeline shows years.
  const from = new Date(start).getUTCFullYear()
  const to = !end || end === "Present" ? "today" : new Date(end).getUTCFullYear()
  return from === to ? String(from) : `${from}–${to}`
}

async function CareerTimelineContent() {
  const careerEntries = await getAllCareerEntries()

  if (careerEntries.length === 0) {
    return <p className="text-muted-foreground">No roles listed yet.</p>
  }

  return (
    <ol className="relative max-w-3xl border-l-2 border-border pl-6 sm:pl-8">
      {careerEntries.map((entry) => (
        <li key={entry.id} className="relative pb-10 last:pb-0">
          <span
            className="absolute -left-[calc(1.5rem+7px)] top-1.5 h-3 w-3 border-2 border-primary bg-background sm:-left-[calc(2rem+7px)]"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">{period(entry.startDate, entry.endDate)}</p>
          <h3 className="mt-1 text-lg font-semibold">{entry.position}</h3>
          <p className="font-medium text-primary">
            {entry.company}
            {entry.location ? (
              <span className="font-normal text-muted-foreground">, {entry.location}</span>
            ) : null}
          </p>
          <p className="mt-2 max-w-prose leading-relaxed text-muted-foreground">
            {entry.description}
          </p>
        </li>
      ))}
    </ol>
  )
}

export function CareerTimeline() {
  return (
    <Suspense fallback={<CareerTimelineSkeleton />}>
      <CareerTimelineContent />
    </Suspense>
  )
}
