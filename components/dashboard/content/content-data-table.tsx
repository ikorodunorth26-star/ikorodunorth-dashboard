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
        <img src={imageUrl} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="size-12 shrink-0 rounded-lg bg-muted" />
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

function RowActionsMenu({
  label,
  actions,
  disabled,
}: {
  label: string
  actions: ContentTableAction[]
  disabled?: boolean
}) {
  const visible = actions.filter((action) => !action.hidden)
  const firstDestructive = visible.findIndex((action) => action.destructive)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          aria-label={`Actions for ${label}`}
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {visible.map((action, actionIndex) => {
          const showSeparator =
            firstDestructive > 0 && actionIndex === firstDestructive

          const itemNode = action.href ? (
            action.external ? (
              <a href={action.href} target="_blank" rel="noreferrer">
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
  const [primaryColumn, ...detailColumns] = columns

  return (
    <div className="max-w-full overflow-hidden rounded-xl border">
      {loading ? (
        <div className="p-2 md:hidden">
          <Table>
            <TableBody>
              <ContentTableLoading
                columns={1}
                label={loadingLabel}
                withSubtitle={withSubtitleSkeleton}
              />
            </TableBody>
          </Table>
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="p-4 md:hidden">
          <div className="flex flex-col items-start gap-3 py-6 text-center sm:items-center">
            <div>
              <p className="font-medium">{emptyTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
            </div>
            {emptyAction}
          </div>
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="flex flex-col gap-3 p-3 md:hidden">
          {rows.map((item, index) => (
            <article
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border bg-muted/15 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    #{serialNumber(page, index)}
                  </p>
                  <div className="mt-1 min-w-0">
                    {primaryColumn ? primaryColumn.cell(item) : getRowLabel(item)}
                  </div>
                </div>
                <RowActionsMenu
                  label={getRowLabel(item)}
                  actions={actionsForRow(item)}
                  disabled={busyId === item.id}
                />
              </div>
              {detailColumns.length > 0 ? (
                <dl className="grid gap-2 text-sm">
                  {detailColumns.map((column) => (
                    <div
                      key={column.id}
                      className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-border/60 pt-2"
                    >
                      <dt className="text-xs font-medium text-muted-foreground">
                        {column.header}
                      </dt>
                      <dd className="min-w-0 text-right">{column.cell(item)}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      <div className="hidden md:block">
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
              ? rows.map((item, index) => (
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
                      <RowActionsMenu
                        label={getRowLabel(item)}
                        actions={actionsForRow(item)}
                        disabled={busyId === item.id}
                      />
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>
      {!loading ? (
        <TablePagination page={page} total={items.length} onPageChange={onPageChange} />
      ) : null}
    </div>
  )
}
