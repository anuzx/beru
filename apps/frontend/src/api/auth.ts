/**
 * Frontend API client for auth.
 *
 * All requests are plain `fetch` calls to the backend (`/api/v1/...`).
 * The JWT returned by signin/signup is persisted in localStorage and sent as
 * an `Authorization: Bearer <token>` header on protected requests.
 */
export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "")

/** GitHub App pages. The install URL is where un-installed users get sent. */
export const GITHUB_APP_INSTALL_URL =
  "https://github.com/apps/cloudagentbyme/installations/new"
/*
 * Configure the GitHub App's "Setup URL" to `<frontend origin>/chat` so GitHub
 * sends the browser back to /chat?installation_id=... after an install.
 */

const TOKEN_KEY = "beru.token"

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY)
}

export class ApiRequestError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiRequestError"
    this.status = status
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  /** Send the stored JWT as a Bearer token. */
  auth?: boolean
}

interface ApiEnvelope<T> {
  success: boolean
  data?: T
  message?: string
}

/** Thin fetch wrapper: unwraps `{ success, data, message }` and throws on failure. */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false } = options
  const headers: Record<string, string> = {}

  if (body !== undefined) headers["Content-Type"] = "application/json"

  if (auth) {
    const token = getToken()
    if (!token) throw new ApiRequestError("You need to sign in first", 401)
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiRequestError("Could not reach the server", 0)
  }

  let payload: ApiEnvelope<T> | null = null
  try {
    payload = (await response.json()) as ApiEnvelope<T>
  } catch {
    payload = null
  }

  if (!response.ok || !payload?.success) {
    if (response.status === 401) clearToken()
    throw new ApiRequestError(payload?.message ?? "Something went wrong", response.status)
  }

  return payload.data as T
}

export interface AuthUser {
  id: string
  email: string
  username: string
  installationId: string | null
}

export interface AuthResult {
  token: string
  /** True when the user's GitHub App installation is already on file. */
  hasInstallation: boolean
  user: AuthUser
}

export function signIn(input: { email: string; password: string }) {
  return apiFetch<AuthResult>("/api/v1/auth/signin", { method: "POST", body: input })
}

export function signUp(input: { email: string; username: string; password: string }) {
  return apiFetch<AuthResult>("/api/v1/auth/signup", { method: "POST", body: input })
}

export function fetchMe() {
  return apiFetch<{ hasInstallation: boolean; user: AuthUser }>("/api/v1/auth/me", { auth: true })
}

/** Stores the GitHub App installation id for the signed-in user. */
export function saveInstallation(installationId: string) {
  return apiFetch<{ installationId: string }>("/api/v1/github/install", {
    method: "POST",
    body: { installationId },
    auth: true,
  })
}

export function signOut() {
  clearToken()
}