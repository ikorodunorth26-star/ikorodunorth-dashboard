"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons"

import { TablePagination } from "@/components/dashboard/content/table-pagination"
import {
  ContentTableEmpty,
  ContentTableLoading,
} from "@/components/dashboard/content/table-states"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { pageSlice, serialNumber } from "@/lib/table-page"

export type ContentTableColumn<T> = {
  id: string
  header: string
  className?: string
  headerClassName?: string
  cell: (item: T) => ReactNode
}

export type ContentTableAction = {
  label: string
  href?: string
  external?: boolean
  onSelect?: () => void
  destructive?: boolean
  hidden?: boolean
}

export function ContentMediaCell({
  title,
  subtitle,
  imageUrl,
}: {
  title: string
  subtitle?: string
  imageUrl?: string | null
}) {
  return (
    <div className="flex items-center gap-3">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="size-12 rounded-lg object-cover" />
      ) : (
        <div className="size-12 rounded-lg bg-muted" />
      )}
      <div className="flex min-w-0 flex-col">
        <span className="font-medium whitespace-normal">{title}</span>
        {subtitle ? (
          <span className="text-muted-foreground whitespace-normal">{subtitle}</span>
        ) : null}
      </div>
    </div>
  )
}

export function ContentDataTable<T extends { id: string }>({
  columns,
  items,
  page,
  onPageChange,
  loading,
  loadingLabel = "Loading",
  emptyTitle,
  emptyDescription,
  emptyAction,
  getRowLabel,
  actionsForRow,
  busyId = null,
  withSubtitleSkeleton = false,
}: {
  columns: ContentTableColumn<T>[]
  items: T[]
  page: number
  onPageChange: (page: number) => void
  loading: boolean
  loadingLabel?: string
  emptyTitle: string
  emptyDescription: string
  emptyAction?: ReactNode
  getRowLabel: (item: T) => string
  actionsForRow: (item: T) => ContentTableAction[]
  busyId?: string | null
  withSubtitleSkeleton?: boolean
}) {
  const columnCount = columns.length + 2
  const rows = pageSlice(items, page)

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">S/N</TableHead>
            {columns.map((column) => (
              <TableHead key={column.id} className={column.headerClassName}>
                {column.header}
              </TableHead>
            ))}
            <TableHead className="w-16 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <ContentTableLoading
              columns={columnCount}
              label={loadingLabel}
              withSubtitle={withSubtitleSkeleton}
            />
          ) : null}
          {!loading && items.length === 0 ? (
            <ContentTableEmpty
              columns={columnCount}
              title={emptyTitle}
              description={emptyDescription}
              action={emptyAction}
            />
          ) : null}
          {!loading
            ? rows.map((item, index) => {
                const actions = actionsForRow(item).filter((action) => !action.hidden)
                const firstDestructive = actions.findIndex((action) => action.destructive)

                return (
                  <TableRow key={item.id}>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {serialNumber(page, index)}
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={column.id} className={column.className}>
                        {column.cell(item)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={busyId === item.id}
                            aria-label={`Actions for ${getRowLabel(item)}`}
                          >
                            <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          {actions.map((action, actionIndex) => {
                            const showSeparator =
                              firstDestructive > 0 && actionIndex === firstDestructive

                            const itemNode = action.href ? (
                              action.external ? (
                                <a
                                  href={action.href}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {action.label}
                                </a>
                              ) : (
                                <Link href={action.href}>{action.label}</Link>
                              )
                            ) : (
                              action.label
                            )

                            return (
                              <div key={`${action.label}-${actionIndex}`}>
                                {showSeparator ? <DropdownMenuSeparator /> : null}
                                {action.href ? (
                                  <DropdownMenuItem
                                    asChild
                                    variant={action.destructive ? "destructive" : "default"}
                                  >
                                    {itemNode}
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    variant={action.destructive ? "destructive" : "default"}
                                    onSelect={() => {
                                      action.onSelect?.()
                                    }}
                                  >
                                    {itemNode}
                                  </DropdownMenuItem>
                                )}
                              </div>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            : null}
        </TableBody>
      </Table>
      {!loading ? (
        <TablePagination page={page} total={items.length} onPageChange={onPageChange} />
      ) : null}
    </div>
  )
}
