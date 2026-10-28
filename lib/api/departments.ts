import { apiRequest } from "./client"
import type { ContentImage, ContentStatus } from "./content"

export type DepartmentGroup = "department" | "unit"

export type DepartmentRecord = {
  id: string
  slug: string
  title: string
  description: string
  email: string
  phone: string
  icon: string
  group: DepartmentGroup
  health: boolean
  featuredOnHome: boolean
  publicHref: string | null
  headName: string | null
  headRole: string | null
  detailHeading: string | null
  detailParagraphs: string[]
  responsibilities: string[]
  sortOrder: number
  status: ContentStatus
  image: ContentImage | null
  createdAt: string
  updatedAt: string
}

export type DepartmentInput = {
  slug?: string
  title: string
  description: string
  email: string
  phone: string
  icon: string
  group: DepartmentGroup
  health?: boolean
  featuredOnHome?: boolean
  publicHref?: string | null
  headName?: string | null
  headRole?: string | null
  detailHeading?: string | null
  detailParagraphs?: string[]
  responsibilities?: string[]
  sortOrder?: number
  status: ContentStatus
  imageId?: string | null
  imageAlt?: string
}

export const departmentGroupLabels: Record<DepartmentGroup, string> = {
  department: "Department",
  unit: "Unit",
}

export const departmentIconOptions = [
  "userRoundCog",
  "coins",
  "heartPulse",
  "graduationCap",
  "clipboardCheck",
  "shieldCheck",
  "store",
  "userRound",
  "landmark",
  "bookOpen",
  "messageSquare",
  "fileCheck",
  "fileText",
  "receiptText",
  "files",
] as const

export function listDepartments() {
  return apiRequest<{ departments: DepartmentRecord[] }>("/v1/departments")
}

export function getDepartment(id: string) {
  return apiRequest<{ department: DepartmentRecord }>(`/v1/departments/${id}`)
}

export function createDepartment(input: DepartmentInput) {
  return apiRequest<{ department: DepartmentRecord }>("/v1/departments", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateDepartment(id: string, input: Partial<DepartmentInput>) {
  return apiRequest<{ department: DepartmentRecord }>(`/v1/departments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function deleteDepartment(id: string) {
  return apiRequest<{ ok?: boolean }>(`/v1/departments/${id}`, {
    method: "DELETE",
  })
}
