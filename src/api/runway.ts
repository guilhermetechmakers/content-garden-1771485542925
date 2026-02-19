import { api } from '@/lib/api'
import type { RunwaySlot } from '@/types'

export interface RunwaySlotsResponse {
  slots: RunwaySlot[]
}

export interface RunwayHistoryResponse {
  history: unknown[]
}

export function fetchRunwaySlots(): Promise<RunwaySlotsResponse> {
  return api.get<RunwaySlotsResponse>('/runway/slots')
}

export function fetchRunwaySlot(id: string): Promise<RunwaySlot> {
  return api.get<RunwaySlot>(`/runway/slots/${id}`)
}

export interface AssignSlotBody {
  slotId: string
  postId?: string
  dropPostId?: string
}

export function assignSlot(body: AssignSlotBody): Promise<{ ok: boolean; slotId: string }> {
  return api.post<{ ok: boolean; slotId: string }>('/runway/slots/assign', body)
}

export function unassignSlot(slotId: string): Promise<{ ok: boolean; slotId: string }> {
  return api.post<{ ok: boolean; slotId: string }>('/runway/slots/unassign', { slotId })
}

export function markSlotPosted(slotId: string): Promise<{ ok: boolean; slotId: string; posted_at: string }> {
  return api.post<{ ok: boolean; slotId: string; posted_at: string }>('/runway/slots/mark-posted', { slotId })
}

export function undoSlot(slotId: string): Promise<{ ok: boolean; slotId: string }> {
  return api.post<{ ok: boolean; slotId: string }>('/runway/slots/undo', { slotId })
}

export function fetchRunwayHistory(limit?: number): Promise<RunwayHistoryResponse> {
  const params = limit != null ? `?limit=${limit}` : ''
  return api.get<RunwayHistoryResponse>(`/runway/history${params}`)
}
