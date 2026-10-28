import type { AuthSession } from "./types"

const SESSION_KEY = "ikorodu-north.session"

export function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null
  const raw = window.sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed.accessToken || !parsed.user?.email) return null
    return parsed
  } catch {
    return null
  }
}

export function saveSession(session: AuthSession): void {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  window.sessionStorage.removeItem(SESSION_KEY)
}
