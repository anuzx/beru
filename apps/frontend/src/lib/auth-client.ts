import { createAuthClient } from "better-auth/react"

/** Backend origin: Render in production, localhost:3000 while developing. */
const baseURL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "")

export const authClient = createAuthClient({
  baseURL,
  basePath: "/api/v1/auth",
})

export const { signIn, signUp, signOut, useSession } = authClient