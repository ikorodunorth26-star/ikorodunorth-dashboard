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

type LinkDraft = { label: string; href: string }
type SocialDraft = { id: string; label: string; handle: string; href: string }

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

export function FooterPageView() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [label, setLabel] = useState("Footer")
  const [title, setTitle] = useState("Site footer")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ContentStatus>("DRAFT")
  const [headline, setHeadline] = useState("")
  const [ctaLabel, setCtaLabel] = useState("")
  const [ctaHref, setCtaHref] = useState("/contact")
  const [tagline, setTagline] = useState("")
  const [copyrightName, setCopyrightName] = useState("Ikorodu North LCDA")
  const [explore, setExplore] = useState<LinkDraft[]>([])
  const [legal, setLegal] = useState<LinkDraft[]>([])
  const [emailsText, setEmailsText] = useState("")
  const [phoneLabel, setPhoneLabel] = useState("")
  const [phoneHref, setPhoneHref] = useState("")
  const [address, setAddress] = useState("")
  const [facebookLabel, setFacebookLabel] = useState("Facebook")
  const [facebookUrl, setFacebookUrl] = useState("")
  const [socialLinks, setSocialLinks] = useState<SocialDraft[]>([])
  const [restContent, setRestContent] = useState<Record<string, unknown>>({})

  const load = useCallback(() => {
    setLoading(true)
    getPage("footer")
      .then((result) => {
        const page = result.page
        const content = asRecord(page.content)
        const cta = asRecord(content.cta)
        const contact = asRecord(content.contact)
        const phone = asRecord(contact.phone)
        setLabel(page.label)
        setTitle(page.title)
        setDescription(page.description)
        setStatus(page.status)
        setHeadline(asString(content.headline))
        setCtaLabel(asString(cta.label, "Get in touch"))
        setCtaHref(asString(cta.href, "/contact"))
        setTagline(asString(content.tagline))
        setCopyrightName(asString(content.copyrightName, "Ikorodu North LCDA"))
        setExplore(
          (Array.isArray(content.explore) ? content.explore : []).map((item) => {
            const link = asRecord(item)
            return { label: asString(link.label), href: asString(link.href) }
          }),
        )
        setLegal(
          (Array.isArray(content.legal) ? content.legal : []).map((item) => {
            const link = asRecord(item)
            return { label: asString(link.label), href: asString(link.href) }
          }),
        )
        setEmailsText(listToLines(asStringArray(contact.emails)))
        setPhoneLabel(asString(phone.label))
        setPhoneHref(asString(phone.href))
        setAddress(asString(contact.address))
        setFacebookLabel(asString(contact.facebookLabel, "Facebook"))
        setFacebookUrl(asString(contact.facebookUrl))
        setSocialLinks(
          (Array.isArray(contact.socialLinks) ? contact.socialLinks : []).map(
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
        const {
          headline: _h,
          cta: _c,
          tagline: _t,
          explore: _e,
          legal: _l,
          contact: _contact,
          copyrightName: _copy,
          ...rest
        } = content
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
      const cleanedSocial = socialLinks
        .map((link) => ({
          id: link.id.trim() || "facebook",
          label: link.label.trim() || "Facebook",
          handle: link.handle.trim(),
          href: link.href.trim(),
        }))
        .filter((link) => link.href)

      await updatePage("footer", {
        label: label.trim() || "Footer",
        title: title.trim() || "Site footer",
        description: description.trim(),
        status,
        content: {
          ...restContent,
          headline: headline.trim(),
          cta: {
            label: ctaLabel.trim() || "Get in touch",
            href: ctaHref.trim() || "/contact",
          },
          tagline: tagline.trim(),
          copyrightName: copyrightName.trim() || "Ikorodu North LCDA",
          explore: explore
            .map((link) => ({
              label: link.label.trim(),
              href: link.href.trim(),
            }))
            .filter((link) => link.label || link.href),
          legal: legal
            .map((link) => ({
              label: link.label.trim(),
              href: link.href.trim(),
            }))
            .filter((link) => link.label || link.href),
          contact: {
            emails: linesToList(emailsText),
            phone: {
              label: phoneLabel.trim(),
              href: phoneHref.trim(),
            },
            address: address.trim(),
            facebookLabel: facebookLabel.trim() || "Facebook",
            facebookUrl:
              facebookUrl.trim() ||
              cleanedSocial.find((link) => link.id === "facebook")?.href ||
              "",
            socialLinks: cleanedSocial,
          },
        },
      })
      showNotification({ type: "success", message: "Footer saved" })
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
      heading="Footer"
      blurb="Headline, CTA, explore links, contact block and legal links."
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
      <Card>
        <CardHeader>
          <CardTitle>Footer intro</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Headline</Label>
            <Textarea
              rows={2}
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Tagline</Label>
            <Textarea
              rows={2}
              value={tagline}
              onChange={(event) => setTagline(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>CTA label</Label>
              <Input
                value={ctaLabel}
                onChange={(event) => setCtaLabel(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>CTA link</Label>
              <Input
                value={ctaHref}
                onChange={(event) => setCtaHref(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Copyright name</Label>
            <Input
              value={copyrightName}
              onChange={(event) => setCopyrightName(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <RepeatableList
        title="Explore links"
        items={explore}
        onChange={setExplore}
        createItem={() => ({ label: "", href: "/" })}
        addLabel="Add explore link"
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
              <Label>Href</Label>
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
          <CardTitle>Contact block</CardTitle>
          <CardDescription>Emails, phone and address in the footer column.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Emails (one per line)</Label>
            <Textarea
              rows={3}
              value={emailsText}
              onChange={(event) => setEmailsText(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Phone label</Label>
              <Input
                value={phoneLabel}
                onChange={(event) => setPhoneLabel(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Phone href</Label>
              <Input
                value={phoneHref}
                onChange={(event) => setPhoneHref(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <RepeatableList
        title="Social links"
        items={socialLinks}
        onChange={setSocialLinks}
        createItem={() => ({
          id: "facebook",
          label: "Facebook",
          handle: "",
          href: "",
        })}
        addLabel="Add social link"
        renderItem={(item, _index, update) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Id</Label>
              <Input
                value={item.id}
                onChange={(event) => update({ id: event.target.value })}
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

      <RepeatableList
        title="Legal links"
        items={legal}
        onChange={setLegal}
        createItem={() => ({ label: "", href: "/" })}
        addLabel="Add legal link"
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
              <Label>Href</Label>
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
          <CardTitle>Facebook fallback</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Label</Label>
            <Input
              value={facebookLabel}
              onChange={(event) => setFacebookLabel(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>URL</Label>
            <Input
              value={facebookUrl}
              onChange={(event) => setFacebookUrl(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </PageDocumentShell>
  )
}
