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
  asStringArray,
  listToLines,
  linesToList,
} from "@/lib/page-content"
import { showNotification } from "@/lib/showNotification"

type StepDraft = { number: string; title: string; text: string }
type HelpRowDraft = { label: string; value: string }

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

export function SuggestProjectPageView() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [label, setLabel] = useState("Community input")
  const [title, setTitle] = useState("Suggest a project")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ContentStatus>("DRAFT")
  const [steps, setSteps] = useState<StepDraft[]>([])
  const [wards, setWards] = useState("")
  const [categories, setCategories] = useState("")
  const [tips, setTips] = useState("")
  const [helpTitle, setHelpTitle] = useState("")
  const [helpRows, setHelpRows] = useState<HelpRowDraft[]>([])
  const [inbox, setInbox] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    getPage("suggest_project")
      .then((result) => {
        const page = result.page
        const content = asRecord(page.content)
        const help = asRecord(content.help)
        setLabel(page.label)
        setTitle(page.title)
        setDescription(page.description)
        setStatus(page.status)
        setSteps(
          (Array.isArray(content.steps) ? content.steps : []).map((item) => {
            const step = asRecord(item)
            return {
              number: asString(step.number),
              title: asString(step.title),
              text: asString(step.text),
            }
          }),
        )
        setWards(listToLines(asStringArray(content.wards)))
        setCategories(listToLines(asStringArray(content.categories)))
        setTips(listToLines(asStringArray(content.tips)))
        setHelpTitle(asString(help.title))
        setHelpRows(
          (Array.isArray(help.rows) ? help.rows : []).map((item) => {
            const row = asRecord(item)
            return { label: asString(row.label), value: asString(row.value) }
          }),
        )
        setInbox(asString(content.inbox))
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
      await updatePage("suggest_project", {
        label: label.trim() || "Community input",
        title: title.trim() || "Suggest a project",
        description: description.trim(),
        status,
        content: {
          steps: steps.map((step, index) => ({
            number: step.number.trim() || String(index + 1).padStart(2, "0"),
            title: step.title.trim(),
            text: step.text.trim(),
          })),
          wards: linesToList(wards),
          categories: linesToList(categories),
          tips: linesToList(tips),
          help: {
            title: helpTitle.trim(),
            rows: helpRows
              .map((row) => ({
                label: row.label.trim(),
                value: row.value.trim(),
              }))
              .filter((row) => row.label || row.value),
          },
          inbox: inbox.trim(),
        },
      })
      showNotification({ type: "success", message: "Suggest a project saved" })
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
      heading="Suggest a project"
      blurb="Steps, wards, categories, tips and help desk for community suggestions."
      publicPath="/projects/suggest"
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
        title="Process steps"
        items={steps}
        onChange={setSteps}
        createItem={() => ({ number: "", title: "", text: "" })}
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
              <Label>Text</Label>
              <Textarea
                rows={3}
                value={item.text}
                onChange={(event) => update({ text: event.target.value })}
              />
            </div>
          </div>
        )}
      />

      <Card>
        <CardHeader>
          <CardTitle>Wards, categories & tips</CardTitle>
          <CardDescription>One item per line.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label>Wards</Label>
            <Textarea
              rows={8}
              value={wards}
              onChange={(event) => setWards(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Categories</Label>
            <Textarea
              rows={8}
              value={categories}
              onChange={(event) => setCategories(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Tips</Label>
            <Textarea
              rows={8}
              value={tips}
              onChange={(event) => setTips(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Help desk</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Help title</Label>
            <Input
              value={helpTitle}
              onChange={(event) => setHelpTitle(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Inbox email</Label>
            <Input
              value={inbox}
              onChange={(event) => setInbox(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <RepeatableList
        title="Help rows"
        items={helpRows}
        onChange={setHelpRows}
        createItem={() => ({ label: "", value: "" })}
        addLabel="Add help row"
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
              />
            </div>
          </div>
        )}
      />
    </PageDocumentShell>
  )
}
