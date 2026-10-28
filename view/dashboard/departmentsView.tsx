"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ApiError,
  deleteDepartment,
  departmentGroupLabels,
  listDepartments,
  saveReturnPath,
  type DepartmentRecord,
} from "@/lib"
import { publicSiteUrl } from "@/lib/brand"
import { showNotification } from "@/lib/showNotification"

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

export function DepartmentsView() {
  const router = useRouter()
  const [departments, setDepartments] = useState<DepartmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    listDepartments()
      .then((result) => {
        setDepartments(result.departments)
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

  async function remove(department: DepartmentRecord) {
    if (!window.confirm(`Delete “${department.title}”?`)) return
    try {
      await deleteDepartment(department.id)
      setDepartments((current) =>
        current.filter((item) => item.id !== department.id)
      )
      showNotification({ type: "success", message: "Department removed" })
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
          <h1 className="text-3xl font-semibold tracking-tight">Departments</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Directory cards and detail profiles for the public departments page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/pages/departments">Page chrome</Link>
          </Button>
          <Button variant="outline" asChild>
            <a
              href={`${publicSiteUrl}/government/departments`}
              target="_blank"
              rel="noreferrer"
            >
              Public page
            </a>
          </Button>
          <Button asChild>
            <Link href="/dashboard/pages/departments/items/new">Add department</Link>
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
        <p className="text-sm text-muted-foreground">Loading departments</p>
      ) : null}

      {!loading && departments.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
          <p className="font-medium">No departments yet</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/pages/departments/items/new">Add department</Link>
          </Button>
        </div>
      ) : null}

      {!loading && departments.length > 0 ? (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {departments.map((department) => (
              <article
                key={department.id}
                className="flex flex-col gap-3 rounded-2xl border bg-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{department.title}</p>
                    <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                      {department.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      department.status === "PUBLISHED" ? "default" : "secondary"
                    }
                  >
                    {department.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {departmentGroupLabels[department.group]}
                  </Badge>
                  {department.featuredOnHome ? (
                    <Badge variant="secondary">Home</Badge>
                  ) : null}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="break-all">{department.email}</p>
                  <p>{department.phone}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/pages/departments/items/${department.id}`}>
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => void remove(department)}
                  >
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border md:block [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Group</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr key={department.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{department.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {department.description}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {departmentGroupLabels[department.group]}
                      </Badge>
                      {department.featuredOnHome ? (
                        <Badge className="ml-2" variant="secondary">
                          Home
                        </Badge>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{department.email}</p>
                      <p>{department.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          department.status === "PUBLISHED" ? "default" : "secondary"
                        }
                      >
                        {department.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/dashboard/pages/departments/items/${department.id}`}
                          >
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => void remove(department)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  )
}
