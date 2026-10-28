"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApiError, getProject, saveReturnPath, type ProjectRecord } from "@/lib"
import { publicSiteUrl } from "@/lib/brand"

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

export function ProjectDetailView({ id }: { id: string }) {
  const router = useRouter()
  const [project, setProject] = useState<ProjectRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    getProject(id)
      .then((result) => {
        setProject(result.project)
        setError("")
      })
      .catch((caught: unknown) => {
        if (caught instanceof ApiError && caught.statusCode === 401) {
          saveReturnPath()
          router.replace("/auth/signin")
          return
        }
        setProject(null)
        setError(failure(caught))
      })
      .finally(() => setLoading(false))
  }, [id, router])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading project</p>
  }

  if (error || !project) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{error || "Project not found"}</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={load}>
            Retry
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/projects">Back to projects</Link>
          </Button>
        </div>
      </div>
    )
  }

  const publicUrl = `${publicSiteUrl}/projects/${project.slug}`

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex max-w-3xl flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={project.status === "PUBLISHED" ? "secondary" : "outline"}>
              {project.status === "PUBLISHED" ? "Published" : "Draft"}
            </Badge>
            <Badge variant="outline">{project.category}</Badge>
            <Badge variant="outline">{project.location}</Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {project.title}
          </h1>
          <p className="text-sm text-muted-foreground">{project.dateLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/projects">Back</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href={publicUrl} target="_blank" rel="noreferrer">
              Public URL
            </a>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/projects/${project.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      {project.summary ? (
        <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{project.summary}</p>
      ) : null}

      {project.featuredImage ? (
        <figure className="flex max-w-4xl flex-col gap-2">
          <img
            src={project.featuredImage.url}
            alt={project.featuredImage.alt || project.title}
            className="aspect-[16/9] w-full rounded-2xl object-cover"
          />
        </figure>
      ) : null}

      {project.paragraphs.length > 0 ? (
        <div className="flex max-w-3xl flex-col gap-5 text-[15px] leading-7">
          {project.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No body content yet.</p>
      )}

      {project.gallery.length > 0 ? (
        <section className="flex max-w-4xl flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Gallery</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {project.gallery.map((photo) => (
              <figure key={photo.id} className="flex flex-col gap-2">
                <img
                  src={photo.url}
                  alt={photo.alt || project.title}
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
                {photo.caption ? (
                  <figcaption className="text-sm text-muted-foreground">
                    {photo.caption}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
