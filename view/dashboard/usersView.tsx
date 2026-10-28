"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  createStaff,
  listStaff,
  readSession,
  saveReturnPath,
  staffRoleLabel,
  staffRoles,
  type StaffRecord,
  type StaffRole,
} from "@/lib"
import { showNotification } from "@/lib/showNotification"

const assignableRoles = staffRoles

function failure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Request failed"
}

function formatWhen(value: string | null | undefined) {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value))
  } catch {
    return "—"
  }
}

export function UsersView() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [users, setUsers] = useState<StaffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<StaffRole>("EDITOR")

  const load = useCallback(() => {
    setLoading(true)
    listStaff()
      .then((result) => {
        setUsers(result.users)
        setError("")
      })
      .catch((caught: unknown) => {
        if (caught instanceof ApiError && caught.statusCode === 401) {
          saveReturnPath()
          router.replace("/auth/signin")
          return
        }
        if (caught instanceof ApiError && caught.statusCode === 403) {
          router.replace("/dashboard")
          return
        }
        setError(failure(caught))
      })
      .finally(() => setLoading(false))
  }, [router])

  useEffect(() => {
    const session = readSession()
    if (!session) {
      saveReturnPath()
      router.replace("/auth/signin")
      return
    }
    if (session.user.role !== "SUPERADMIN") {
      router.replace("/dashboard")
      return
    }
    setAllowed(true)
    load()
  }, [load, router])

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      const created = await createStaff({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      })
      setUsers((current) => [...current, created.user])
      setFirstName("")
      setLastName("")
      setEmail("")
      setPassword("")
      setRole("EDITOR")
      showNotification({
        type: "success",
        message: `${created.user.firstName} added as ${staffRoleLabel(created.user.role)}`,
      })
    } catch (caught) {
      if (caught instanceof ApiError && caught.statusCode === 401) {
        saveReturnPath()
        router.replace("/auth/signin")
        return
      }
      showNotification({ type: "error", message: failure(caught) })
    } finally {
      setSaving(false)
    }
  }

  if (!allowed) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <HugeiconsIcon
          icon={Loading03Icon}
          className="size-4 animate-spin"
          aria-hidden="true"
        />
        Checking access…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Super admin only. Create dashboard accounts and assign a role.
          </p>
        </div>
        <Button variant="outline" size="sm" type="button" onClick={load} disabled={loading}>
          {loading ? "Refreshing" : "Refresh"}
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

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Add user</CardTitle>
            <CardDescription>
              New accounts can sign in immediately. Share the password securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={(event) => void save(event)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                    minLength={2}
                    autoComplete="off"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                    minLength={2}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Temporary password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters, letter and number"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={role}
                  onChange={(event) => setRole(event.target.value as StaffRole)}
                >
                  {assignableRoles.map((value) => (
                    <option key={value} value={value}>
                      {staffRoleLabel(value)}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create user"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff accounts</CardTitle>
            <CardDescription>
              {loading ? "Loading accounts…" : `${users.length} user${users.length === 1 ? "" : "s"}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }, (_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground">No staff accounts yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Last login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{staffRoleLabel(user.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === "ACTIVE" ? "default" : "outline"}
                        >
                          {user.status === "ACTIVE" ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatWhen(user.lastLoginAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
