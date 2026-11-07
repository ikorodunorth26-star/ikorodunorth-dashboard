export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

export function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

export function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

export function linesToList(value: string): string[] {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function listToLines(value: string[]): string {
  return value.join("\n")
}
