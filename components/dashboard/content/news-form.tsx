"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  FeaturedImageField,
  GalleryField,
  type GalleryDraft,
  type ImageDraft,
} from "@/components/dashboard/content/media-fields"
import { RichTextEditor } from "@/components/dashboard/content/rich-text-editor"
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
  createNews,
  getNews,
  saveReturnPath,
  updateNews,
  type ContentStatus,
  type NewsGroup,
  type NewsInput,
} from "@/lib"
import { showNotification } from "@/lib/showNotification"

const groups: { value: NewsGroup; label: string }[] = [
  { value: "community", label: "Community" },
  { value: "council", label: "Council" },
  { value: "projects", label: "Projects" },
]

const categories = [
  "Health",
  "Community",
  "Council news",
  "Education",
  "Infrastructure",
  "Water and sanitation",
  "Youth and sports",
] as const

function today(): string {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

function slugifyTitle(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

export function NewsForm({ id }: { id?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [slugTouched, setSlugTouched] = useState(Boolean(id))
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [summary, setSummary] = useState("")
  const [category, setCategory] = useState("")
  const [filterGroup, setFilterGroup] = useState<NewsGroup>("community")
  const [publishedOn, setPublishedOn] = useState(today)
  const [readTime, setReadTime] = useState("")
  const [caption, setCaption] = useState("")
  const [status, setStatus] = useState<ContentStatus>("DRAFT")
  const [isFeatured, setIsFeatured] = useState(false)
  const [image, setImage] = useState<ImageDraft | null>(null)
  const [gallery, setGallery] = useState<GalleryDraft[]>([])
  const [body, setBody] = useState("")

  useEffect(() => {
    if (!id) return
    let active = true
    getNews(id)
      .then(({ article }) => {
        if (!active) return
        setTitle(article.title)
        setSlug(article.slug)
        setSummary(article.summary)
        setCategory(article.category)
        setFilterGroup(article.filterGroup)
        setPublishedOn(article.publishedOn)
        setReadTime(article.readTime)
        setCaption(article.caption)
        setStatus(article.status)
        setIsFeatured(article.isFeatured)
        setImage(
          article.featuredImage
            ? {
                mediaId: article.featuredImage.id,
                url: article.featuredImage.url,
                alt: article.featuredImage.alt || article.title,
              }
            : null
        )
        setGallery(
          article.gallery.map((item) => ({
            key: crypto.randomUUID(),
            mediaId: item.id,
            url: item.url,
            alt: item.alt,
            caption: item.caption,
          }))
        )
        setBody(article.body || "")
      })
      .catch((error: unknown) => {
        if (!active) return
        if (error instanceof ApiError && error.statusCode === 401) {
          saveReturnPath()
          router.replace("/auth/signin")
          return
        }
        showNotification({ type: "error", message: failure(error) })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id, router])

  function payload(): NewsInput {
    return {
      slug: slug.trim() || undefined,
      title: title.trim(),
      summary: summary.trim(),
      category: category.trim(),
      filterGroup,
      publishedOn,
      readTime: readTime.trim() || undefined,
      caption: caption.trim() || undefined,
      body,
      status,
      isFeatured,
      featuredImageId: image?.mediaId ?? null,
      featuredImageAlt: title.trim() || undefined,
      gallery: gallery.map((item) => ({
        mediaId: item.mediaId,
        caption: item.caption.trim() || undefined,
        alt: item.alt.trim() || title.trim() || undefined,
      })),
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (status === "PUBLISHED" && !image) {
      showNotification({ type: "error", message: "Featured image is required" })
      return
    }
    setSaving(true)
    try {
      const result = id
        ? await updateNews(id, payload())
        : await createNews(payload())
      showNotification({
        type: "success",
        message: id ? "Story saved" : "Story created",
      })
      if (!id) router.replace(`/dashboard/news/${result.article.id}/edit`)
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        saveReturnPath()
        router.replace("/auth/signin")
        return
      }
      showNotification({ type: "error", message: failure(error) })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading story</p>
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => void save(event)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {id ? "Edit story" : "New story"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Published stories are available on the public news endpoint.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {id ? (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/news/${id}`}>View story</Link>
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link href="/dashboard/news">Back to news</Link>
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Story</CardTitle>
              <CardDescription>Title, summary and where it sits in the newsroom.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  required
                  onChange={(event) => {
                    const next = event.target.value
                    setTitle(next)
                    if (!slugTouched) setSlug(slugifyTitle(next))
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true)
                    setSlug(slugifyTitle(event.target.value))
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  required
                  onChange={(event) => setSummary(event.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={category}
                    required
                    className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {category &&
                    !(categories as readonly string[]).includes(category) ? (
                      <option value={category}>{category}</option>
                    ) : null}
                    {categories.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="group">Group</Label>
                  <select
                    id="group"
                    value={filterGroup}
                    className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    onChange={(event) => setFilterGroup(event.target.value as NewsGroup)}
                  >
                    {groups.map((group) => (
                      <option key={group.value} value={group.value}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Body</CardTitle>
              <CardDescription>
                Write and format the full story in one place.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={body}
                onChange={setBody}
                placeholder="Start writing the story…"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
              <CardDescription>Extra photos, in the order they should appear.</CardDescription>
            </CardHeader>
            <CardContent>
              <GalleryField items={gallery} title={title} onChange={setGallery} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Featured image</CardTitle>
              <CardDescription>The lead photo. Required before publishing.</CardDescription>
            </CardHeader>
            <CardContent>
              <FeaturedImageField
                image={image}
                title={title}
                caption={caption}
                showCaption
                onImage={setImage}
                onCaption={setCaption}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={publishedOn}
                  required
                  onChange={(event) => setPublishedOn(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="read-time">Read time</Label>
                <Input
                  id="read-time"
                  value={readTime}
                  placeholder="Calculated if left blank"
                  onChange={(event) => setReadTime(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  onChange={(event) => setStatus(event.target.value as ContentStatus)}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(event) => setIsFeatured(event.target.checked)}
                />
                Featured story
              </label>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving" : id ? "Save story" : "Create story"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
