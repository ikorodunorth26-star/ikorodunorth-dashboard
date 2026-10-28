"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ApiError,
  deleteLandmark,
  landmarkGroupLabels,
  listLandmarks,
  saveReturnPath,
  type LandmarkRecord,
} from "@/lib"
import { publicSiteUrl } from "@/lib/brand"
import { showNotification } from "@/lib/showNotification"

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

export function LandmarksView() {
  const router = useRouter()
  const [landmarks, setLandmarks] = useState<LandmarkRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    listLandmarks()
      .then((result) => {
        setLandmarks(result.landmarks)
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

  async function remove(landmark: LandmarkRecord) {
    if (!window.confirm(`Delete “${landmark.title}”?`)) return
    try {
      await deleteLandmark(landmark.id)
      setLandmarks((current) => current.filter((item) => item.id !== landmark.id))
      showNotification({ type: "success", message: "Landmark removed" })
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
          <h1 className="text-3xl font-semibold tracking-tight">Landmarks</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Places and heritage cards for the public landmarks page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href={`${publicSiteUrl}/landmarks`} target="_blank" rel="noreferrer">
              Public page
            </a>
          </Button>
          <Button asChild>
            <Link href="/dashboard/pages/landmarks/new">Add landmark</Link>
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

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading landmarks</p>
      ) : null}

      {!loading && landmarks.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
          <p className="font-medium">No landmarks yet</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/pages/landmarks/new">Add landmark</Link>
          </Button>
        </div>
      ) : null}

      {!loading && landmarks.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {landmarks.map((landmark) => (
            <article key={landmark.id} className="overflow-hidden rounded-2xl border bg-card">
              <div className="aspect-[16/10] bg-muted">
                {landmark.image ? (
                  <img
                    src={landmark.image.url}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 p-4">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">{landmarkGroupLabels[landmark.group]}</Badge>
                  <Badge variant={landmark.status === "PUBLISHED" ? "secondary" : "outline"}>
                    {landmark.status === "PUBLISHED" ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div>
                  <h2 className="font-semibold tracking-tight">{landmark.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{landmark.place}</p>
                </div>
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {landmark.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/pages/landmarks/${landmark.id}`}>Edit</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => void remove(landmark)}
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
