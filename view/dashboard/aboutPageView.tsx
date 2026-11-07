"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  FeaturedImageField,
  type ImageDraft,
} from "@/components/dashboard/content/media-fields"
import { RepeatableList } from "@/components/dashboard/content/repeatable-list"
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

type AboutContent = {
  introduction?: {
    heading?: string
    paragraphs?: string[]
    imageId?: string | null
    imageUrl?: string
    caption?: string
  }
  impact?: {
    eyebrow?: string
    title?: string
    description?: string
    stats?: Array<{ value: number; suffix?: string; label: string }>
  }
  history?: {
    heading?: string
    introduction?: string
    chapters?: Array<{
      number: string
      title: string
      paragraphs: string[]
      points?: string[]
    }>
  }
  community?: {
    heading?: string
    paragraphs?: string[]
    cta?: string
    href?: string
    imageId?: string | null
    imageUrl?: string
  }
  related?: {
    eyebrow?: string
    title?: string
    links?: Array<{ title: string; description: string; href: string }>
  }
  cultureNotes?: Array<{
    eyebrow: string
    title: string
    paragraphs: string[]
  }>
}

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

function lines(value: string): string[] {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function AboutPageView() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [label, setLabel] = useState("Our Story")
  const [title, setTitle] = useState("About Ikorodu\nNorth LCDA")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ContentStatus>("DRAFT")
  const [introHeading, setIntroHeading] = useState("")
  const [introParagraphs, setIntroParagraphs] = useState("")
  const [introCaption, setIntroCaption] = useState("")
  const [introImage, setIntroImage] = useState<ImageDraft | null>(null)
  const [impactEyebrow, setImpactEyebrow] = useState("")
  const [impactTitle, setImpactTitle] = useState("")
  const [impactDescription, setImpactDescription] = useState("")
  const [impactStats, setImpactStats] = useState("")
  const [historyHeading, setHistoryHeading] = useState("")
  const [historyIntroduction, setHistoryIntroduction] = useState("")
  const [chapters, setChapters] = useState<
    Array<{ number: string; title: string; paragraphsText: string; pointsText: string }>
  >([])
  const [communityHeading, setCommunityHeading] = useState("")
  const [communityParagraphs, setCommunityParagraphs] = useState("")
  const [communityCta, setCommunityCta] = useState("")
  const [communityHref, setCommunityHref] = useState("/news")
  const [relatedEyebrow, setRelatedEyebrow] = useState("")
  const [relatedTitle, setRelatedTitle] = useState("")
  const [relatedLinks, setRelatedLinks] = useState<
    Array<{ title: string; description: string; href: string }>
  >([])

  const load = useCallback(() => {
    setLoading(true)
    getPage("about")
      .then((result) => {
        const page = result.page
        const content = (page.content ?? {}) as AboutContent
        setLabel(page.label)
        setTitle(page.title)
        setDescription(page.description)
        setStatus(page.status)
        setIntroHeading(content.introduction?.heading ?? "")
        setIntroParagraphs((content.introduction?.paragraphs ?? []).join("\n\n"))
        setIntroCaption(content.introduction?.caption ?? "")
        setIntroImage(
          content.introduction?.imageId && content.introduction.imageUrl
            ? {
                mediaId: content.introduction.imageId,
                url: content.introduction.imageUrl,
                alt: page.title,
              }
            : page.coverImage
              ? {
                  mediaId: page.coverImage.id,
                  url: page.coverImage.url,
                  alt: page.coverImage.alt,
                }
              : null
        )
        setImpactEyebrow(content.impact?.eyebrow ?? "")
        setImpactTitle(content.impact?.title ?? "")
        setImpactDescription(content.impact?.description ?? "")
        setImpactStats(
          (content.impact?.stats ?? [])
            .map((stat) =>
              [stat.value, stat.suffix ?? "", stat.label].filter(Boolean).join("|")
            )
            .join("\n")
        )
        setHistoryHeading(content.history?.heading ?? "")
        setHistoryIntroduction(content.history?.introduction ?? "")
        setChapters(
          (content.history?.chapters ?? []).map((chapter) => ({
            number: chapter.number,
            title: chapter.title,
            paragraphsText: (chapter.paragraphs ?? []).join("\n\n"),
            pointsText: (chapter.points ?? []).join("\n"),
          })),
        )
        setCommunityHeading(content.community?.heading ?? "")
        setCommunityParagraphs((content.community?.paragraphs ?? []).join("\n\n"))
        setCommunityCta(content.community?.cta ?? "")
        setCommunityHref(content.community?.href ?? "/news")
        setRelatedEyebrow(content.related?.eyebrow ?? "")
        setRelatedTitle(content.related?.title ?? "")
        setRelatedLinks(content.related?.links ?? [])
      })
      .catch((caught: unknown) => {
        if (caught instanceof ApiError && caught.statusCode === 404) {
          setLoading(false)
          return
        }
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

  async function save(event: FormEvent) {
    event.preventDefault()

    const stats = impactStats
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [value, suffixOrLabel, maybeLabel] = line.split("|").map((part) => part.trim())
        if (maybeLabel) {
          return {
            value: Number(value),
            suffix: suffixOrLabel || undefined,
            label: maybeLabel,
          }
        }
        return { value: Number(value), label: suffixOrLabel || "" }
      })

    setSaving(true)
    try {
      await updatePage("about", {
        label: label.trim(),
        title: title.trim(),
        description: description.trim(),
        status,
        coverImageId: introImage?.mediaId ?? null,
        content: {
          introduction: {
            heading: introHeading.trim(),
            paragraphs: lines(introParagraphs.replace(/\n\n/g, "\n")).length
              ? introParagraphs
                  .split(/\n\s*\n/)
                  .map((part) => part.trim())
                  .filter(Boolean)
              : lines(introParagraphs),
            imageId: introImage?.mediaId ?? null,
            imageUrl: introImage?.url,
            caption: introCaption.trim(),
          },
          impact: {
            eyebrow: impactEyebrow.trim(),
            title: impactTitle.trim(),
            description: impactDescription.trim(),
            stats,
          },
          history: {
            heading: historyHeading.trim(),
            introduction: historyIntroduction.trim(),
            chapters: chapters.map((chapter, index) => ({
              number: chapter.number.trim() || String(index + 1).padStart(2, "0"),
              title: chapter.title.trim(),
              paragraphs: chapter.paragraphsText
                .split(/\n\s*\n/)
                .map((part) => part.trim())
                .filter(Boolean),
              points: lines(chapter.pointsText),
            })),
          },
          community: {
            heading: communityHeading.trim(),
            paragraphs: communityParagraphs
              .split(/\n\s*\n/)
              .map((part) => part.trim())
              .filter(Boolean),
            cta: communityCta.trim(),
            href: communityHref.trim(),
            imageId: introImage?.mediaId ?? null,
            imageUrl: introImage?.url,
          },
          related: {
            eyebrow: relatedEyebrow.trim(),
            title: relatedTitle.trim(),
            links: relatedLinks
              .map((link) => ({
                title: link.title.trim(),
                description: link.description.trim(),
                href: link.href.trim(),
              }))
              .filter((link) => link.title || link.href),
          },
        },
      })
      showNotification({ type: "success", message: "About page saved" })
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
    return <p className="text-sm text-muted-foreground">Loading About page</p>
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => void save(event)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" asChild className="-ml-2 self-start">
            <Link href="/dashboard/pages">Pages</Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">About page</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Edit the public story at {publicSiteUrl}/about
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href={`${publicSiteUrl}/about`} target="_blank" rel="noreferrer">
              Public URL
            </a>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving" : "Save About page"}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Page intro</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Textarea
                  id="title"
                  value={title}
                  rows={2}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  rows={3}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="intro-heading">Heading</Label>
                <Textarea
                  id="intro-heading"
                  value={introHeading}
                  rows={2}
                  onChange={(e) => setIntroHeading(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="intro-paragraphs">Paragraphs</Label>
                <Textarea
                  id="intro-paragraphs"
                  value={introParagraphs}
                  rows={6}
                  onChange={(e) => setIntroParagraphs(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Separate paragraphs with a blank line.</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="intro-caption">Caption</Label>
                <Input
                  id="intro-caption"
                  value={introCaption}
                  onChange={(e) => setIntroCaption(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Impact stats</CardTitle>
              <CardDescription>One stat per line: value|suffix|label or value|label</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                value={impactEyebrow}
                onChange={(e) => setImpactEyebrow(e.target.value)}
                placeholder="Eyebrow"
              />
              <Input
                value={impactTitle}
                onChange={(e) => setImpactTitle(e.target.value)}
                placeholder="Title"
              />
              <Textarea
                value={impactDescription}
                onChange={(e) => setImpactDescription(e.target.value)}
                placeholder="Description"
              />
              <Textarea
                value={impactStats}
                rows={5}
                onChange={(e) => setImpactStats(e.target.value)}
                placeholder={"5||Wards\n300|+|Community development areas"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>History intro</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Textarea
                value={historyHeading}
                rows={2}
                onChange={(e) => setHistoryHeading(e.target.value)}
                placeholder="Heading"
              />
              <Textarea
                value={historyIntroduction}
                rows={2}
                onChange={(e) => setHistoryIntroduction(e.target.value)}
                placeholder="Introduction"
              />
            </CardContent>
          </Card>

          <RepeatableList
            title="History chapters"
            description="Add chapters with paragraphs and optional bullet points."
            items={chapters}
            onChange={setChapters}
            createItem={() => ({
              number: "",
              title: "",
              paragraphsText: "",
              pointsText: "",
            })}
            addLabel="Add chapter"
            renderItem={(item, _index, update) => (
              <div className="flex flex-col gap-3">
                <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
                  <div className="flex flex-col gap-2">
                    <Label>Number</Label>
                    <Input
                      value={item.number}
                      onChange={(e) => update({ number: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Title</Label>
                    <Input
                      value={item.title}
                      onChange={(e) => update({ title: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Paragraphs</Label>
                  <Textarea
                    rows={4}
                    value={item.paragraphsText}
                    onChange={(e) => update({ paragraphsText: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate paragraphs with a blank line.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Points (optional, one per line)</Label>
                  <Textarea
                    rows={4}
                    value={item.pointsText}
                    onChange={(e) => update({ pointsText: e.target.value })}
                  />
                </div>
              </div>
            )}
          />

          <Card>
            <CardHeader>
              <CardTitle>Community band</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Textarea
                value={communityHeading}
                rows={2}
                onChange={(e) => setCommunityHeading(e.target.value)}
              />
              <Textarea
                value={communityParagraphs}
                rows={4}
                onChange={(e) => setCommunityParagraphs(e.target.value)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  value={communityCta}
                  onChange={(e) => setCommunityCta(e.target.value)}
                  placeholder="CTA label"
                />
                <Input
                  value={communityHref}
                  onChange={(e) => setCommunityHref(e.target.value)}
                  placeholder="/news"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related section</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                value={relatedEyebrow}
                onChange={(e) => setRelatedEyebrow(e.target.value)}
                placeholder="Related eyebrow"
              />
              <Input
                value={relatedTitle}
                onChange={(e) => setRelatedTitle(e.target.value)}
                placeholder="Related title"
              />
            </CardContent>
          </Card>

          <RepeatableList
            title="Related links"
            items={relatedLinks}
            onChange={setRelatedLinks}
            createItem={() => ({ title: "", description: "", href: "/" })}
            addLabel="Add related link"
            renderItem={(item, _index, update) => (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <Label>Title</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => update({ title: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => update({ description: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Href</Label>
                  <Input
                    value={item.href}
                    onChange={(e) => update({ href: e.target.value })}
                  />
                </div>
              </div>
            )}
          />
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Cover image</CardTitle>
              <CardDescription>Used for the About introduction and community band.</CardDescription>
            </CardHeader>
            <CardContent>
              <FeaturedImageField
                image={introImage}
                title={title.replace(/\n/g, " ")}
                onImage={setIntroImage}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <select
                value={status}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving" : "Save About page"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
