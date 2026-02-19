import { api } from '@/lib/api'
import type { Drop, DropPost } from '@/types'

const DROPS_BASE = '/drops'

export interface CreateDropPayload {
  title: string
  canvas_id?: string | null
  canvas_source?: string | null
  posts?: Partial<DropPost>[]
}

export interface UpdateDropPayload {
  title?: string
  status?: Drop['status']
  posts?: Partial<DropPost>[]
}

export interface ListDropsResponse {
  drops: Drop[]
}

export function listDrops(): Promise<Drop[]> {
  return api.get<ListDropsResponse | Drop[]>(DROPS_BASE).then((res) => {
    return Array.isArray(res) ? res : (res as ListDropsResponse).drops ?? []
  })
}

export function getDrop(id: string): Promise<Drop> {
  return api.get<Drop>(`${DROPS_BASE}/${id}`)
}

export function createDrop(payload: CreateDropPayload): Promise<Drop> {
  return api.post<Drop>(DROPS_BASE, payload)
}

export function createDropFromCanvas(canvasId: string, title?: string): Promise<Drop> {
  return api.post<Drop>(`${DROPS_BASE}/from-canvas`, { canvas_id: canvasId, title })
}

export function updateDrop(id: string, payload: UpdateDropPayload): Promise<Drop> {
  return api.patch<Drop>(`${DROPS_BASE}/${id}`, payload)
}

export function deleteDrop(id: string): Promise<void> {
  return api.delete(`${DROPS_BASE}/${id}`)
}

export function exportDropToRunway(dropId: string): Promise<{ ok: boolean; message?: string }> {
  return api.post<{ ok: boolean; message?: string }>(`${DROPS_BASE}/${dropId}/export-runway`)
}

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export function exportDropCsv(dropId: string): Promise<Blob> {
  return fetch(`${API_BASE}${DROPS_BASE}/${dropId}/export-csv`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') ?? '' : ''}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error('Export failed')
    return res.blob()
  })
}

export function exportDropJson(dropId: string): Promise<Drop> {
  return getDrop(dropId)
}
