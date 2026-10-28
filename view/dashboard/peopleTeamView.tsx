"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ApiError,
  deletePerson,
  listPeople,
  saveReturnPath,
  teamMeta,
  updatePersonStatus,
  type PersonRecord,
  type TeamGroup,
} from "@/lib"
import { publicSiteUrl } from "@/lib/brand"
import { showNotification } from "@/lib/showNotification"

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

export function PeopleTeamView({ team }: { team: TeamGroup }) {
  const router = useRouter()
  const meta = teamMeta[team]
  const [people, setPeople] = useState<PersonRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)

  const ordered = useMemo(
    () =>
      [...people].sort((a, b) => {
        if (a.isLead !== b.isLead) return a.isLead ? -1 : 1
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
        return a.name.localeCompare(b.name)
      }),
    [people]
  )

  const load = useCallback(() => {
    setLoading(true)
    listPeople(team)
      .then((result) => {
        setPeople(result.people)
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
  }, [router, team])

  useEffect(() => {
    load()
  }, [load])

  async function remove(person: PersonRecord) {
    if (!window.confirm(`Delete “${person.name}”?`)) return
    setBusyId(person.id)
    try {
      await deletePerson(person.id)
      setPeople((current) => current.filter((item) => item.id !== person.id))
      showNotification({ type: "success", message: "Person removed" })
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

  async function moveToDraft(person: PersonRecord) {
    if (person.status === "DRAFT") return
    setBusyId(person.id)
    try {
      const { person: saved } = await updatePersonStatus(person.id, "DRAFT")
      setPeople((current) =>
        current.map((item) => (item.id === person.id ? { ...item, ...saved } : item))
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex max-w-3xl flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
              <Link href="/dashboard/people">People</Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">{meta.shortLabel}</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{meta.label}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{meta.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a
              href={`${publicSiteUrl}${meta.publicPath}`}
              target="_blank"
              rel="noreferrer"
            >
              Public page
            </a>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/people/new?team=${team}`}>Add person</Link>
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border bg-card"
              aria-hidden
            >
              <div className="aspect-[4/5] animate-pulse bg-muted" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && ordered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <p className="text-base font-medium">No people in this directory yet</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Add portraits and titles so staff can review this team before it goes
            live on the public site.
          </p>
          <Button asChild>
            <Link href={`/dashboard/people/new?team=${team}`}>Add person</Link>
          </Button>
        </div>
      ) : null}

      {!loading && ordered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {ordered.map((person) => (
            <article
              key={person.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card"
            >
              <Link
                href={`/dashboard/people/${person.id}`}
                className="relative block aspect-[4/5] overflow-hidden bg-muted"
              >
                {person.portrait ? (
                  <img
                    src={person.portrait.url}
                    alt={person.portrait.alt || person.name}
                    className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                    No portrait
                  </div>
                )}
                <div className="absolute inset-x-0 top-0 flex justify-between gap-2 p-3">
                  <div className="flex flex-wrap gap-1">
                    {person.isLead ? <Badge>Lead</Badge> : null}
                    <Badge
                      variant={person.status === "PUBLISHED" ? "secondary" : "outline"}
                    >
                      {person.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </Link>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="pr-8">
                  <h2 className="font-semibold tracking-tight text-balance">
                    <Link href={`/dashboard/people/${person.id}`}>{person.name}</Link>
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {person.title}
                  </p>
                  {person.ward ? (
                    <p className="mt-1 text-xs text-muted-foreground">{person.ward}</p>
                  ) : null}
                </div>
                <div className="absolute right-3 bottom-[4.75rem]">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={busyId === person.id}
                        aria-label={`Actions for ${person.name}`}
                      >
                        <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/people/${person.id}`}>View</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href={`${publicSiteUrl}${meta.publicPath}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Public URL
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/people/${person.id}/edit`}>Edit</Link>
                      </DropdownMenuItem>
                      {person.status === "PUBLISHED" ? (
                        <DropdownMenuItem
                          onSelect={() => {
                            void moveToDraft(person)
                          }}
                        >
                          Change status to draft
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => {
                          void remove(person)
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  )
}
