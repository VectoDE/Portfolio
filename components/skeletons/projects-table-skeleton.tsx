import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function ProjectsTableSkeleton() {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Technologies</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[1, 2, 3].map((i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton className="h-5 w-32" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-5 w-full max-w-[300px]" />
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {[1, 2, 3].map((j) => (
                                        <Skeleton key={j} className="h-6 w-16 rounded-md" />
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-5 w-10" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

