import { Skeleton } from "@/components/ui/skeleton"

export function ContactsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-full sm:w-[300px]" />
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Subject</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-5 w-40" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-5 w-24" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center">
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  )
}
