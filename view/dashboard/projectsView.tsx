"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  ContentDataTable,
  ContentMediaCell,
  type ContentTableAction,
  type ContentTableColumn,
} from "@/components/dashboard/content/content-data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ApiError,
  deleteProject,
  listProjects,
  saveReturnPath,
  updateProjectStatus,
  type ProjectRecord,
} from "@/lib"
import { publicSiteUrl } from "@/lib/brand"
import { showNotification } from "@/lib/showNotification"
import { TABLE_PAGE_SIZE } from "@/lib/table-page"

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

const columns: ContentTableColumn<ProjectRecord>[] = [
  {
    id: "project",
    header: "Project",
    className: "max-w-md",
    cell: (project) => (
      <ContentMediaCell
        title={project.title}
        subtitle={project.category}
        imageUrl={project.featuredImage?.url}
      />
    ),
  },
  {
    id: "place",
    header: "Place",
    className: "text-muted-foreground",
    cell: (project) => project.location,
  },
  {
    id: "status",
    header: "Status",
    cell: (project) => (
      <Badge variant={project.status === "PUBLISHED" ? "secondary" : "outline"}>
        {project.status === "PUBLISHED" ? "Published" : "Draft"}
      </Badge>
    ),
  },
  {
    id: "date",
    header: "Date",
    className: "text-muted-foreground",
    cell: (project) => project.dateLabel,
  },
]

export function ProjectsView() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    listProjects()
      .then((result) => {
        setProjects(result.projects)
        setPage(1)
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

  async function remove(project: ProjectRecord) {
    if (!window.confirm(`Delete “${project.title}”?`)) return
    setBusyId(project.id)
    try {
      await deleteProject(project.id)
      setProjects((current) => {
        const next = current.filter((item) => item.id !== project.id)
        setPage((currentPage) => {
          const lastPage = Math.max(1, Math.ceil(next.length / TABLE_PAGE_SIZE))
          return Math.min(currentPage, lastPage)
        })
        return next
      })
      showNotification({ type: "success", message: "Project removed" })
    } catch (caught) {
      if (caught instanceof ApiError && caught.statusCode === 401) {
        saveReturnPath()
        router.replace("/auth/signin")
        return
      }
      showNotification({ type: "error", message: failure(caught) })
    } finally {
      setBusyId(null)
    }
  }

  async function moveToDraft(project: ProjectRecord) {
    if (project.status === "DRAFT") return
    setBusyId(project.id)
    try {
      const { project: saved } = await updateProjectStatus(project.id, "DRAFT")
      setProjects((current) =>
        current.map((item) => (item.id === project.id ? { ...item, ...saved } : item))
      )
      showNotification({ type: "success", message: "Moved to draft" })
    } catch (caught) {
      if (caught instanceof ApiError && caught.statusCode === 401) {
        saveReturnPath()
        router.replace("/auth/signin")
        return
      }
      showNotification({ type: "error", message: failure(caught) })
    } finally {
      setBusyId(null)
    }
  }

  function actionsForRow(project: ProjectRecord): ContentTableAction[] {
    return [
      { label: "View", href: `/dashboard/projects/${project.id}` },
      {
        label: "Public URL",
        href: `${publicSiteUrl}/projects/${project.slug}`,
        external: true,
      },
      { label: "Edit", href: `/dashboard/projects/${project.id}/edit` },
      {
        label: "Change status to draft",
        hidden: project.status !== "PUBLISHED",
        onSelect: () => {
          void moveToDraft(project)
        },
      },
      {
        label: "Delete",
        destructive: true,
        onSelect: () => {
          void remove(project)
        },
      },
    ]
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Drafts stay in the dashboard. Published projects are served by the public projects endpoint.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">New project</Link>
        </Button>
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm">
          <p>{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={load}>
            Retry
          </Button>
        </div>
      ) : null}

      <ContentDataTable
        columns={columns}
        items={projects}
        page={page}
        onPageChange={setPage}
        loading={loading}
        loadingLabel="Loading projects"
        emptyTitle="No projects yet"
        emptyDescription="Create a project to keep drafts here and publish them to the public projects feed."
        emptyAction={
          <Button asChild>
            <Link href="/dashboard/projects/new">New project</Link>
          </Button>
        }
        getRowLabel={(project) => project.title}
        actionsForRow={actionsForRow}
        busyId={busyId}
        withSubtitleSkeleton
      />
    </div>
  )
}
