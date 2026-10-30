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
  createPerson,
  getPerson,
  saveReturnPath,
  teamMeta,
  updatePerson,
  type ContentStatus,
  type PersonInput,
  type TeamGroup,
} from "@/lib"
import { showNotification } from "@/lib/showNotification"

const teams: TeamGroup[] = ["executive", "council", "management", "nulge"]

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

function slugifyName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export function PersonForm({
  id,
  defaultTeam = "executive",
}: {
  id?: string
  defaultTeam?: TeamGroup
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [slugTouched, setSlugTouched] = useState(Boolean(id))
  const [team, setTeam] = useState<TeamGroup>(defaultTeam)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [title, setTitle] = useState("")
  const [bio, setBio] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [ward, setWard] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [isLead, setIsLead] = useState(false)
  const [status, setStatus] = useState<ContentStatus>("DRAFT")
  const [portrait, setPortrait] = useState<ImageDraft | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    getPerson(id)
      .then((result) => {
        if (!active) return
        const person = result.person
        setTeam(person.team)
        setName(person.name)
        setSlug(person.slug)
        setTitle(person.title)
        setBio(person.bio)
        setEmail(person.email ?? "")
        setPhone(person.phone ?? "")
        setWard(person.ward ?? "")
        setSortOrder(person.sortOrder)
        setIsLead(person.isLead)
        setStatus(person.status)
        setPortrait(
          person.portrait
            ? {
                mediaId: person.portrait.id,
                url: person.portrait.url,
                alt: person.portrait.alt,
              }
            : null
        )
      })
      .catch((error: unknown) => {
        if (!active) return
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

  function payload(): PersonInput {
    return {
      slug: slug.trim() || undefined,
      team,
      name: name.trim(),
      title: title.trim(),
      bio: bio.trim() || undefined,
      email: email.trim() || null,
      phone: phone.trim() || null,
      ward: ward.trim() || null,
      sortOrder,
      isLead,
      status,
      portraitImageId: portrait?.mediaId ?? null,
      portraitImageAlt: name.trim() || undefined,
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      const result = id
        ? await updatePerson(id, payload())
        : await createPerson(payload())
      showNotification({
        type: "success",
        message: id ? "Person saved" : "Person created",
      })
      if (!id) router.replace(`/dashboard/people/${result.person.id}/edit`)
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

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading profile</p>
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => void save(event)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {id ? "Edit person" : "New person"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Portraits and titles for the {teamMeta[team].label.toLowerCase()}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {id ? (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/people/${id}`}>View profile</Link>
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link href={`/dashboard/people/${team}`}>Back to directory</Link>
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Name, office and optional biography.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    required
                    onChange={(event) => {
                      const next = event.target.value
                      setName(next)
                      if (!slugTouched) setSlug(slugifyName(next))
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(event) => {
                      setSlugTouched(true)
                      setSlug(slugifyName(event.target.value))
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="team">Team</Label>
                  <select
                    id="team"
                    value={team}
                    className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    onChange={(event) => setTeam(event.target.value as TeamGroup)}
                  >
                    {teams.map((option) => (
                      <option key={option} value={option}>
                        {teamMeta[option].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    required
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Executive Chairman"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="ward">Ward</Label>
                  <Input
                    id="ward"
                    value={ward}
                    onChange={(event) => setWard(event.target.value)}
                    placeholder="Optional, for councillors"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="bio">Biography</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    rows={6}
                    onChange={(event) => setBio(event.target.value)}
                    placeholder="Optional short biography"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>Optional public contact details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Portrait</CardTitle>
              <CardDescription>
                Recommended. Without a portrait, the public page shows a pending
                placeholder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeaturedImageField
                image={portrait}
                title={name}
                onImage={setPortrait}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="sort-order">Sort order</Label>
                <Input
                  id="sort-order"
                  type="number"
                  min={0}
                  value={sortOrder}
                  onChange={(event) => setSortOrder(Number(event.target.value) || 0)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isLead}
                  onChange={(event) => setIsLead(event.target.checked)}
                />
                Mark as lead profile
              </label>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  onChange={(event) =>
                    setStatus(event.target.value as ContentStatus)
                  }
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving" : id ? "Save person" : "Create person"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
