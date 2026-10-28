"use client"

import { Button } from "@/components/ui/button"
import { pageCount, TABLE_PAGE_SIZE } from "@/lib/table-page"

export function TablePagination({
  page,
  total,
  pageSize = TABLE_PAGE_SIZE,
  onPageChange,
}: {
  page: number
  total: number
  pageSize?: number
  onPageChange: (page: number) => void
}) {
  if (total === 0) return null

  const pages = pageCount(total, pageSize)
  const safePage = Math.min(Math.max(page, 1), pages)
  const from = (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          Previous
        </Button>
        <span className="min-w-16 text-center text-sm tabular-nums text-muted-foreground">
          {safePage} / {pages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={safePage >= pages}
          onClick={() => onPageChange(safePage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
