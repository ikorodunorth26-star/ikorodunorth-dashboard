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
import {
  ApiError,
  getPage,
  saveReturnPath,
  updatePage,
  type ContentStatus,
} from "@/lib"
import { asRecord, asString } from "@/lib/page-content"
import { showNotification } from "@/lib/showNotification"

type PhoneDraft = { label: string; href: string }
type SocialDraft = { id: string; label: string; handle: string; href: string }

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

export function SiteConfigPageView() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [label, setLabel] = useState("Site settings")
  const [title, setTitle] = useState("Shared site settings")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ContentStatus>("DRAFT")
  const [phones, setPhones] = useState<PhoneDraft[]>([])
  const [generalEmail, setGeneralEmail] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [address, setAddress] = useState("")
  const [officeHours, setOfficeHours] = useState("")
  const [facebookUrl, setFacebookUrl] = useState("")
  const [socialLinks, setSocialLinks] = useState<SocialDraft[]>([])

  const load = useCallback(() => {
    setLoading(true)
    getPage("site_config")
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
            return { label: asString(phone.label), href: asString(phone.href) }
          }),
        )
        setGeneralEmail(asString(emails.general))
        setAdminEmail(asString(emails.administrative))
        setAddress(asString(content.address))
        setOfficeHours(asString(content.officeHours))
        setFacebookUrl(asString(content.facebookUrl))
        setSocialLinks(
          (Array.isArray(content.socialLinks) ? content.socialLinks : []).map(
            (item) => {
              const link = asRecord(item)
              return {
                id: asString(link.id, "facebook"),
                label: asString(link.label, "Facebook"),
                handle: asString(link.handle),
                href: asString(link.href),
              }
            },
          ),
        )
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
      const cleanedSocial = socialLinks
        .map((link) => ({
          id: link.id.trim() || "facebook",
          label: link.label.trim() || "Facebook",
          handle: link.handle.trim(),
          href: link.href.trim(),
        }))
        .filter((link) => link.href)
      await updatePage("site_config", {
        label: label.trim() || "Site settings",
        title: title.trim() || "Shared site settings",
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
          address: address.trim(),
          officeHours: officeHours.trim(),
          facebookUrl:
            facebookUrl.trim() ||
            cleanedSocial.find((link) => link.id === "facebook")?.href ||
            "",
          socialLinks: cleanedSocial,
        },
      })
      showNotification({ type: "success", message: "Site settings saved" })
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
      heading="Site settings"
      blurb="Shared phones, emails, address and social links used across contact, header and footer."
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
      sidebarNote="These values feed multiple public surfaces once the website reads the API."
    >
      <RepeatableList
        title="Shared phones"
        items={phones}
        onChange={setPhones}
        createItem={() => ({ label: "", href: "tel:" })}
        addLabel="Add phone"
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
              <Label>Tel link</Label>
              <Input
                value={item.href}
                onChange={(event) => update({ href: event.target.value })}
              />
            </div>
          </div>
        )}
      />

      <Card>
        <CardHeader>
          <CardTitle>Shared emails & location</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>General email</Label>
            <Input
              value={generalEmail}
              onChange={(event) => setGeneralEmail(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Administrative email</Label>
            <Input
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label>Office hours</Label>
            <Input
              value={officeHours}
              onChange={(event) => setOfficeHours(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <RepeatableList
        title="Social links"
        description="Shown in the header and footer. Add Instagram, X or others as needed."
        items={socialLinks}
        onChange={setSocialLinks}
        createItem={() => ({
          id: "facebook",
          label: "Facebook",
          handle: "",
          href: "",
        })}
        addLabel="Add social link"
        emptyLabel="No social links yet."
        renderItem={(item, _index, update) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Platform id</Label>
              <Input
                value={item.id}
                onChange={(event) => update({ id: event.target.value })}
                placeholder="facebook"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Label</Label>
              <Input
                value={item.label}
                onChange={(event) => update({ label: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Handle</Label>
              <Input
                value={item.handle}
                onChange={(event) => update({ handle: event.target.value })}
                placeholder="Ikorodu North"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>URL</Label>
              <Input
                value={item.href}
                onChange={(event) => update({ href: event.target.value })}
              />
            </div>
          </div>
        )}
      />

      <Card>
        <CardHeader>
          <CardTitle>Facebook URL fallback</CardTitle>
          <CardDescription>
            Kept for older consumers. Prefer the social links list above.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={facebookUrl}
            onChange={(event) => setFacebookUrl(event.target.value)}
          />
        </CardContent>
      </Card>
    </PageDocumentShell>
  )
}
