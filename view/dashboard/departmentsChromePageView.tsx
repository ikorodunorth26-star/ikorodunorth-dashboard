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
import { asRecord, asString } from "@/lib/page-content"
import { showNotification } from "@/lib/showNotification"

type FilterDraft = { label: string; value: string }
type StepDraft = { number: string; title: string; description: string }

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

export function DepartmentsChromePageView() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [label, setLabel] = useState("Service Network")
  const [title, setTitle] = useState("Departments")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ContentStatus>("DRAFT")
  const [directoryTitle, setDirectoryTitle] = useState("")
  const [searchPlaceholder, setSearchPlaceholder] = useState("")
  const [profileLabel, setProfileLabel] = useState("")
  const [emptyLabel, setEmptyLabel] = useState("")
  const [filters, setFilters] = useState<FilterDraft[]>([])
  const [reachTitle, setReachTitle] = useState("")
  const [reachNotice, setReachNotice] = useState("")
  const [steps, setSteps] = useState<StepDraft[]>([])
  const [restContent, setRestContent] = useState<Record<string, unknown>>({})

  const load = useCallback(() => {
    setLoading(true)
    getPage("departments")
      .then((result) => {
        const page = result.page
        const content = asRecord(page.content)
        const directory = asRecord(content.directory)
        const reach = asRecord(content.reach)
        setLabel(page.label)
        setTitle(page.title)
        setDescription(page.description)
        setStatus(page.status)
        setDirectoryTitle(asString(directory.title))
        setSearchPlaceholder(asString(directory.searchPlaceholder))
        setProfileLabel(asString(directory.profileLabel))
        setEmptyLabel(asString(directory.empty))
        setFilters(
          (Array.isArray(directory.filters) ? directory.filters : []).map(
            (item) => {
              const filter = asRecord(item)
              return {
                label: asString(filter.label),
                value: asString(filter.value),
              }
            },
          ),
        )
        setReachTitle(asString(reach.title))
        setReachNotice(asString(reach.notice))
        setSteps(
          (Array.isArray(reach.steps) ? reach.steps : []).map((item) => {
            const step = asRecord(item)
            return {
              number: asString(step.number),
              title: asString(step.title),
              description: asString(step.description),
            }
          }),
        )
        const { directory: _d, reach: _r, ...rest } = content
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
      await updatePage("departments", {
        label: label.trim() || "Service Network",
        title: title.trim() || "Departments",
        description: description.trim(),
        status,
        content: {
          ...restContent,
          directory: {
            title: directoryTitle.trim(),
            searchPlaceholder: searchPlaceholder.trim(),
            profileLabel: profileLabel.trim(),
            empty: emptyLabel.trim(),
            filters: filters
              .map((filter) => ({
                label: filter.label.trim(),
                value: filter.value.trim(),
              }))
              .filter((filter) => filter.label || filter.value),
          },
          reach: {
            title: reachTitle.trim(),
            notice: reachNotice.trim(),
            steps: steps.map((step, index) => ({
              number: step.number.trim() || String(index + 1).padStart(2, "0"),
              title: step.title.trim(),
              description: step.description.trim(),
            })),
          },
        },
      })
      showNotification({ type: "success", message: "Departments page saved" })
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
      heading="Departments page"
      blurb="Directory chrome, filters and reach steps. Individual department profiles are edited separately."
      publicPath="/government/departments"
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
      sidebarNote="Department cards and HOD details live under Department items."
    >
      <Card>
        <CardHeader>
          <CardTitle>Directory chrome</CardTitle>
          <CardDescription>Search box and empty-state copy.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label>Directory title</Label>
            <Input
              value={directoryTitle}
              onChange={(event) => setDirectoryTitle(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Search placeholder</Label>
            <Input
              value={searchPlaceholder}
              onChange={(event) => setSearchPlaceholder(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Profile button label</Label>
            <Input
              value={profileLabel}
              onChange={(event) => setProfileLabel(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label>Empty state</Label>
            <Input
              value={emptyLabel}
              onChange={(event) => setEmptyLabel(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <RepeatableList
        title="Directory filters"
        items={filters}
        onChange={setFilters}
        createItem={() => ({ label: "", value: "" })}
        addLabel="Add filter"
        renderItem={(item, _index, update) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Label</Label>
              <Input
                value={item.label}
                onChange={(event) => update({ label: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Value</Label>
              <Input
                value={item.value}
                onChange={(event) => update({ value: event.target.value })}
                placeholder="all | departments | units | health"
              />
            </div>
          </div>
        )}
      />

      <Card>
        <CardHeader>
          <CardTitle>How to reach a department</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Section title</Label>
            <Input
              value={reachTitle}
              onChange={(event) => setReachTitle(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Notice</Label>
            <Textarea
              rows={3}
              value={reachNotice}
              onChange={(event) => setReachNotice(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <RepeatableList
        title="Reach steps"
        items={steps}
        onChange={setSteps}
        createItem={() => ({ number: "", title: "", description: "" })}
        addLabel="Add step"
        renderItem={(item, _index, update) => (
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
              <div className="flex flex-col gap-2">
                <Label>Number</Label>
                <Input
                  value={item.number}
                  onChange={(event) => update({ number: event.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Title</Label>
                <Input
                  value={item.title}
                  onChange={(event) => update({ title: event.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={item.description}
                onChange={(event) =>
                  update({ description: event.target.value })
                }
              />
            </div>
          </div>
        )}
      />
    </PageDocumentShell>
  )
}
