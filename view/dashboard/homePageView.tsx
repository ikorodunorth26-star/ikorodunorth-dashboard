"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

import {
  FeaturedImageField,
  type ImageDraft,
} from "@/components/dashboard/content/media-fields"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ApiError,
  getPage,
  saveReturnPath,
  updatePage,
  type ContentStatus,
} from "@/lib"
import { publicSiteUrl } from "@/lib/brand"
import { showNotification } from "@/lib/showNotification"

type HeroDraft = {
  headline: string
  description: string
  cta: string
  ctaHref: string
  image: ImageDraft | null
  imageClassName: string
}

type SlideDraft = {
  key: string
  headline: string
  description: string
  cta: string
  href: string
  image: ImageDraft | null
  imageClassName: string
}

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function readImage(value: unknown): ImageDraft | null {
  const record = asRecord(value)
  const mediaId = asString(record.imageId || record.mediaId)
  const url = asString(record.imageUrl || record.url)
  if (!mediaId && !url) return null
  return {
    mediaId: mediaId || url,
    url: url || "",
    alt: asString(record.imageAlt || record.alt),
  }
}

function newSlide(): SlideDraft {
  return {
    key: crypto.randomUUID(),
    headline: "",
    description: "",
    cta: "Learn more",
    href: "/",
    image: null,
    imageClassName: "object-cover object-center",
  }
}

function serializeImage(image: ImageDraft | null) {
  if (!image) {
    return {
      imageId: null,
      imageUrl: undefined,
      imageAlt: undefined,
    }
  }
  return {
    imageId: image.mediaId || null,
    imageUrl: image.url || undefined,
    imageAlt: image.alt || undefined,
  }
}

export function HomePageView() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [label, setLabel] = useState("Home")
  const [title, setTitle] = useState("Home")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ContentStatus>("DRAFT")
  const [restContent, setRestContent] = useState<Record<string, unknown>>({})
  const [hero, setHero] = useState<HeroDraft>({
    headline: "Welcome to\nIkorodu North",
    description: "",
    cta: "Learn about us",
    ctaHref: "/about",
    image: null,
    imageClassName: "object-cover object-[center_42%]",
  })
  const [slides, setSlides] = useState<SlideDraft[]>([])

  const load = useCallback(() => {
    setLoading(true)
    getPage("home")
      .then((result) => {
        const page = result.page
        const content = asRecord(page.content)
        const heroContent = asRecord(content.hero)
        const editorial = Array.isArray(content.editorialSlides)
          ? content.editorialSlides
          : []

        setLabel(page.label)
        setTitle(page.title)
        setDescription(page.description)
        setStatus(page.status)
        setHero({
          headline: asString(heroContent.headline, "Welcome to\nIkorodu North"),
          description: asString(heroContent.description),
          cta: asString(heroContent.cta, "Learn about us"),
          ctaHref: asString(heroContent.ctaHref || heroContent.href, "/about"),
          image: readImage(heroContent) ?? readImage(content.heroBackground),
          imageClassName: asString(
            heroContent.imageClassName,
            "object-cover object-[center_42%]",
          ),
        })
        setSlides(
          editorial.map((item, index) => {
            const slide = asRecord(item)
            return {
              key: asString(slide.key) || `slide-${index}-${asString(slide.headline)}`,
              headline: asString(slide.headline),
              description: asString(slide.description),
              cta: asString(slide.cta, "Learn more"),
              href: asString(slide.href, "/"),
              image: readImage(slide),
              imageClassName: asString(
                slide.imageClassName,
                "object-cover object-center",
              ),
            }
          }),
        )

        const {
          hero: _hero,
          editorialSlides: _slides,
          heroBackground: _bg,
          ...rest
        } = content
        setRestContent(rest)
      })
      .catch((caught: unknown) => {
        if (caught instanceof ApiError && caught.statusCode === 401) {
          saveReturnPath()
          router.replace("/auth/signin")
          return
        }
        showNotification({ type: "error", message: failure(caught) })
      })
      .finally(() => setLoading(false))
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  function updateSlide(key: string, patch: Partial<SlideDraft>) {
    setSlides((current) =>
      current.map((slide) => (slide.key === key ? { ...slide, ...patch } : slide)),
    )
  }

  function moveSlide(key: string, direction: -1 | 1) {
    setSlides((current) => {
      const index = current.findIndex((slide) => slide.key === key)
      const next = index + direction
      if (index < 0 || next < 0 || next >= current.length) return current
      const copy = [...current]
      const [item] = copy.splice(index, 1)
      copy.splice(next, 0, item)
      return copy
    })
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      await updatePage("home", {
        label: label.trim() || "Home",
        title: title.trim() || hero.headline.trim() || "Home",
        description: description.trim() || hero.description.trim(),
        status,
        content: {
          ...restContent,
          hero: {
            headline: hero.headline.trim(),
            description: hero.description.trim(),
            cta: hero.cta.trim(),
            ctaHref: hero.ctaHref.trim() || "/about",
            imageClassName: hero.imageClassName.trim(),
            ...serializeImage(hero.image),
          },
          editorialSlides: slides.map((slide) => ({
            headline: slide.headline.trim(),
            description: slide.description.trim(),
            cta: slide.cta.trim(),
            href: slide.href.trim() || "/",
            imageClassName: slide.imageClassName.trim(),
            ...serializeImage(slide.image),
          })),
        },
      })
      showNotification({ type: "success", message: "Home page saved" })
      load()
    } catch (caught) {
      if (caught instanceof ApiError && caught.statusCode === 401) {
        saveReturnPath()
        router.replace("/auth/signin")
        return
      }
      showNotification({ type: "error", message: failure(caught) })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading home page</p>
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => void save(event)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" asChild className="-ml-2 self-start">
            <Link href="/dashboard/pages">Pages</Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">Home page</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Edit the welcome hero and homepage slider slides. Add, reorder or remove slides, and upload background images.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href={`${publicSiteUrl}/`} target="_blank" rel="noreferrer">
              Public URL
            </a>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving" : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome slide</CardTitle>
              <CardDescription>
                First homepage slide — headline, supporting copy, CTA and background image.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="hero-headline">Headline</Label>
                  <Textarea
                    id="hero-headline"
                    rows={2}
                    value={hero.headline}
                    onChange={(event) =>
                      setHero((current) => ({ ...current, headline: event.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="hero-description">Description</Label>
                  <Textarea
                    id="hero-description"
                    rows={3}
                    value={hero.description}
                    onChange={(event) =>
                      setHero((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="hero-cta">CTA label</Label>
                    <Input
                      id="hero-cta"
                      value={hero.cta}
                      onChange={(event) =>
                        setHero((current) => ({ ...current, cta: event.target.value }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="hero-cta-href">CTA link</Label>
                    <Input
                      id="hero-cta-href"
                      value={hero.ctaHref}
                      onChange={(event) =>
                        setHero((current) => ({
                          ...current,
                          ctaHref: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="hero-focus">Image focus class</Label>
                  <Input
                    id="hero-focus"
                    value={hero.imageClassName}
                    onChange={(event) =>
                      setHero((current) => ({
                        ...current,
                        imageClassName: event.target.value,
                      }))
                    }
                    placeholder="object-cover object-[center_42%]"
                  />
                </div>
              </div>
              <FeaturedImageField
                title={hero.headline.replace(/\n/g, " ") || "Welcome slide"}
                image={hero.image}
                onImage={(image) => setHero((current) => ({ ...current, image }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle>More slider slides</CardTitle>
                <CardDescription>
                  Additional homepage slides after the welcome screen. Order here is the order on the site.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSlides((current) => [...current, newSlide()])}
              >
                <HugeiconsIcon icon={Add01Icon} className="size-4" />
                Add slide
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {slides.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No extra slides yet. Add one to extend the homepage slider.
                </p>
              ) : (
                slides.map((slide, index) => (
                  <div
                    key={slide.key}
                    className="rounded-2xl border bg-muted/20 p-4"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">Slide {index + 2}</p>
                      <div className="flex flex-wrap gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={index === 0}
                          onClick={() => moveSlide(slide.key, -1)}
                          aria-label={`Move slide ${index + 2} up`}
                        >
                          <HugeiconsIcon icon={ArrowUp01Icon} className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={index === slides.length - 1}
                          onClick={() => moveSlide(slide.key, 1)}
                          aria-label={`Move slide ${index + 2} down`}
                        >
                          <HugeiconsIcon icon={ArrowDown01Icon} className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setSlides((current) =>
                              current.filter((item) => item.key !== slide.key),
                            )
                          }
                          aria-label={`Remove slide ${index + 2}`}
                        >
                          <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                          <Label>Headline</Label>
                          <Textarea
                            rows={2}
                            value={slide.headline}
                            onChange={(event) =>
                              updateSlide(slide.key, { headline: event.target.value })
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>Description</Label>
                          <Textarea
                            rows={3}
                            value={slide.description}
                            onChange={(event) =>
                              updateSlide(slide.key, {
                                description: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="flex flex-col gap-2">
                            <Label>CTA label</Label>
                            <Input
                              value={slide.cta}
                              onChange={(event) =>
                                updateSlide(slide.key, { cta: event.target.value })
                              }
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label>CTA link</Label>
                            <Input
                              value={slide.href}
                              onChange={(event) =>
                                updateSlide(slide.key, { href: event.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>Image focus class</Label>
                          <Input
                            value={slide.imageClassName}
                            onChange={(event) =>
                              updateSlide(slide.key, {
                                imageClassName: event.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <FeaturedImageField
                        title={slide.headline.replace(/\n/g, " ") || `Slide ${index + 2}`}
                        image={slide.image}
                        onImage={(image) => updateSlide(slide.key, { image })}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="home-label">Label</Label>
              <Input
                id="home-label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="home-status">Status</Label>
              <select
                id="home-status"
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ContentStatus)
                }
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Other home sections (projects, wards, team, map) are kept when you save slides.
            </p>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving" : "Save changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
