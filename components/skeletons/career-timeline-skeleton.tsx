import { Skeleton } from "@/components/ui/skeleton"

export function CareerTimelineSkeleton() {
  return (
    <div className="relative mx-auto max-w-3xl">
      {/* Timeline line */}
      <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-muted"></div>

      {[1, 2, 3].map((i) => {
        const isEven = i % 2 === 0

        return (
          <div key={i} className="relative mb-12">
            {/* Timeline dot */}
            <div className="absolute left-1/2 top-6 h-4 w-4 -translate-x-1/2 rounded-full bg-muted"></div>

            {/* Content */}
            <div className={`flex ${isEven ? "flex-row" : "flex-row-reverse"} items-start`}>
              <div className="w-1/2"></div>
              <div className={`w-1/2 ${isEven ? "pl-8" : "pr-8"}`}>
                <div className="rounded-lg bg-background/60 backdrop-blur-sm border border-muted p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-1/3 mb-3" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
