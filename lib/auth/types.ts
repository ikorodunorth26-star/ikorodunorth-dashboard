export const staffRoles = [
  "SUPERADMIN",
  "ACCOUNTANT",
  "AUDITOR",
  "EDITOR",
  "DEVELOPER",
] as const

export type StaffRole = (typeof staffRoles)[number]

export type StaffUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: StaffRole
  status?: "ACTIVE" | "DISABLED"
  lastLoginAt?: string | null
  createdAt?: string
}

export type AuthSession = {
  accessToken: string
  expiresIn: number
  refreshToken: string
  user: StaffUser
}

export function staffRoleLabel(role: StaffRole): string {
  switch (role) {
    case "SUPERADMIN":
      return "Super admin"
    case "ACCOUNTANT":
      return "Accountant"
    case "AUDITOR":
      return "Auditor"
    case "EDITOR":
      return "Editor"
    case "DEVELOPER":
      return "Developer"
    default: {
      const exhaustive: never = role
      return exhaustive
    }
  }
}
