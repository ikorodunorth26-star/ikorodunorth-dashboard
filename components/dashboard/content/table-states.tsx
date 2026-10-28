import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

export function ContentTableSkeleton({
  columns,
  rows = 6,
  withMedia = true,
  withSubtitle = false,
}: {
  columns: number
  rows?: number
  withMedia?: boolean
  withSubtitle?: boolean
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <TableRow key={rowIndex} aria-hidden="true">
          <TableCell>
            <Skeleton className="h-4 w-6" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-3">
              {withMedia ? <Skeleton className="size-12 shrink-0 rounded-lg" /> : null}
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-48 max-w-full" />
                {withSubtitle ? <Skeleton className="h-3 w-24" /> : null}
              </div>
            </div>
          </TableCell>
          {Array.from({ length: Math.max(columns - 3, 0) }, (_, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton className="h-4 w-20" />
            </TableCell>
          ))}
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-8 w-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function ContentTableEmpty({
  columns,
  title,
  description,
  action,
}: {
  columns: number
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <TableRow>
      <TableCell colSpan={columns} className="h-56">
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-8 text-center">
          <div className="flex flex-col gap-1">
            <p className="text-base font-medium">{title}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
          </div>
          {action ? <div className="pt-1">{action}</div> : null}
        </div>
      </TableCell>
    </TableRow>
  )
}

export function ContentTableLoading({
  columns,
  label = "Loading",
  withMedia = true,
  withSubtitle = false,
}: {
  columns: number
  label?: string
  withMedia?: boolean
  withSubtitle?: boolean
}) {
  return (
    <>
      <TableRow className="sr-only">
        <TableCell colSpan={columns}>
          <span role="status" aria-live="polite">
            {label}
          </span>
        </TableCell>
      </TableRow>
      <ContentTableSkeleton
        columns={columns}
        withMedia={withMedia}
        withSubtitle={withSubtitle}
      />
    </>
  )
}
