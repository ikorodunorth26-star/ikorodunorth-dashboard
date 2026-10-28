"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  FeaturedImageField,
  type ImageDraft,
} from "@/components/dashboard/content/media-fields"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ApiError,
  createLandmark,
  getLandmark,
  landmarkGroupLabels,
  saveReturnPath,
  updateLandmark,
  type ContentStatus,
  type LandmarkGroup,
} from "@/lib"
import { showNotification } from "@/lib/showNotification"

const groups = Object.keys(landmarkGroupLabels) as LandmarkGroup[]

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

export function LandmarkForm({ id }: { id?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [place, setPlace] = useState("")
  const [group, setGroup] = useState<LandmarkGroup>("community")
  const [summary, setSummary] = useState("")
  const [caption, setCaption] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [status, setStatus] = useState<ContentStatus>("DRAFT")
  const [image, setImage] = useState<ImageDraft | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    getLandmark(id)
      .then((result) => {
        if (!active) return
        const landmark = result.landmark
        setTitle(landmark.title)
        setPlace(landmark.place)
        setGroup(landmark.group)
        setSummary(landmark.summary)
        setCaption(landmark.caption ?? "")
        setSortOrder(landmark.sortOrder)
        setStatus(landmark.status)
        setImage(
          landmark.image
            ? {
                mediaId: landmark.image.id,
                url: landmark.image.url,
                alt: landmark.image.alt,
              }
            : null
        )
      })
      .catch((error: unknown) => {
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

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        place: place.trim(),
        group,
        summary: summary.trim(),
        caption: caption.trim() || null,
        sortOrder,
        status,
        imageId: image?.mediaId ?? null,
        imageAlt: title.trim() || undefined,
      }
      const result = id
        ? await updateLandmark(id, payload)
        : await createLandmark(payload)
      showNotification({
        type: "success",
        message: id ? "Landmark saved" : "Landmark created",
      })
      if (!id) router.replace(`/dashboard/pages/landmarks/${result.landmark.id}`)
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

  if (loading) return <p className="text-sm text-muted-foreground">Loading landmark</p>

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => void save(event)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {id ? "Edit landmark" : "New landmark"}
          </h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/pages/landmarks">Back</Link>
        </Button>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} required onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="place">Place</Label>
                <Input id="place" value={place} required onChange={(e) => setPlace(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="group">Group</Label>
                <select
                  id="group"
                  value={group}
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  onChange={(e) => setGroup(e.target.value as LandmarkGroup)}
                >
                  {groups.map((option) => (
                    <option key={option} value={option}>
                      {landmarkGroupLabels[option]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={summary}
                required
                rows={5}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="caption">Caption</Label>
              <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
            </CardHeader>
            <CardContent>
              <FeaturedImageField image={image} title={title} onImage={setImage} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              />
              <select
                value={status}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving" : id ? "Save landmark" : "Create landmark"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
