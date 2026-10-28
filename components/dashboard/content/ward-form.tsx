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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ApiError,
  createWard,
  getWard,
  saveReturnPath,
  updateWard,
  type ContentStatus,
  type WardProject,
} from "@/lib"
import { showNotification } from "@/lib/showNotification"

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

export function WardForm({ id }: { id?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [introduction, setIntroduction] = useState("")
  const [overviewHeading, setOverviewHeading] = useState("")
  const [overviewParagraphs, setOverviewParagraphs] = useState("")
  const [overviewNote, setOverviewNote] = useState("")
  const [facilities, setFacilities] = useState("")
  const [projectsEyebrow, setProjectsEyebrow] = useState("Project records")
  const [projectsJson, setProjectsJson] = useState("[]")
  const [newsLabel, setNewsLabel] = useState("")
  const [newsTitle, setNewsTitle] = useState("")
  const [concern, setConcern] = useState(true)
  const [tag, setTag] = useState("")
  const [landmarksBlurb, setLandmarksBlurb] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [status, setStatus] = useState<ContentStatus>("DRAFT")
  const [image, setImage] = useState<ImageDraft | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    getWard(id)
      .then((result) => {
        if (!active) return
        const ward = result.ward
        setName(ward.name)
        setSlug(ward.slug)
        setIntroduction(ward.introduction)
        setOverviewHeading(ward.overviewHeading)
        setOverviewParagraphs(ward.overviewParagraphs.join("\n\n"))
        setOverviewNote(ward.overviewNote ?? "")
        setFacilities(ward.facilities.join("\n"))
        setProjectsEyebrow(ward.projectsEyebrow ?? "Project records")
        setProjectsJson(JSON.stringify(ward.projects, null, 2))
        setNewsLabel(ward.newsStory?.label ?? "")
        setNewsTitle(ward.newsStory?.title ?? "")
        setConcern(ward.concern)
        setTag(ward.tag ?? "")
        setLandmarksBlurb(ward.landmarksBlurb ?? "")
        setSortOrder(ward.sortOrder)
        setStatus(ward.status)
        setImage(
          ward.image
            ? { mediaId: ward.image.id, url: ward.image.url, alt: ward.image.alt }
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
    let projects: WardProject[]
    try {
      projects = JSON.parse(projectsJson) as WardProject[]
    } catch {
      showNotification({ type: "error", message: "Projects JSON is invalid" })
      return
    }
    setSaving(true)
    try {
      const payload = {
        slug: slug.trim() || undefined,
        name: name.trim(),
        introduction: introduction.trim(),
        overviewHeading: overviewHeading.trim(),
        overviewParagraphs: overviewParagraphs
          .split(/\n\s*\n/)
          .map((part) => part.trim())
          .filter(Boolean),
        overviewNote: overviewNote.trim() || null,
        facilities: facilities
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        projectsEyebrow: projectsEyebrow.trim() || null,
        projects,
        newsStory:
          newsLabel.trim() && newsTitle.trim()
            ? { label: newsLabel.trim(), title: newsTitle.trim() }
            : null,
        concern,
        tag: tag.trim() || null,
        landmarksBlurb: landmarksBlurb.trim() || null,
        sortOrder,
        status,
        imageId: image?.mediaId ?? null,
        imageAlt: name.trim() || undefined,
      }
      const result = id ? await updateWard(id, payload) : await createWard(payload)
      showNotification({
        type: "success",
        message: id ? "Ward saved" : "Ward created",
      })
      if (!id) router.replace(`/dashboard/pages/wards/${result.ward.id}`)
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

  if (loading) return <p className="text-sm text-muted-foreground">Loading ward</p>

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => void save(event)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {id ? "Edit ward" : "New ward"}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/pages/wards">Back</Link>
        </Button>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} required onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="introduction">Introduction</Label>
                <Textarea
                  id="introduction"
                  value={introduction}
                  required
                  rows={4}
                  onChange={(e) => setIntroduction(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="overview-heading">Overview heading</Label>
                <Input
                  id="overview-heading"
                  value={overviewHeading}
                  required
                  onChange={(e) => setOverviewHeading(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="overview-paragraphs">Overview paragraphs</Label>
                <Textarea
                  id="overview-paragraphs"
                  value={overviewParagraphs}
                  rows={6}
                  onChange={(e) => setOverviewParagraphs(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="overview-note">Overview note</Label>
                <Textarea
                  id="overview-note"
                  value={overviewNote}
                  rows={2}
                  onChange={(e) => setOverviewNote(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="tag">Home tag</Label>
                  <Input id="tag" value={tag} onChange={(e) => setTag(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="landmarks-blurb">Landmarks blurb</Label>
                  <Input
                    id="landmarks-blurb"
                    value={landmarksBlurb}
                    onChange={(e) => setLandmarksBlurb(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facilities & projects</CardTitle>
              <CardDescription>Facilities one per line. Projects as JSON.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Textarea
                value={facilities}
                rows={5}
                onChange={(e) => setFacilities(e.target.value)}
              />
              <Input
                value={projectsEyebrow}
                onChange={(e) => setProjectsEyebrow(e.target.value)}
                placeholder="Projects eyebrow"
              />
              <Textarea
                value={projectsJson}
                rows={10}
                className="font-mono text-xs"
                onChange={(e) => setProjectsJson(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>News & concern</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                value={newsLabel}
                onChange={(e) => setNewsLabel(e.target.value)}
                placeholder="News story label"
              />
              <Input
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                placeholder="News story title"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={concern}
                  onChange={(e) => setConcern(e.target.checked)}
                />
                Show concern / contact band
              </label>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero image</CardTitle>
            </CardHeader>
            <CardContent>
              <FeaturedImageField image={image} title={name} onImage={setImage} />
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
                {saving ? "Saving" : id ? "Save ward" : "Create ward"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
