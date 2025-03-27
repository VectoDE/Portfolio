import { Suspense } from "react"
import { getAllCareerEntries } from "@/lib/career"
import { CareerTimelineSkeleton } from "@/components/skeletons/career-timeline-skeleton"
import type { Career } from "@/types/database"

async function CareerTimelineContent() {
    const careerEntries = await getAllCareerEntries()

    return (
        <div className="relative mx-auto max-w-3xl">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-purple-600 to-blue-600"></div>

            {careerEntries.map((entry: Career, index) => {
                const isEven = index % 2 === 0
                const startDate = new Date(entry.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
                const endDate =
                    entry.endDate === "Present" || !entry.endDate
                        ? "Present"
                        : new Date(entry.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })

                return (
                    <div key={entry.id} className="relative mb-12">
                        {/* Timeline dot */}
                        <div className="absolute left-1/2 top-6 h-4 w-4 -translate-x-1/2 rounded-full bg-primary"></div>

                        {/* Content */}
                        <div className={`flex ${isEven ? "flex-row" : "flex-row-reverse"} items-start`}>
                            <div className="w-1/2"></div>
                            <div className={`w-1/2 ${isEven ? "pl-8" : "pr-8"}`}>
                                <div className="rounded-lg bg-background/60 backdrop-blur-sm border border-primary/20 p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <h3 className="text-lg font-bold">{entry.position}</h3>
                                    <p className="text-primary font-medium">{entry.company}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {startDate} - {endDate}
                                    </p>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{entry.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export function CareerTimeline() {
    return (
        <Suspense fallback={<CareerTimelineSkeleton />}>
            <CareerTimelineContent />
        </Suspense>
    )
}

