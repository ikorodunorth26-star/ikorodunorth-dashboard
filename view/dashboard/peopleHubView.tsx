"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ApiError,
  listPeople,
  saveReturnPath,
  teamMeta,
  type PersonRecord,
  type TeamGroup,
} from "@/lib"
import { publicSiteUrl } from "@/lib/brand"

const teams: TeamGroup[] = ["executive", "council", "management"]

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

export function PeopleHubView() {
  const router = useRouter()
  const [people, setPeople] = useState<PersonRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    listPeople()
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
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Government
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">People</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Review and publish the three public directories that sit behind the
          government pages: Executive Council, Legislative House, and Management Team.
        </p>
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm">
          <p>{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={load}>
            Retry
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {teams.map((team) => {
          const meta = teamMeta[team]
          const members = people.filter((person) => person.team === team)
          const published = members.filter((person) => person.status === "PUBLISHED")
          const lead = members.find((person) => person.isLead) ?? members[0]

          return (
            <article
              key={team}
              className="flex flex-col overflow-hidden rounded-2xl border bg-card"
            >
              <div className="relative aspect-[5/3] bg-muted">
                {lead?.portrait ? (
                  <img
                    src={lead.portrait.url}
                    alt=""
                    className="absolute inset-0 size-full object-cover object-top"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                    {loading ? "Loading portraits" : "No portraits yet"}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/75 to-transparent p-4 pt-16 text-background">
                  <p className="text-xs tracking-[0.16em] uppercase opacity-80">
                    {meta.shortLabel}
                  </p>
                  <h2 className="text-xl font-semibold tracking-tight">{meta.label}</h2>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-5">
                <p className="text-sm leading-6 text-muted-foreground">{meta.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{members.length} people</Badge>
                  <Badge variant="outline">{published.length} published</Badge>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href={`/dashboard/people/${team}`}>Open directory</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a
                      href={`${publicSiteUrl}${meta.publicPath}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Public page
                    </a>
                  </Button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
