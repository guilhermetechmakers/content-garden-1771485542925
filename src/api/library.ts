import { api } from '@/lib/api'
import type { LibraryPublishedItem } from '@/types'

export interface LibraryPublishedResponse {
  items: LibraryPublishedItem[]
}

export interface LibraryPublishedFilters {
  platform?: string
  tag?: string
  dateFrom?: string
  dateTo?: string
  query?: string
  asset?: string
}

export function fetchLibraryPublished(filters?: LibraryPublishedFilters): Promise<LibraryPublishedResponse> {
  const params = new URLSearchParams()
  if (filters?.platform) params.set('platform', filters.platform)
  if (filters?.tag) params.set('tag', filters.tag)
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.set('dateTo', filters.dateTo)
  if (filters?.query) params.set('query', filters.query)
  if (filters?.asset) params.set('asset', filters.asset)
  const q = params.toString()
  return api.get<LibraryPublishedResponse>(`/library/published${q ? `?${q}` : ''}`)
}

export interface LibraryAssetsResponse {
  assets: unknown[]
}

export function fetchLibraryAssets(): Promise<LibraryAssetsResponse> {
  return api.get<LibraryAssetsResponse>('/library/assets')
}
