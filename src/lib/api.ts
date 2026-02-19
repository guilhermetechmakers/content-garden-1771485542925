import { supabase } from '@/lib/supabase'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export type ApiError = {
  message: string
  code?: string
  status?: number
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      await supabase.auth.signOut()
      window.location.href = '/login'
    }
    const err: ApiError = {
      message: res.statusText,
      status: res.status,
    }
    try {
      const body = await res.json()
      if (body?.message) err.message = body.message
      if (body?.code) err.code = body.code
    } catch {
      // ignore
    }
    throw err
  }
  const contentType = res.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return res.json() as Promise<T>
  }
  return undefined as T
}

async function getHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (typeof window !== 'undefined') {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export const api = {
  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const headers = await getHeaders()
    return fetch(`${API_BASE}${path}`, {
      ...options,
      method: 'GET',
      headers,
    }).then(handleResponse<T>)
  },

  async post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const headers = await getHeaders()
    return fetch(`${API_BASE}${path}`, {
      ...options,
      method: 'POST',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then(handleResponse<T>)
  },

  async put<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const headers = await getHeaders()
    return fetch(`${API_BASE}${path}`, {
      ...options,
      method: 'PUT',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then(handleResponse<T>)
  },

  async patch<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const headers = await getHeaders()
    return fetch(`${API_BASE}${path}`, {
      ...options,
      method: 'PATCH',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then(handleResponse<T>)
  },

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    const headers = await getHeaders()
    return fetch(`${API_BASE}${path}`, {
      ...options,
      method: 'DELETE',
      headers,
    }).then(handleResponse<T>)
  },
}

/** Describe-to-Find Search API (backend: Supabase Edge Function or REST) */
import type { DescribeToFindSearchFilters, DescribeToFindSearchResponse } from '@/types'

export async function describeToFindSearch(
  query: string,
  filters?: DescribeToFindSearchFilters
): Promise<DescribeToFindSearchResponse> {
  const params = new URLSearchParams({ q: query })
  if (filters?.type) params.set('type', filters.type)
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.set('dateTo', filters.dateTo)
  if (filters?.confidenceMin != null) params.set('confidenceMin', String(filters.confidenceMin))
  return api.get<DescribeToFindSearchResponse>(`/describe-to-find-search?${params.toString()}`)
}
