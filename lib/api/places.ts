import { apiRequest } from "./client"
import type { ContentImage, ContentStatus } from "./content"

export type LandmarkGroup =
  | "administration"
  | "learning"
  | "industry"
  | "tradition"
  | "movement"
  | "community"

export type LandmarkRecord = {
  id: string
  slug: string
  title: string
  place: string
  group: LandmarkGroup
  summary: string
  caption: string | null
  sortOrder: number
  status: ContentStatus
  image: ContentImage | null
  createdAt: string
  updatedAt: string
}

export type LandmarkInput = {
  slug?: string
  title: string
  place: string
  group: LandmarkGroup
  summary: string
  caption?: string | null
  sortOrder?: number
  status: ContentStatus
  imageId: string | null
  imageAlt?: string
}

export type WardProject = {
  status: string
  category: string
  title: string
  description: string
  meta: string
}

export type WardRecord = {
  id: string
  slug: string
  name: string
  introduction: string
  overviewHeading: string
  overviewParagraphs: string[]
  overviewNote: string | null
  facilities: string[]
  projectsEyebrow: string | null
  projects: WardProject[]
  newsStory: { label: string; title: string } | null
  concern: boolean
  tag: string | null
  landmarksBlurb: string | null
  sortOrder: number
  status: ContentStatus
  image: ContentImage | null
  createdAt: string
  updatedAt: string
}

export type WardInput = {
  slug?: string
  name: string
  introduction: string
  overviewHeading: string
  overviewParagraphs: string[]
  overviewNote?: string | null
  facilities: string[]
  projectsEyebrow?: string | null
  projects: WardProject[]
  newsStory?: { label: string; title: string } | null
  concern?: boolean
  tag?: string | null
  landmarksBlurb?: string | null
  sortOrder?: number
  status: ContentStatus
  imageId: string | null
  imageAlt?: string
}

export const landmarkGroupLabels: Record<LandmarkGroup, string> = {
  administration: "Council",
  learning: "Learning",
  industry: "Industry",
  tradition: "Culture",
  movement: "Routes",
  community: "Community",
}

export function listLandmarks() {
  return apiRequest<{ landmarks: LandmarkRecord[] }>("/v1/landmarks")
}

export function getLandmark(id: string) {
  return apiRequest<{ landmark: LandmarkRecord }>(`/v1/landmarks/${id}`)
}

export function createLandmark(input: LandmarkInput) {
  return apiRequest<{ landmark: LandmarkRecord }>("/v1/landmarks", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateLandmark(
  id: string,
  input: LandmarkInput | Partial<LandmarkInput>
) {
  return apiRequest<{ landmark: LandmarkRecord }>(`/v1/landmarks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function deleteLandmark(id: string) {
  return apiRequest<undefined>(`/v1/landmarks/${id}`, { method: "DELETE" })
}

export function listWards() {
  return apiRequest<{ wards: WardRecord[] }>("/v1/wards")
}

export function getWard(id: string) {
  return apiRequest<{ ward: WardRecord }>(`/v1/wards/${id}`)
}

export function createWard(input: WardInput) {
  return apiRequest<{ ward: WardRecord }>("/v1/wards", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateWard(id: string, input: WardInput | Partial<WardInput>) {
  return apiRequest<{ ward: WardRecord }>(`/v1/wards/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function deleteWard(id: string) {
  return apiRequest<undefined>(`/v1/wards/${id}`, { method: "DELETE" })
}
