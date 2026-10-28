"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApiError, getNews, saveReturnPath, type NewsRecord } from "@/lib"
import { publicSiteUrl } from "@/lib/brand"

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

export function NewsDetailView({ id }: { id: string }) {
  const router = useRouter()
  const [article, setArticle] = useState<NewsRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    getNews(id)
      .then((result) => {
        setArticle(result.article)
        setError("")
      })
      .catch((caught: unknown) => {
        if (caught instanceof ApiError && caught.statusCode === 401) {
          saveReturnPath()
          router.replace("/auth/signin")
          return
        }
        setArticle(null)
        setError(failure(caught))
      })
      .finally(() => setLoading(false))
  }, [id, router])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading story</p>
  }

  if (error || !article) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{error || "Story not found"}</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={load}>
            Retry
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/news">Back to news</Link>
          </Button>
        </div>
      </div>
    )
  }

  const publicUrl = `${publicSiteUrl}/news/${article.slug}`

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex max-w-3xl flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={article.status === "PUBLISHED" ? "secondary" : "outline"}>
              {article.status === "PUBLISHED" ? "Published" : "Draft"}
            </Badge>
            {article.isFeatured ? <Badge>Featured</Badge> : null}
            <Badge variant="outline">{article.category}</Badge>
            <Badge variant="outline" className="capitalize">
              {article.filterGroup}
            </Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {article.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {article.dateLabel}
            {article.readTime ? ` · ${article.readTime}` : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/news">Back</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href={publicUrl} target="_blank" rel="noreferrer">
              Public URL
            </a>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/news/${article.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      {article.summary ? (
        <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{article.summary}</p>
      ) : null}

      {article.featuredImage ? (
        <figure className="flex max-w-4xl flex-col gap-2">
          <img
            src={article.featuredImage.url}
            alt={article.featuredImage.alt || article.title}
            className="aspect-[16/9] w-full rounded-2xl object-cover"
          />
          {article.caption ? (
            <figcaption className="text-sm text-muted-foreground">{article.caption}</figcaption>
          ) : null}
        </figure>
      ) : null}

      {article.body ? (
        <div
          className="prose-editor max-w-3xl text-[15px] leading-7"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">No body content yet.</p>
      )}

      {article.gallery.length > 0 ? (
        <section className="flex max-w-4xl flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Gallery</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {article.gallery.map((photo) => (
              <figure key={photo.id} className="flex flex-col gap-2">
                <img
                  src={photo.url}
                  alt={photo.alt || article.title}
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
