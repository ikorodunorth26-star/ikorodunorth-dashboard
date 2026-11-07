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

type PhoneDraft = { label: string; href: string }

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

export function ContactPageView() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [label, setLabel] = useState("Contact")
  const [title, setTitle] = useState("Get in touch")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ContentStatus>("DRAFT")
  const [phones, setPhones] = useState<PhoneDraft[]>([])
  const [generalEmail, setGeneralEmail] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [enquiryTopics, setEnquiryTopics] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    getPage("contact")
      .then((result) => {
        const page = result.page
        const content = asRecord(page.content)
        const emails = asRecord(content.emails)
        setLabel(page.label)
        setTitle(page.title)
        setDescription(page.description)
        setStatus(page.status)
        setPhones(
          (Array.isArray(content.phones) ? content.phones : []).map((item) => {
            const phone = asRecord(item)
            return {
              label: asString(phone.label),
              href: asString(phone.href),
            }
          }),
        )
        setGeneralEmail(asString(emails.general))
        setAdminEmail(asString(emails.administrative))
        setEnquiryTopics(listToLines(asStringArray(content.enquiryTopics)))
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
      await updatePage("contact", {
        label: label.trim() || "Contact",
        title: title.trim() || "Get in touch",
        description: description.trim(),
        status,
        content: {
          phones: phones
            .map((phone) => ({
              label: phone.label.trim(),
              href: phone.href.trim(),
            }))
            .filter((phone) => phone.label || phone.href),
          emails: {
            general: generalEmail.trim(),
            administrative: adminEmail.trim(),
          },
          enquiryTopics: linesToList(enquiryTopics),
        },
      })
      showNotification({ type: "success", message: "Contact page saved" })
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
      heading="Contact page"
      blurb="Phones, emails and enquiry topics for Get in touch."
      publicPath="/contact"
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
        title="Phone numbers"
        description="Shown on the contact page and reused where the site lists council phones."
        items={phones}
        onChange={setPhones}
        createItem={() => ({ label: "", href: "tel:" })}
        addLabel="Add phone"
        emptyLabel="No phone numbers yet."
        renderItem={(item, _index, update) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Display label</Label>
              <Input
                value={item.label}
                onChange={(event) => update({ label: event.target.value })}
                placeholder="08165442373 (24hrs)"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Tel link</Label>
              <Input
                value={item.href}
                onChange={(event) => update({ href: event.target.value })}
                placeholder="tel:+2348165442373"
              />
            </div>
          </div>
        )}
      />

      <Card>
        <CardHeader>
          <CardTitle>Email addresses</CardTitle>
          <CardDescription>General and administrative inboxes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="general-email">General</Label>
            <Input
              id="general-email"
              value={generalEmail}
              onChange={(event) => setGeneralEmail(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-email">Administrative</Label>
            <Input
              id="admin-email"
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enquiry topics</CardTitle>
          <CardDescription>One topic per line for the contact form selector.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={8}
            value={enquiryTopics}
            onChange={(event) => setEnquiryTopics(event.target.value)}
            placeholder={"General enquiry\nPermits & approvals"}
          />
        </CardContent>
      </Card>
    </PageDocumentShell>
  )
}
