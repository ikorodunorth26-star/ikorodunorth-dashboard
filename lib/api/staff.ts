import { apiRequest } from "./client"
import type { StaffRole, StaffUser } from "@/lib/auth"

export type StaffStatus = "ACTIVE" | "DISABLED"

export type StaffRecord = StaffUser & {
  status: StaffStatus
  lastLoginAt: string | null
  createdAt: string
}

export type CreateStaffInput = {
  firstName: string
  lastName: string
  email: string
  password: string
  role: StaffRole
}

export function listStaff() {
  return apiRequest<{ users: StaffRecord[] }>("/v1/auth/staff")
}

export function createStaff(input: CreateStaffInput) {
  return apiRequest<{ user: StaffRecord }>("/v1/auth/staff", {
    method: "POST",
    body: JSON.stringify(input),
  })
}
