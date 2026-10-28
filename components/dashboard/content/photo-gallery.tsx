"use client"

import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"

export type GalleryPhoto = {
  id: string
  url: string
  alt: string
  caption?: string
}

const PREVIEW_LIMIT = 4

export function PhotoGallery({
  photos,
  title = "Gallery",
}: {
  photos: GalleryPhoto[]
  title?: string
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const previewPhotos = photos.slice(0, PREVIEW_LIMIT)
  const hiddenCount = Math.max(0, photos.length - previewPhotos.length)
  const activePhoto = activeIndex === null ? null : photos[activeIndex]

  useEffect(() => {
    if (activeIndex === null) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveIndex(null)
        return
      }
      if (photos.length < 2) return
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        setActiveIndex((index) =>
          index === null ? index : (index - 1 + photos.length) % photos.length
        )
      }
      if (event.key === "ArrowRight") {
        event.preventDefault()
        setActiveIndex((index) =>
          index === null ? index : (index + 1) % photos.length
        )
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [activeIndex, photos.length])

  if (photos.length === 0) return null

  const columnClass =
    previewPhotos.length >= 4
      ? "grid-cols-2 sm:grid-cols-4"
      : previewPhotos.length === 3
        ? "grid-cols-2 sm:grid-cols-3"
        : previewPhotos.length === 2
          ? "grid-cols-2"
          : "grid-cols-1 sm:grid-cols-2"

  return (
    <section className="flex max-w-4xl flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">
          {photos.length} photo{photos.length === 1 ? "" : "s"}
        </p>
      </div>

      <ul className={`grid gap-2 ${columnClass}`}>
        {previewPhotos.map((photo, index) => {
          const isMoreTile = hiddenCount > 0 && index === previewPhotos.length - 1
          return (
            <li key={photo.id}>
              <button
                type="button"
                className="group relative block w-full overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={
                  isMoreTile
                    ? `View gallery, ${hiddenCount} more photos`
                    : `View photo: ${photo.alt || "gallery image"}`
                }
                onClick={() => setActiveIndex(index)}
              >
                <img
                  src={photo.url}
                  alt=""
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                {isMoreTile ? (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-foreground/55 text-2xl font-semibold text-background">
                    +{hiddenCount}
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>

      {activePhoto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.alt || "Photo"}
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="relative flex w-full max-w-5xl flex-col gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative flex max-h-[78vh] items-center justify-center overflow-hidden rounded-2xl bg-black/20">
              <img
                src={activePhoto.url}
                alt={activePhoto.alt || ""}
                className="max-h-[78vh] w-full object-contain"
              />
              <button
                type="button"
                className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground"
                aria-label="Close photo"
                onClick={() => setActiveIndex(null)}
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              </button>
              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground"
                    aria-label="Previous photo"
                    onClick={() =>
                      setActiveIndex(
                        (index) =>
                          index === null
                            ? index
                            : (index - 1 + photos.length) % photos.length
                      )
                    }
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground"
                    aria-label="Next photo"
                    onClick={() =>
                      setActiveIndex(
                        (index) =>
                          index === null ? index : (index + 1) % photos.length
                      )
                    }
                  >
                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
                  </button>
                </>
              ) : null}
            </div>
            <div className="text-center text-sm text-background">
              <p>
                {(activeIndex ?? 0) + 1} / {photos.length}
              </p>
              {activePhoto.caption || activePhoto.alt ? (
                <p className="mt-1 text-background/80">
                  {activePhoto.caption || activePhoto.alt}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
