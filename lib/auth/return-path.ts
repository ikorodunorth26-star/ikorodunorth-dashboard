const RETURN_PATH_KEY = "ikorodu-north.return-path"
const DEFAULT_PATH = "/dashboard"

export function isSafeReturnPath(path: string): boolean {
  if (!path.startsWith("/dashboard")) return false
  if (path.startsWith("//")) return false
  if (path.includes("://")) return false
  return true
}

function currentPath(): string {
  if (typeof window === "undefined") return DEFAULT_PATH
  return `${window.location.pathname}${window.location.search}`
}

export function saveReturnPath(path?: string): void {
  if (typeof window === "undefined") return
  const next = path ?? currentPath()
  if (!isSafeReturnPath(next.split("?")[0] ?? next)) return
  window.sessionStorage.setItem(RETURN_PATH_KEY, next)
}

export function clearReturnPath(): void {
  if (typeof window === "undefined") return
  window.sessionStorage.removeItem(RETURN_PATH_KEY)
}

export function takeReturnPath(): string {
  if (typeof window === "undefined") return DEFAULT_PATH
  const saved = window.sessionStorage.getItem(RETURN_PATH_KEY)
  window.sessionStorage.removeItem(RETURN_PATH_KEY)
  if (!saved) return DEFAULT_PATH
  const pathOnly = saved.split("?")[0] ?? saved
  return isSafeReturnPath(pathOnly) ? saved : DEFAULT_PATH
}
