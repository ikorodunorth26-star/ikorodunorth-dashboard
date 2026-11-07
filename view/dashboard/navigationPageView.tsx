"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { PageDocumentShell } from "@/components/dashboard/content/page-document-shell"
import { RepeatableList } from "@/components/dashboard/content/repeatable-list"
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
import {
  asRecord,
  asString,
  listToLines,
  linesToList,
} from "@/lib/page-content"
import { showNotification } from "@/lib/showNotification"

type LinkDraft = { label: string; href: string }
type NavDraft = {
  key: string
  label: string
  href: string
  childrenText: string
}

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

function parseChildren(text: string): LinkDraft[] {
  return linesToList(text).map((line) => {
    const [label, href] = line.split("|").map((part) => part.trim())
    return { label: label || "", href: href || "" }
  })
}

function formatChildren(children: unknown): string {
  if (!Array.isArray(children)) return ""
  return children
    .map((item) => {
      const link = asRecord(item)
      return `${asString(link.label)} | ${asString(link.href)}`
    })
    .join("\n")
}

export function NavigationPageView() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [label, setLabel] = useState("Header")
  const [title, setTitle] = useState("Primary navigation")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ContentStatus>("DRAFT")
  const [primary, setPrimary] = useState<NavDraft[]>([])
  const [restContent, setRestContent] = useState<Record<string, unknown>>({})

  const load = useCallback(() => {
    setLoading(true)
    getPage("navigation")
      .then((result) => {
        const page = result.page
        const content = asRecord(page.content)
        setLabel(page.label)
        setTitle(page.title)
        setDescription(page.description)
        setStatus(page.status)
        setPrimary(
          (Array.isArray(content.primary) ? content.primary : []).map(
            (item, index) => {
              const nav = asRecord(item)
              return {
                key: `nav-${index}-${asString(nav.label)}`,
                label: asString(nav.label),
                href: asString(nav.href),
                childrenText: formatChildren(nav.children),
              }
            },
          ),
        )
        const { primary: _primary, ...rest } = content
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

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      await updatePage("navigation", {
        label: label.trim() || "Header",
        title: title.trim() || "Primary navigation",
        description: description.trim(),
        status,
        content: {
          ...restContent,
          primary: primary.map((item) => {
            const children = parseChildren(item.childrenText).filter(
              (child) => child.label || child.href,
            )
            if (children.length) {
              return {
                label: item.label.trim(),
                children,
              }
            }
            return {
              label: item.label.trim(),
              href: item.href.trim() || "/",
            }
          }),
        },
      })
      showNotification({ type: "success", message: "Navigation saved" })
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

  return (
    <PageDocumentShell
      heading="Header / navigation"
      blurb="Primary nav links and dropdown menus shown in the site header."
      loading={loading}
      saving={saving}
      status={status}
      onStatusChange={setStatus}
      onSave={(event) => void save(event)}
      label={label}
      onLabelChange={setLabel}
      title={title}
      onTitleChange={setTitle}
      description={description}
      onDescriptionChange={setDescription}
    >
      <RepeatableList
        title="Primary navigation"
        description="Top-level items. For dropdowns, leave the href blank and add children as Label | /path lines."
        items={primary}
        onChange={setPrimary}
        createItem={() => ({
          key: crypto.randomUUID(),
          label: "",
          href: "/",
          childrenText: "",
        })}
        addLabel="Add nav item"
        getKey={(item) => item.key}
        renderItem={(item, _index, update) => (
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Label</Label>
                <Input
                  value={item.label}
                  onChange={(event) => update({ label: event.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Href (leave blank for dropdown)</Label>
                <Input
                  value={item.href}
                  onChange={(event) => update({ href: event.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Dropdown children</Label>
              <Textarea
                rows={4}
                value={item.childrenText}
                onChange={(event) =>
                  update({ childrenText: event.target.value })
                }
                placeholder={"About & History | /about\nDepartments | /government/departments"}
              />
              <p className="text-xs text-muted-foreground">
                One child per line using <code>Label | /path</code>.
              </p>
            </div>
          </div>
        )}
      />

      <Card>
        <CardHeader>
          <CardTitle>Tip</CardTitle>
          <CardDescription>
            Keep Home, Government, Wards, Services, News and Contact as the core set unless the public IA changes.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </PageDocumentShell>
  )
}
