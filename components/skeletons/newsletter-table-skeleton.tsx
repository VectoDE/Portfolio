import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

export function NewsletterTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Skeleton className="h-10 w-[180px]" />
                <Skeleton className="h-10 w-full sm:w-[300px]" />
            </div>

            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox disabled />
                                </TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Preferences</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Checkbox disabled />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-[200px]" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-[100px]" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-[150px]" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-[80px]" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
