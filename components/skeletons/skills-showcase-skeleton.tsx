import { Skeleton } from "@/components/ui/skeleton"

export function SkillsShowcaseSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-4 p-6 bg-background/60 backdrop-blur-sm rounded-xl border border-primary/20"
        >
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-6 w-24" />
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton key={j} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
