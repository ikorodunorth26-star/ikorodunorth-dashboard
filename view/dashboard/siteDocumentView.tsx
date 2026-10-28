"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
  type SitePageKey,
} from "@/lib"
import { publicSiteUrl } from "@/lib/brand"
import { showNotification } from "@/lib/showNotification"

type DocumentMeta = {
  key: SitePageKey
  heading: string
  blurb: string
  publicPath?: string
  schemaHint: string
}

const documents: Record<string, DocumentMeta> = {
  contact: {
    key: "contact",
    heading: "Contact page",
    blurb: "Phones, emails, enquiry topics and page copy for Get in touch.",
    publicPath: "/contact",
    schemaHint:
      '{ "phones": [{ "label", "href" }], "emails": { "general", "administrative" }, "enquiryTopics": string[] }',
  },
  suggest_project: {
    key: "suggest_project",
    heading: "Suggest a project",
    blurb: "Steps, wards, categories, tips and help desk copy for community project ideas.",
    publicPath: "/projects/suggest",
    schemaHint:
      '{ "steps", "wards", "categories", "tips", "help", "inbox" }',
  },
  home: {
    key: "home",
    heading: "Home page",
    blurb: "Hero, editorial slides, section copy and curated home lists.",
    publicPath: "/",
    schemaHint:
      '{ "hero", "editorialSlides", "projects", "departments", "announcements", "chairman", "wards", "team", "map", "featuredDepartments", "announcementLinks", "wardCards", "teamCards" }',
  },
  departments: {
    key: "departments",
    heading: "Departments page",
    blurb: "Directory chrome, filters, reach steps and notice — department cards are edited separately.",
    publicPath: "/government/departments",
    schemaHint:
      '{ "directory": { "title", "searchPlaceholder", "filters", "profileLabel", "empty" }, "reach": { "title", "steps", "notice" } }',
  },
  navigation: {
    key: "navigation",
    heading: "Header / navigation",
    blurb: "Primary nav links and the Government dropdown shown in the site header.",
    schemaHint:
      '{ "primary": NavItem[], "government": { "label", "href" }[] } where NavItem is { href, label } or { label, children }',
  },
  footer: {
    key: "footer",
    heading: "Footer",
    blurb: "Headline, CTA, explore links, contact block and legal links.",
    schemaHint:
      '{ "headline", "cta", "tagline", "explore", "contact", "legal", "copyrightName" }',
  },
  site_config: {
    key: "site_config",
    heading: "Site settings",
    blurb: "Shared phones, emails, address and social links used across contact, header and footer.",
    schemaHint:
      '{ "phones", "emails", "address", "facebookUrl", "officeHours" }',
  },
}

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

function pretty(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2)
}

export function SiteDocumentView({ documentKey }: { documentKey: keyof typeof documents }) {
  const meta = documents[documentKey]
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [label, setLabel] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ContentStatus>("DRAFT")
  const [contentJson, setContentJson] = useState("{}")

  const load = useCallback(() => {
    setLoading(true)
    getPage(meta.key)
      .then((result) => {
        const page = result.page
        setLabel(page.label)
        setTitle(page.title)
        setDescription(page.description)
        setStatus(page.status)
        setContentJson(pretty(page.content))
      })
      .catch((caught: unknown) => {
        if (caught instanceof ApiError && caught.statusCode === 404) {
          setLabel(meta.heading)
          setTitle(meta.heading)
          setDescription(meta.blurb)
          setStatus("DRAFT")
          setContentJson("{}")
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
  }, [meta, router])

  useEffect(() => {
    load()
  }, [load])

  async function save(event: FormEvent) {
    event.preventDefault()
    let content: Record<string, unknown>
    try {
      content = JSON.parse(contentJson) as Record<string, unknown>
    } catch {
      showNotification({ type: "error", message: "Content JSON is invalid" })
      return
    }

    setSaving(true)
    try {
      await updatePage(meta.key, {
        label: label.trim() || meta.heading,
        title: title.trim() || meta.heading,
        description: description.trim(),
        status,
        content,
      })
      showNotification({ type: "success", message: `${meta.heading} saved` })
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
    return (
      <p className="text-sm text-muted-foreground">Loading {meta.heading}</p>
    )
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => void save(event)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" asChild className="-ml-2 self-start">
            <Link href="/dashboard/pages">Pages</Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">{meta.heading}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{meta.blurb}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {meta.publicPath ? (
            <Button variant="outline" asChild>
              <a
                href={`${publicSiteUrl}${meta.publicPath}`}
                target="_blank"
                rel="noreferrer"
              >
                Public URL
              </a>
            </Button>
          ) : null}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving" : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Page chrome</CardTitle>
              <CardDescription>Label, title and short description for the public page.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Textarea
                  id="title"
                  rows={2}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Structured content</CardTitle>
              <CardDescription>
                Edit the JSON payload that powers this surface. Expected shape:{" "}
                <code className="text-xs">{meta.schemaHint}</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[420px] font-mono text-xs leading-5"
                value={contentJson}
                onChange={(event) => setContentJson(event.target.value)}
                spellCheck={false}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
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
              Key: <span className="font-mono">{meta.key}</span>
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
