import type { AuthSession } from "@/lib/auth"

import { apiRequest } from "./client"

export function login(input: {
  email: string
  password: string
}): Promise<AuthSession> {
  return apiRequest<AuthSession>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: input.email.trim(),
      password: input.password,
    }),
  })
}

export function logout(refreshToken: string): Promise<void> {
  return apiRequest<void>("/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  })
}
