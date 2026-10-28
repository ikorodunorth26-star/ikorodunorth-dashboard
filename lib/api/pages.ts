import { apiRequest } from "./client"
import type { ContentImage, ContentStatus } from "./content"

export type SitePageKey =
  | "about"
  | "landmarks"
  | "contact"
  | "suggest_project"
  | "home"
  | "departments"
  | "navigation"
  | "footer"
  | "site_config"

export type SitePageRecord = {
  id: string
  key: SitePageKey | string
  label: string
  title: string
  description: string
  content: Record<string, unknown>
  status: ContentStatus
  coverImage: ContentImage | null
  createdAt: string
  updatedAt: string
}

export type SitePageInput = {
  label?: string
  title?: string
  description?: string
  content?: Record<string, unknown>
  status?: ContentStatus
  coverImageId?: string | null
}

export function listPages() {
  return apiRequest<{ pages: SitePageRecord[]; keys: string[] }>("/v1/pages")
}

export function getPage(key: SitePageKey | string) {
  return apiRequest<{ page: SitePageRecord }>(`/v1/pages/${key}`)
}

export function updatePage(key: SitePageKey | string, input: SitePageInput) {
  return apiRequest<{ page: SitePageRecord }>(`/v1/pages/${key}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}
