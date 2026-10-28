"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ApiError,
  getPerson,
  saveReturnPath,
  teamMeta,
  type PersonRecord,
} from "@/lib"
import { publicSiteUrl } from "@/lib/brand"

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

export function PersonDetailView({ id }: { id: string }) {
  const router = useRouter()
  const [person, setPerson] = useState<PersonRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    getPerson(id)
      .then((result) => {
        setPerson(result.person)
        setError("")
      })
      .catch((caught: unknown) => {
        if (caught instanceof ApiError && caught.statusCode === 401) {
          saveReturnPath()
          router.replace("/auth/signin")
          return
        }
        setPerson(null)
        setError(failure(caught))
      })
      .finally(() => setLoading(false))
  }, [id, router])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading profile</p>
  }

  if (error || !person) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{error || "Person not found"}</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={load}>
            Retry
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/people">Back to people</Link>
          </Button>
        </div>
      </div>
    )
  }

  const meta = teamMeta[person.team]
  const publicUrl = `${publicSiteUrl}${meta.publicPath}`

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/people" className="hover:text-foreground">
          People
        </Link>
        <span>/</span>
        <Link
          href={`/dashboard/people/${person.team}`}
          className="hover:text-foreground"
        >
          {meta.shortLabel}
        </Link>
        <span>/</span>
        <span className="text-foreground">{person.name}</span>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <figure className="overflow-hidden rounded-3xl border bg-muted">
          {person.portrait ? (
            <img
              src={person.portrait.url}
              alt={person.portrait.alt || person.name}
              className="aspect-[4/5] w-full object-cover object-top"
            />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center text-sm text-muted-foreground">
              No portrait
            </div>
          )}
        </figure>

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex max-w-2xl flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{meta.label}</Badge>
                {person.isLead ? <Badge>Lead</Badge> : null}
                <Badge
                  variant={person.status === "PUBLISHED" ? "secondary" : "outline"}
                >
                  {person.status === "PUBLISHED" ? "Published" : "Draft"}
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">
                {person.name}
              </h1>
              <p className="text-lg text-muted-foreground">{person.title}</p>
              {person.ward ? (
                <p className="text-sm text-muted-foreground">{person.ward}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <a href={publicUrl} target="_blank" rel="noreferrer">
                  Public URL
                </a>
              </Button>
              <Button asChild>
                <Link href={`/dashboard/people/${person.id}/edit`}>Edit</Link>
              </Button>
            </div>
          </div>

          {(person.email || person.phone) && (
            <dl className="grid gap-3 rounded-2xl border px-4 py-4 sm:grid-cols-2">
              {person.email ? (
                <div>
                  <dt className="text-xs tracking-[0.12em] text-muted-foreground uppercase">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm">{person.email}</dd>
                </div>
              ) : null}
              {person.phone ? (
                <div>
                  <dt className="text-xs tracking-[0.12em] text-muted-foreground uppercase">
                    Phone
                  </dt>
                  <dd className="mt-1 text-sm">{person.phone}</dd>
                </div>
              ) : null}
            </dl>
          )}

          {person.bio ? (
            <div className="max-w-2xl space-y-4 text-[15px] leading-7 whitespace-pre-line">
              {person.bio}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No biography yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
