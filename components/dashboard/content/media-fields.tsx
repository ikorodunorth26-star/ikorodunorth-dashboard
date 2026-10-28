"use client"

import { useRef, useState } from "react"

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
        <p className="text-xs text-muted-foreground">
          Taken from the title.
        </p>
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
  const defaultAlt = title?.trim() || ""

  async function choose(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    const next = [...items]
    try {
      for (const file of files) {
        const image = await sendFile(file, defaultAlt)
        next.push({
          ...image,
          key: crypto.randomUUID(),
          alt: image.alt || defaultAlt,
          caption: "",
        })
      }
      onChange(next)
    } catch (error) {
      onChange(next)
      showNotification({ type: "error", message: failure(error) })
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const current = next[index]
    const swap = next[target]
    if (!current || !swap) return
    next[index] = swap
    next[target] = current
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        onChange={(event) => void choose(event.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Uploading" : "Add photos"}
      </Button>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Gallery photos appear after the story. JPEG, PNG, WebP, or GIF, up to 8 MB each.
        </p>
      ) : null}
      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <div key={item.key} className="flex gap-3 rounded-xl border p-3">
            <img
              src={item.url}
              alt={item.alt || "Gallery photo"}
              className="size-20 rounded-lg object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Input
                value={item.alt}
                onChange={(event) =>
                  onChange(
                    items.map((entry) =>
                      entry.key === item.key
                        ? { ...entry, alt: event.target.value }
                        : entry
                    )
                  )
                }
                placeholder="Alt text"
              />
              <Input
                value={item.caption}
                onChange={(event) =>
                  onChange(
                    items.map((entry) =>
                      entry.key === item.key
                        ? { ...entry, caption: event.target.value }
                        : entry
                    )
                  )
                }
                placeholder="Caption"
              />
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => move(index, -1)}>
                  Up
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => move(index, 1)}>
                  Down
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange(items.filter((entry) => entry.key !== item.key))}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
