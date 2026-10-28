"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ApiError,
  deleteWard,
  listWards,
  saveReturnPath,
  type WardRecord,
} from "@/lib"
import { publicSiteUrl } from "@/lib/brand"
import { showNotification } from "@/lib/showNotification"

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

export function WardsView() {
  const router = useRouter()
  const [wards, setWards] = useState<WardRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    listWards()
      .then((result) => {
        setWards(result.wards)
        setError("")
      })
      .catch((caught: unknown) => {
        if (caught instanceof ApiError && caught.statusCode === 401) {
          saveReturnPath()
          router.replace("/auth/signin")
          return
        }
        setError(failure(caught))
      })
      .finally(() => setLoading(false))
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  async function remove(ward: WardRecord) {
    if (!window.confirm(`Delete “${ward.name}”?`)) return
    try {
      await deleteWard(ward.id)
      setWards((current) => current.filter((item) => item.id !== ward.id))
      showNotification({ type: "success", message: "Ward removed" })
    } catch (caught) {
      showNotification({ type: "error", message: failure(caught) })
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" asChild className="-ml-2 self-start">
            <Link href="/dashboard/pages">Pages</Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">Wards</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Community pages for Isiu, Odogunyan, Olorunda, Erikorodo and Agbala.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a
              href={`${publicSiteUrl}/about#communities`}
              target="_blank"
              rel="noreferrer"
            >
              Public communities
            </a>
          </Button>
          <Button asChild>
            <Link href="/dashboard/pages/wards/new">Add ward</Link>
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm">
          <p>{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={load}>
            Retry
          </Button>
        </div>
      ) : null}

      {loading ? <p className="text-sm text-muted-foreground">Loading wards</p> : null}

      {!loading && wards.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
          <p className="font-medium">No wards yet</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/pages/wards/new">Add ward</Link>
          </Button>
        </div>
      ) : null}

      {!loading && wards.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {wards.map((ward) => (
            <article key={ward.id} className="overflow-hidden rounded-2xl border bg-card">
              <div className="aspect-[16/10] bg-muted">
                {ward.image ? (
                  <img src={ward.image.url} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 p-4">
                <div className="flex flex-wrap gap-1">
                  {ward.tag ? <Badge variant="outline">{ward.tag}</Badge> : null}
                  <Badge variant={ward.status === "PUBLISHED" ? "secondary" : "outline"}>
                    {ward.status === "PUBLISHED" ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">{ward.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">/{ward.slug}</p>
                </div>
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {ward.introduction}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{ward.facilities.length} facilities</span>
                  <span>·</span>
                  <span>{ward.projects.length} projects</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/pages/wards/${ward.id}`}>Edit</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={`${publicSiteUrl}/communities/${ward.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Public URL
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => void remove(ward)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  )
}
