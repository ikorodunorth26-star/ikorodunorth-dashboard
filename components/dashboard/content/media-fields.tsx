"use client"

import { useEffect, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError, uploadImage } from "@/lib"
import { showNotification } from "@/lib/showNotification"

const MAX_BYTES = 8 * 1024 * 1024

export type ImageDraft = {
  mediaId: string
  url: string
  alt: string
}

export type GalleryDraft = ImageDraft & {
  key: string
  caption: string
}

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Upload failed"
}

async function sendFile(file: File, alt: string): Promise<ImageDraft> {
  if (!file.type.startsWith("image/")) {
    throw new ApiError("Choose an image file", 400)
  }
  if (file.size > MAX_BYTES) {
    throw new ApiError("Image is larger than 8 MB", 400)
  }
  const uploaded = await uploadImage(file, alt)
  return { mediaId: uploaded.id, url: uploaded.url, alt: uploaded.alt || alt }
}

export function FeaturedImageField({
  image,
  title,
  caption,
  showCaption,
  onImage,
  onCaption,
}: {
  image: ImageDraft | null
  title: string
  caption?: string
  showCaption?: boolean
  onImage: (image: ImageDraft | null) => void
  onCaption?: (caption: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const alt = title.trim()

  async function choose(file: File | undefined) {
    if (!file) return
    setUploading(true)
    try {
      onImage(await sendFile(file, alt || "Featured image"))
    } catch (error) {
      showNotification({ type: "error", message: failure(error) })
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {image ? (
        <img
          src={image.url}
          alt={alt || "Featured image"}
          className="aspect-[16/10] w-full rounded-xl object-cover"
        />
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
          No featured image yet
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => void choose(event.target.files?.[0])}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading" : image ? "Replace image" : "Upload image"}
        </Button>
        {image ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onImage(null)}
          >
            Remove
          </Button>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="featured-alt">Alt text</Label>
        <Input
          id="featured-alt"
          value={alt}
          readOnly
          placeholder="Taken from the title"
        />
        <p className="text-xs text-muted-foreground">Taken from the title.</p>
      </div>
      {showCaption ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="featured-caption">Caption</Label>
          <Input
            id="featured-caption"
            value={caption ?? ""}
            onChange={(event) => onCaption?.(event.target.value)}
            placeholder="Shown under the lead photo"
          />
        </div>
      ) : null}
    </div>
  )
}

export function GalleryField({
  items,
  title,
  onChange,
}: {
  items: GalleryDraft[]
  title?: string
  onChange: (items: GalleryDraft[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const defaultAlt = title?.trim() || ""
  const selected =
    items.find((item) => item.key === selectedKey) ?? items[0] ?? null

  useEffect(() => {
    if (selectedKey && !items.some((item) => item.key === selectedKey)) {
      setSelectedKey(items[0]?.key ?? null)
    }
  }, [items, selectedKey])

  async function choose(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    const next = [...items]
    let lastKey: string | null = null
    try {
      for (const file of files) {
        const image = await sendFile(file, defaultAlt)
        const key = crypto.randomUUID()
        lastKey = key
        next.push({
          ...image,
          key,
          alt: image.alt || defaultAlt,
          caption: "",
        })
      }
      onChange(next)
      if (lastKey) setSelectedKey(lastKey)
    } catch (error) {
      onChange(next)
      showNotification({ type: "error", message: failure(error) })
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function move(direction: -1 | 1) {
    if (!selected) return
    const index = items.findIndex((item) => item.key === selected.key)
    const target = index + direction
    if (index < 0 || target < 0 || target >= items.length) return
    const next = [...items]
    const current = next[index]
    const swap = next[target]
    if (!current || !swap) return
    next[index] = swap
    next[target] = current
    onChange(next)
  }

  function updateSelected(patch: Partial<GalleryDraft>) {
    if (!selected) return
    onChange(
      items.map((entry) =>
        entry.key === selected.key ? { ...entry, ...patch } : entry
      )
    )
  }

  function removeSelected() {
    if (!selected) return
    const next = items.filter((entry) => entry.key !== selected.key)
    onChange(next)
    setSelectedKey(next[0]?.key ?? null)
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        onChange={(event) => void choose(event.target.files)}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {items.length === 0
            ? "No gallery photos yet"
            : `${items.length} photo${items.length === 1 ? "" : "s"}`}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
          {uploading ? "Uploading" : "Add photos"}
        </Button>
      </div>

      {items.length === 0 ? (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/40"
        >
          Drop-in extras for the story. JPEG, PNG, WebP, or GIF up to 8 MB.
        </button>
      ) : (
        <>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {items.map((item) => {
              const isSelected = selected?.key === item.key
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    className={
                      isSelected
                        ? "relative block w-full overflow-hidden rounded-lg ring-2 ring-ring"
                        : "relative block w-full overflow-hidden rounded-lg ring-1 ring-border"
                    }
                    aria-label={`Select gallery photo ${item.alt || ""}`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedKey(item.key)}
                  >
                    <img
                      src={item.url}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                </li>
              )
            })}
            <li>
              <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground transition-colors hover:bg-muted/40"
                aria-label="Add gallery photos"
              >
                <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                <span className="text-xs">Add</span>
              </button>
            </li>
          </ul>

          {selected ? (
            <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  Photo {items.findIndex((item) => item.key === selected.key) + 1} of{" "}
                  {items.length}
                </p>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={items[0]?.key === selected.key}
                    aria-label="Move photo earlier"
                    onClick={() => move(-1)}
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={items[items.length - 1]?.key === selected.key}
                    aria-label="Move photo later"
                    onClick={() => move(1)}
                  >
                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove photo"
                    onClick={removeSelected}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`gallery-caption-${selected.key}`}>Caption</Label>
                <Input
                  id={`gallery-caption-${selected.key}`}
                  value={selected.caption}
                  onChange={(event) =>
                    updateSelected({ caption: event.target.value })
                  }
                  placeholder="Optional caption"
                />
                <p className="text-xs text-muted-foreground">
                  Alt text uses the title automatically.
                </p>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
