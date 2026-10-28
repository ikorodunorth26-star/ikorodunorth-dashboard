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
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ApiError,
  createDepartment,
  departmentGroupLabels,
  departmentIconOptions,
  getDepartment,
  saveReturnPath,
  updateDepartment,
  type ContentStatus,
  type DepartmentGroup,
} from "@/lib"
import { showNotification } from "@/lib/showNotification"

const groups = Object.keys(departmentGroupLabels) as DepartmentGroup[]

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

function lines(value: string): string[] {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function DepartmentForm({ id }: { id?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("+234 XXX XXX XXXX")
  const [icon, setIcon] = useState<string>("userRoundCog")
  const [group, setGroup] = useState<DepartmentGroup>("department")
  const [health, setHealth] = useState(false)
  const [featuredOnHome, setFeaturedOnHome] = useState(false)
  const [publicHref, setPublicHref] = useState("")
  const [headName, setHeadName] = useState("")
  const [headRole, setHeadRole] = useState("")
  const [detailHeading, setDetailHeading] = useState("")
  const [detailParagraphs, setDetailParagraphs] = useState("")
  const [responsibilities, setResponsibilities] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [status, setStatus] = useState<ContentStatus>("DRAFT")
  const [image, setImage] = useState<ImageDraft | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    getDepartment(id)
      .then((result) => {
        if (!active) return
        const department = result.department
        setTitle(department.title)
        setSlug(department.slug)
        setDescription(department.description)
        setEmail(department.email)
        setPhone(department.phone)
        setIcon(department.icon)
        setGroup(department.group)
        setHealth(department.health)
        setFeaturedOnHome(department.featuredOnHome)
        setPublicHref(department.publicHref ?? "")
        setHeadName(department.headName ?? "")
        setHeadRole(department.headRole ?? "")
        setDetailHeading(department.detailHeading ?? "")
        setDetailParagraphs((department.detailParagraphs ?? []).join("\n\n"))
        setResponsibilities((department.responsibilities ?? []).join("\n"))
        setSortOrder(department.sortOrder)
        setStatus(department.status)
        setImage(
          department.image
            ? {
                mediaId: department.image.id,
                url: department.image.url,
                alt: department.image.alt,
              }
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
    setSaving(true)
    try {
      const payload = {
        slug: slug.trim() || undefined,
        title: title.trim(),
        description: description.trim(),
        email: email.trim(),
        phone: phone.trim(),
        icon,
        group,
        health,
        featuredOnHome,
        publicHref: publicHref.trim() || null,
        headName: headName.trim() || null,
        headRole: headRole.trim() || null,
        detailHeading: detailHeading.trim() || null,
        detailParagraphs: detailParagraphs
          .split(/\n\s*\n/)
          .map((part) => part.trim())
          .filter(Boolean),
        responsibilities: lines(responsibilities),
        sortOrder,
        status,
        imageId: image?.mediaId ?? null,
        imageAlt: image?.alt,
      }
      if (id) {
        await updateDepartment(id, payload)
        showNotification({ type: "success", message: "Department saved" })
      } else {
        const created = await createDepartment(payload)
        showNotification({ type: "success", message: "Department created" })
        router.replace(`/dashboard/pages/departments/items/${created.department.id}`)
        return
      }
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
    return <p className="text-sm text-muted-foreground">Loading department</p>
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => void save(event)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" asChild className="-ml-2 self-start">
            <Link href="/dashboard/pages/departments/items">Departments</Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">
            {id ? "Edit department" : "New department"}
          </h1>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving" : "Save"}
        </Button>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Directory card</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="auto from title"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="group">Group</Label>
                  <select
                    id="group"
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    value={group}
                    onChange={(event) =>
                      setGroup(event.target.value as DepartmentGroup)
                    }
                  >
                    {groups.map((value) => (
                      <option key={value} value={value}>
                        {departmentGroupLabels[value]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="icon">Icon</Label>
                  <select
                    id="icon"
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    value={icon}
                    onChange={(event) => setIcon(event.target.value)}
                  >
                    {departmentIconOptions.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="href">Public profile href</Label>
                <Input
                  id="href"
                  value={publicHref}
                  onChange={(event) => setPublicHref(event.target.value)}
                  placeholder="/government/departments/…"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={health}
                  onChange={(event) => setHealth(event.target.checked)}
                />
                Health & environment filter
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={featuredOnHome}
                  onChange={(event) => setFeaturedOnHome(event.target.checked)}
                />
                Feature on home departments strip
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detail profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="headName">Head of department</Label>
                  <Input
                    id="headName"
                    value={headName}
                    onChange={(event) => setHeadName(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="headRole">Head role</Label>
                  <Input
                    id="headRole"
                    value={headRole}
                    onChange={(event) => setHeadRole(event.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="detailHeading">About heading</Label>
                <Input
                  id="detailHeading"
                  value={detailHeading}
                  onChange={(event) => setDetailHeading(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="detailParagraphs">About paragraphs</Label>
                <Textarea
                  id="detailParagraphs"
                  rows={5}
                  value={detailParagraphs}
                  onChange={(event) => setDetailParagraphs(event.target.value)}
                  placeholder="Separate paragraphs with a blank line"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="responsibilities">Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  rows={6}
                  value={responsibilities}
                  onChange={(event) => setResponsibilities(event.target.value)}
                  placeholder="One responsibility per line"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
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
              <div className="flex flex-col gap-2">
                <Label htmlFor="sortOrder">Sort order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(Number(event.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>
          <FeaturedImageField
            title={title || "Department photo"}
            image={image}
            onImage={setImage}
          />
        </div>
      </div>
    </form>
  )
}
