"use client"

import type { ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type RepeatableListProps<T> = {
  title: string
  description?: string
  items: T[]
  onChange: (items: T[]) => void
  createItem: () => T
  renderItem: (
    item: T,
    index: number,
    update: (patch: Partial<T>) => void,
  ) => ReactNode
  addLabel?: string
  emptyLabel?: string
  getKey?: (item: T, index: number) => string
}

export function RepeatableList<T>({
  title,
  description,
  items,
  onChange,
  createItem,
  renderItem,
  addLabel = "Add item",
  emptyLabel = "No items yet.",
  getKey,
}: RepeatableListProps<T>) {
  function move(index: number, direction: -1 | 1) {
    const next = index + direction
    if (next < 0 || next >= items.length) return
    const copy = [...items]
    const [item] = copy.splice(index, 1)
    copy.splice(next, 0, item)
    onChange(copy)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, createItem()])}
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
          {addLabel}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          items.map((item, index) => (
            <div
              key={getKey?.(item, index) ?? index}
              className="rounded-2xl border bg-muted/20 p-4"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">Item {index + 1}</p>
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Move item ${index + 1} up`}
                  >
                    <HugeiconsIcon icon={ArrowUp01Icon} className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Move item ${index + 1} down`}
                  >
                    <HugeiconsIcon icon={ArrowDown01Icon} className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onChange(items.filter((_, itemIndex) => itemIndex !== index))
                    }
                    aria-label={`Remove item ${index + 1}`}
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                  </Button>
                </div>
              </div>
              {renderItem(item, index, (patch) => {
                onChange(
                  items.map((current, itemIndex) =>
                    itemIndex === index ? { ...current, ...patch } : current,
                  ),
                )
              })}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
