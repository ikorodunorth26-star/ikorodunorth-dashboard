import { apiRequest } from "./client"

export type ContentStatus = "DRAFT" | "PUBLISHED"
export type NewsGroup = "council" | "projects" | "community"

export type ContentImage = {
  id: string
  url: string
  alt: string
  width: number | null
  height: number | null
}

export type GalleryImage = ContentImage & {
  caption: string
}

export type NewsRecord = {
  id: string
  slug: string
  title: string
  summary: string
  category: string
  filterGroup: NewsGroup
  publishedOn: string
  dateLabel: string
  readTime: string
  caption: string
  body: string
  status: ContentStatus
  isFeatured: boolean
  featuredImage: ContentImage | null
  gallery: GalleryImage[]
  createdAt: string
  updatedAt: string
}

export type ProjectRecord = {
  id: string
  slug: string
  title: string
  summary: string
  category: string
  location: string
  publishedOn: string
  dateLabel: string
  paragraphs: string[]
  status: ContentStatus
  featuredImage: ContentImage | null
  gallery: GalleryImage[]
  createdAt: string
  updatedAt: string
}

export type GalleryInput = {
  mediaId: string
  caption?: string
  alt?: string
}

export type NewsInput = {
  slug?: string
  title: string
  summary: string
  category: string
  filterGroup: NewsGroup
  publishedOn: string
  readTime?: string
  caption?: string
  body: string
  status: ContentStatus
  isFeatured: boolean
  featuredImageId: string | null
  featuredImageAlt?: string
  gallery: GalleryInput[]
}

export type ProjectInput = {
  slug?: string
  title: string
  summary: string
  category: string
  location: string
  publishedOn: string
  paragraphs: string[]
  status: ContentStatus
  featuredImageId: string | null
  featuredImageAlt?: string
  gallery: GalleryInput[]
}

export function listNews() {
  return apiRequest<{ articles: NewsRecord[] }>("/v1/news")
}

export function getNews(id: string) {
  return apiRequest<{ article: NewsRecord }>(`/v1/news/${id}`)
}

export function createNews(input: NewsInput) {
  return apiRequest<{ article: NewsRecord }>("/v1/news", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateNews(id: string, input: NewsInput | Partial<NewsInput>) {
  return apiRequest<{ article: NewsRecord }>(`/v1/news/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function updateNewsStatus(id: string, status: ContentStatus) {
  return updateNews(id, { status })
}

export function deleteNews(id: string) {
  return apiRequest<undefined>(`/v1/news/${id}`, { method: "DELETE" })
}

export function listProjects() {
  return apiRequest<{ projects: ProjectRecord[] }>("/v1/projects")
}

export function getProject(id: string) {
  return apiRequest<{ project: ProjectRecord }>(`/v1/projects/${id}`)
}

export function createProject(input: ProjectInput) {
  return apiRequest<{ project: ProjectRecord }>("/v1/projects", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateProject(id: string, input: ProjectInput | Partial<ProjectInput>) {
  return apiRequest<{ project: ProjectRecord }>(`/v1/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function updateProjectStatus(id: string, status: ContentStatus) {
  return updateProject(id, { status })
}

export function deleteProject(id: string) {
  return apiRequest<undefined>(`/v1/projects/${id}`, { method: "DELETE" })
}
