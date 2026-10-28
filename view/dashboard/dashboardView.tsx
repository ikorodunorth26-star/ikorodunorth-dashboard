"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ApiError,
  listDepartments,
  listLandmarks,
  listNews,
  listPeople,
  listProjects,
  listWards,
  saveReturnPath,
  type DepartmentRecord,
  type LandmarkRecord,
  type NewsRecord,
  type PersonRecord,
  type ProjectRecord,
  type WardRecord,
} from "@/lib"
import { publicSiteUrl } from "@/lib/brand"

type OverviewData = {
  news: NewsRecord[]
  projects: ProjectRecord[]
  people: PersonRecord[]
  wards: WardRecord[]
  landmarks: LandmarkRecord[]
  departments: DepartmentRecord[]
}

function published<T extends { status: string }>(items: T[]) {
  return items.filter((item) => item.status === "PUBLISHED")
}

function StatCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardHeader className="gap-3">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-8 w-16" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-40 max-w-full" />
      </CardContent>
    </Card>
  )
}

function OverviewPreloader({ refreshing }: { refreshing?: boolean }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <HugeiconsIcon
        icon={Loading03Icon}
        className="size-4 shrink-0 animate-spin"
        aria-hidden="true"
      />
      <span>{refreshing ? "Refreshing overview…" : "Loading overview statistics…"}</span>
    </div>
  )
}

function OverviewTableSkeleton({
  columns,
  rows = 5,
}: {
  columns: number
  rows?: number
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: columns }, (_, index) => (
            <TableHead key={index} className={index === columns - 1 ? "text-right" : undefined}>
              <Skeleton className={`h-3 ${index === columns - 1 ? "ml-auto w-12" : "w-20"}`} />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <TableRow key={rowIndex} aria-hidden="true">
            {Array.from({ length: columns }, (_, cellIndex) => (
              <TableCell key={cellIndex}>
                <Skeleton
                  className={`h-4 ${
                    cellIndex === 0
                      ? "w-48 max-w-full"
                      : cellIndex === columns - 1
                        ? "ml-auto w-16"
                        : "w-20"
                  }`}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Could not load overview"
}

const DashboardView = () => {
  const router = useRouter()
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      listNews(),
      listProjects(),
      listPeople(),
      listWards(),
      listLandmarks(),
      listDepartments(),
    ])
      .then(([news, projects, people, wards, landmarks, departments]) => {
        setData({
          news: news.articles ?? [],
          projects: projects.projects ?? [],
          people: people.people ?? [],
          wards: wards.wards ?? [],
          landmarks: landmarks.landmarks ?? [],
          departments: departments.departments ?? [],
        })
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

  const stats = useMemo(() => {
    if (!data) {
      return null
    }

    const newsPublished = published(data.news)
    const projectsPublished = published(data.projects)
    const peoplePublished = published(data.people)
    const wardsPublished = published(data.wards)
    const landmarksPublished = published(data.landmarks)
    const departmentsPublished = published(data.departments)

    const byNewsGroup = {
      community: newsPublished.filter((item) => item.filterGroup === "community")
        .length,
      council: newsPublished.filter((item) => item.filterGroup === "council")
        .length,
      projects: newsPublished.filter((item) => item.filterGroup === "projects")
        .length,
    }

    const departmentCount = departmentsPublished.filter(
      (item) => item.group === "department"
    ).length
    const unitCount = departmentsPublished.filter(
      (item) => item.group === "unit"
    ).length

    const executive = peoplePublished.filter((item) => item.team === "executive")
      .length
    const legislative = peoplePublished.filter((item) => item.team === "council")
      .length
    const management = peoplePublished.filter(
      (item) => item.team === "management"
    ).length

    const newsDrafts = data.news.length - newsPublished.length
    const projectDrafts = data.projects.length - projectsPublished.length

    const latestNews = [...newsPublished]
      .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn))
      .slice(0, 8)

    const projects = [...projectsPublished].sort((a, b) =>
      b.publishedOn.localeCompare(a.publishedOn)
    )

    return {
      newsPublished: newsPublished.length,
      newsDrafts,
      byNewsGroup,
      projectsPublished: projectsPublished.length,
      projectDrafts,
      wards: wardsPublished,
      wardsCount: wardsPublished.length,
      landmarksCount: landmarksPublished.length,
      departmentCount,
      unitCount,
      executive,
      legislative,
      management,
      latestNews,
      projects,
    }
  }, [data])

  const initialLoading = loading && !stats

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Live counts from the content API — published records on the Ikorodu North
            LCDA website.
          </p>
        </div>
        <Button variant="outline" size="sm" type="button" onClick={load} disabled={loading}>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <HugeiconsIcon
                icon={Loading03Icon}
                className="size-3.5 animate-spin"
                aria-hidden="true"
              />
              Refreshing
            </span>
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {loading ? <OverviewPreloader refreshing={Boolean(stats)} /> : null}

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm">
          <p>{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={load}>
            Retry
          </Button>
        </div>
      ) : null}

      {initialLoading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <StatCardSkeleton key={`stat-a-${index}`} />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <StatCardSkeleton key={`stat-b-${index}`} />
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-56 max-w-full" />
            </CardHeader>
            <CardContent>
              <OverviewTableSkeleton columns={3} rows={6} />
            </CardContent>
          </Card>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-48 max-w-full" />
              </CardHeader>
              <CardContent>
                <OverviewTableSkeleton columns={3} rows={5} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-52 max-w-full" />
              </CardHeader>
              <CardContent>
                <OverviewTableSkeleton columns={3} rows={5} />
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      {stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="News stories"
              value={stats.newsPublished}
              detail={`${stats.byNewsGroup.community} community, ${stats.byNewsGroup.council} council, ${stats.byNewsGroup.projects} projects${stats.newsDrafts ? ` · ${stats.newsDrafts} draft` : ""}`}
            />
            <StatCard
              label="Council projects"
              value={stats.projectsPublished}
              detail={
                stats.projectDrafts
                  ? `${stats.projectDrafts} draft in dashboard`
                  : "Published project pages"
              }
            />
            <StatCard
              label="Communities"
              value={stats.wardsCount}
              detail={stats.wards.map((ward) => ward.name).join(", ") || "Ward pages"}
            />
            <StatCard
              label="Departments and units"
              value={stats.departmentCount + stats.unitCount}
              detail={`${stats.departmentCount} departments, ${stats.unitCount} units`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Executive officers"
              value={stats.executive}
              detail="Executive Council team"
            />
            <StatCard
              label="Legislative members"
              value={stats.legislative}
              detail="Legislative House members"
            />
            <StatCard
              label="Management team"
              value={stats.management}
              detail="Officers at the Isiu secretariat"
            />
            <StatCard
              label="Landmarks"
              value={stats.landmarksCount}
              detail="Places on the landmarks page"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Latest news</CardTitle>
              <CardDescription>Newest published stories from the API.</CardDescription>
              <CardAction>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/news">Manage news</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`${publicSiteUrl}/news`} target="_blank" rel="noreferrer">
                      News page
                    </a>
                  </Button>
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              {stats.latestNews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No published news yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Story</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.latestNews.map((story) => (
                      <TableRow key={story.id}>
                        <TableCell className="max-w-md whitespace-normal font-medium">
                          <a
                            href={`${publicSiteUrl}/news/${story.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="underline-offset-4 hover:underline"
                          >
                            {story.title}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{story.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {story.dateLabel}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Published council projects from the API.</CardDescription>
                <CardAction>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/projects">Manage projects</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`${publicSiteUrl}/projects`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Projects page
                      </a>
                    </Button>
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent>
                {stats.projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No published projects yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Place</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="max-w-sm whitespace-normal">
                            <a
                              href={`${publicSiteUrl}/projects/${project.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium underline-offset-4 hover:underline"
                            >
                              {project.title}
                            </a>
                            <div className="mt-1">
                              <Badge variant="outline">{project.category}</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {project.location}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {project.dateLabel}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communities</CardTitle>
                <CardDescription>
                  Local projects and facilities on each ward page.
                </CardDescription>
                <CardAction>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/pages/wards">Manage wards</Link>
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                {stats.wards.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No published wards yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ward</TableHead>
                        <TableHead className="text-right">Projects</TableHead>
                        <TableHead className="text-right">Facilities</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.wards.map((ward) => (
                        <TableRow key={ward.id}>
                          <TableCell className="font-medium">
                            <a
                              href={`${publicSiteUrl}/communities/${ward.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="underline-offset-4 hover:underline"
                            >
                              {ward.name}
                            </a>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {ward.projects?.length ?? 0}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {ward.facilities?.length ?? 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default DashboardView
