import { saveReturnPath } from "@/lib/auth/return-path"
import { clearSession, readSession, saveSession } from "@/lib/auth/session"
import type { AuthSession } from "@/lib/auth/types"

function expireSession(): void {
  saveReturnPath()
  clearSession()
}

export class ApiError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
  }
}

type ApiEnvelope<T> = {
  statusCode: number
  statusType: string
  message: string
  data?: T
}

function apiOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL
  if (raw == null) return ""
  const configured = raw.trim()
  // Empty / "same" = call the Next.js /v1 proxy (avoids browser localhost CORS issues).
  if (!configured || configured === "/" || configured === "same") return ""
  return configured.replace(/\/$/, "")
}

function errorMessage(body: ApiEnvelope<unknown>): string {
  const data = body.data
  if (data && typeof data === "object" && "errors" in data) {
    const errors = (data as { errors?: unknown }).errors
    if (Array.isArray(errors) && typeof errors[0] === "string") {
      return errors[0]
    }
  }
  return body.message || "Request failed"
}

function requestHeaders(init: RequestInit): Headers {
  const headers = new Headers(init.headers)
  if (!headers.has("Accept")) headers.set("Accept", "application/json")
  const isForm =
    typeof FormData !== "undefined" && init.body instanceof FormData
  if (!isForm && init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  const session = readSession()
  if (session?.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${session.accessToken}`)
  }
  return headers
}

async function refreshSession(refreshToken: string): Promise<void> {
  let response: Response
  try {
    response = await fetch(`${apiOrigin()}/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })
  } catch {
    expireSession()
    throw new ApiError("Cannot reach the API", 0)
  }

  let body: ApiEnvelope<AuthSession>
  try {
    body = (await response.json()) as ApiEnvelope<AuthSession>
  } catch {
    expireSession()
    throw new ApiError("Session expired", response.status || 401)
  }

  if (!response.ok || !body.data?.accessToken) {
    expireSession()
    throw new ApiError(errorMessage(body), response.status || 401)
  }
  saveSession(body.data)
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  retried = false
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${apiOrigin()}${path}`, {
      ...init,
      credentials: "include",
      headers: requestHeaders(init),
    })
  } catch {
    throw new ApiError("Cannot reach the API", 0)
  }

  if (
    response.status === 401 &&
    !retried &&
    !path.startsWith("/v1/auth/")
  ) {
    const session = readSession()
    if (session?.refreshToken) {
      await refreshSession(session.refreshToken)
      return apiRequest<T>(path, init, true)
    }
  }

  let body: ApiEnvelope<T>
  try {
    body = (await response.json()) as ApiEnvelope<T>
  } catch {
    throw new ApiError("Request failed", response.status)
  }

  if (!response.ok) {
    throw new ApiError(errorMessage(body), response.status)
  }

  return body.data as T
}
