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
  createProject,
  getProject,
  saveReturnPath,
  updateProject,
  type ContentStatus,
  type ProjectInput,
} from "@/lib"
import { showNotification } from "@/lib/showNotification"

const categories = [
  "Health",
  "Water & sanitation",
  "Roads",
  "Education",
  "Water",
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

export function ProjectForm({ id }: { id?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [slugTouched, setSlugTouched] = useState(Boolean(id))
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [summary, setSummary] = useState("")
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [publishedOn, setPublishedOn] = useState(today)
  const [status, setStatus] = useState<ContentStatus>("DRAFT")
  const [paragraphs, setParagraphs] = useState("")
  const [image, setImage] = useState<ImageDraft | null>(null)
  const [gallery, setGallery] = useState<GalleryDraft[]>([])

  useEffect(() => {
    if (!id) return
    let active = true
    getProject(id)
      .then(({ project }) => {
        if (!active) return
        setTitle(project.title)
        setSlug(project.slug)
        setSummary(project.summary)
        setCategory(project.category)
        setLocation(project.location)
        setPublishedOn(project.publishedOn)
        setStatus(project.status)
        setParagraphs(project.paragraphs.join("\n\n"))
        setImage(
          project.featuredImage
            ? {
                mediaId: project.featuredImage.id,
                url: project.featuredImage.url,
                alt: project.featuredImage.alt || project.title,
              }
            : null
        )
        setGallery(
          project.gallery.map((item) => ({
            key: crypto.randomUUID(),
            mediaId: item.id,
            url: item.url,
            alt: item.alt,
            caption: item.caption,
          }))
        )
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

  function payload(): ProjectInput {
    return {
      slug: slug.trim() || undefined,
      title: title.trim(),
      summary: summary.trim(),
      category: category.trim(),
      location: location.trim(),
      publishedOn,
      paragraphs: paragraphs
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
      status,
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
        ? await updateProject(id, payload())
        : await createProject(payload())
      showNotification({
        type: "success",
        message: id ? "Project saved" : "Project created",
      })
      if (!id) router.replace(`/dashboard/projects/${result.project.id}/edit`)
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
    return <p className="text-sm text-muted-foreground">Loading project</p>
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => void save(event)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {id ? "Edit project" : "New project"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Published projects are available on the public projects endpoint.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {id ? (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/projects/${id}`}>View project</Link>
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link href="/dashboard/projects">Back to projects</Link>
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project</CardTitle>
              <CardDescription>What was delivered, and where.</CardDescription>
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    required
                    onChange={(event) => setLocation(event.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Write-up</CardTitle>
              <CardDescription>Leave a blank line between paragraphs.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={paragraphs}
                className="min-h-56"
                onChange={(event) => setParagraphs(event.target.value)}
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
                onImage={setImage}
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
              <Button type="submit" disabled={saving}>
                {saving ? "Saving" : id ? "Save project" : "Create project"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
