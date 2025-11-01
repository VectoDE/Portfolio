export default function LoadingProjectView() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded bg-muted animate-pulse" />
        <div className="h-4 w-80 rounded bg-muted/80 animate-pulse" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-primary/10 bg-background/60 p-6">
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full rounded bg-muted/70 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-muted/50 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-muted/30 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
