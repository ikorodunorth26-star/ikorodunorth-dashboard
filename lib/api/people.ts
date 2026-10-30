import { apiRequest } from "./client"
import type { ContentImage, ContentStatus } from "./content"

export type TeamGroup = "executive" | "council" | "management" | "nulge"

export type PersonRecord = {
  id: string
  slug: string
  team: TeamGroup
  name: string
  title: string
  bio: string
  email: string | null
  phone: string | null
  ward: string | null
  sortOrder: number
  isLead: boolean
  status: ContentStatus
  portrait: ContentImage | null
  createdAt: string
  updatedAt: string
}

export type PersonInput = {
  slug?: string
  team: TeamGroup
  name: string
  title: string
  bio?: string
  email?: string | null
  phone?: string | null
  ward?: string | null
  sortOrder?: number
  isLead?: boolean
  status: ContentStatus
  portraitImageId: string | null
  portraitImageAlt?: string
}

export const teamMeta: Record<
  TeamGroup,
  { label: string; shortLabel: string; description: string; publicPath: string }
> = {
  executive: {
    label: "Executive Council",
    shortLabel: "Executive",
    description:
      "Political leadership guiding policy and day-to-day executive coordination.",
    publicPath: "/government/executive-council",
  },
  council: {
    label: "Legislative House",
    shortLabel: "Council",
    description:
      "Councillors representing wards and providing legislative oversight.",
    publicPath: "/government/legislative-house",
  },
  management: {
    label: "Management Team",
    shortLabel: "Management",
    description:
      "Administrative officers running departments from the secretariat.",
    publicPath: "/government/management-team",
  },
  nulge: {
    label: "NULGE Exco",
    shortLabel: "NULGE",
    description:
      "Nigeria Union of Local Government Employees executives for Ikorodu North.",
    publicPath: "/government/nulge-exco",
  },
}

export function listPeople(team?: TeamGroup) {
  const query = team ? `?team=${team}` : ""
  return apiRequest<{ people: PersonRecord[] }>(`/v1/people${query}`)
}

export function getPerson(id: string) {
  return apiRequest<{ person: PersonRecord }>(`/v1/people/${id}`)
}

export function createPerson(input: PersonInput) {
  return apiRequest<{ person: PersonRecord }>("/v1/people", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updatePerson(id: string, input: PersonInput | Partial<PersonInput>) {
  return apiRequest<{ person: PersonRecord }>(`/v1/people/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function updatePersonStatus(id: string, status: ContentStatus) {
  return updatePerson(id, { status })
}

export function deletePerson(id: string) {
  return apiRequest<undefined>(`/v1/people/${id}`, { method: "DELETE" })
}
