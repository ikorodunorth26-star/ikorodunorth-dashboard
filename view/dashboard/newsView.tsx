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
  deleteNews,
  listNews,
  saveReturnPath,
  updateNewsStatus,
  type NewsRecord,
} from "@/lib"
import { publicSiteUrl } from "@/lib/brand"
import { showNotification } from "@/lib/showNotification"
import { TABLE_PAGE_SIZE } from "@/lib/table-page"

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

const columns: ContentTableColumn<NewsRecord>[] = [
  {
    id: "story",
    header: "Story",
    className: "max-w-sm",
    cell: (article) => (
      <ContentMediaCell
        title={article.title}
        imageUrl={article.featuredImage?.url}
      />
    ),
  },
  {
    id: "category",
    header: "Category",
    cell: (article) => article.category,
  },
  {
    id: "group",
    header: "Group",
    cell: (article) => (
      <span className="capitalize">{article.filterGroup}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (article) => (
      <div className="flex flex-wrap gap-1">
        <Badge variant={article.status === "PUBLISHED" ? "secondary" : "outline"}>
          {article.status === "PUBLISHED" ? "Published" : "Draft"}
        </Badge>
        {article.isFeatured ? <Badge>Featured</Badge> : null}
      </div>
    ),
  },
  {
    id: "date",
    header: "Date",
    className: "text-muted-foreground",
    cell: (article) => article.dateLabel,
  },
]

export function NewsView() {
  const router = useRouter()
  const [articles, setArticles] = useState<NewsRecord[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    listNews()
      .then((result) => {
        setArticles(result.articles)
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

  async function remove(article: NewsRecord) {
    if (!window.confirm(`Delete “${article.title}”?`)) return
    setBusyId(article.id)
    try {
      await deleteNews(article.id)
      setArticles((current) => {
        const next = current.filter((item) => item.id !== article.id)
        setPage((currentPage) => {
          const lastPage = Math.max(1, Math.ceil(next.length / TABLE_PAGE_SIZE))
          return Math.min(currentPage, lastPage)
        })
        return next
      })
      showNotification({ type: "success", message: "Story removed" })
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

  async function moveToDraft(article: NewsRecord) {
    if (article.status === "DRAFT") return
    setBusyId(article.id)
    try {
      const { article: saved } = await updateNewsStatus(article.id, "DRAFT")
      setArticles((current) =>
        current.map((item) => (item.id === article.id ? { ...item, ...saved } : item))
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

  function actionsForRow(article: NewsRecord): ContentTableAction[] {
    return [
      { label: "View", href: `/dashboard/news/${article.id}` },
      {
        label: "Public URL",
        href: `${publicSiteUrl}/news/${article.slug}`,
        external: true,
      },
      { label: "Edit", href: `/dashboard/news/${article.id}/edit` },
      {
        label: "Change status to draft",
        hidden: article.status !== "PUBLISHED",
        onSelect: () => {
          void moveToDraft(article)
        },
      },
      {
        label: "Delete",
        destructive: true,
        onSelect: () => {
          void remove(article)
        },
      },
    ]
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">News</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Drafts stay in the dashboard. Published stories are served by the public news endpoint.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/news/new">New story</Link>
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
        items={articles}
        page={page}
        onPageChange={setPage}
        loading={loading}
        loadingLabel="Loading stories"
        emptyTitle="No stories yet"
        emptyDescription="Create a news story to keep drafts here and publish them to the public news feed."
        emptyAction={
          <Button asChild>
            <Link href="/dashboard/news/new">New story</Link>
          </Button>
        }
        getRowLabel={(article) => article.title}
        actionsForRow={actionsForRow}
        busyId={busyId}
      />
    </div>
  )
}
