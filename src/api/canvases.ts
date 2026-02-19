import { api } from '@/lib/api'
import type { Canvas, CanvasNode, CanvasEdge, CanvasVersion } from '@/types'

const CANVASES_BASE = '/canvases'

export interface CreateCanvasPayload {
  title: string
  nodes?: CanvasNode[]
  edges?: CanvasEdge[]
  metadata?: Record<string, unknown>
}

export interface UpdateCanvasPayload {
  title?: string
  nodes?: CanvasNode[]
  edges?: CanvasEdge[]
  metadata?: Record<string, unknown>
}

export interface ListCanvasesResponse {
  canvases: Canvas[]
}

export async function listCanvases(): Promise<Canvas[]> {
  const res = await api.get<ListCanvasesResponse | Canvas[]>(CANVASES_BASE)
  return Array.isArray(res) ? res : res.canvases
}

export async function getCanvas(id: string): Promise<Canvas> {
  return api.get<Canvas>(`${CANVASES_BASE}/${id}`)
}

export async function createCanvas(payload: CreateCanvasPayload): Promise<Canvas> {
  return api.post<Canvas>(CANVASES_BASE, payload)
}

export async function updateCanvas(
  id: string,
  payload: UpdateCanvasPayload
): Promise<Canvas> {
  return api.patch<Canvas>(`${CANVASES_BASE}/${id}`, payload)
}

export async function deleteCanvas(id: string): Promise<void> {
  return api.delete(`${CANVASES_BASE}/${id}`)
}

export async function getCanvasVersions(canvasId: string): Promise<CanvasVersion[]> {
  const res = await api.get<{ versions: CanvasVersion[] } | CanvasVersion[]>(
    `${CANVASES_BASE}/${canvasId}/versions`
  )
  const versions = Array.isArray(res) ? res : res.versions
  return versions ?? []
}

export async function proposeRelatedSeeds(
  canvasId: string,
  seedIds?: string[]
): Promise<{ seeds: { id: string; title: string; relevance?: number }[] }> {
  return api.post<{ seeds: { id: string; title: string; relevance?: number }[] }>(
    `${CANVASES_BASE}/${canvasId}/propose-related`,
    { seed_ids: seedIds ?? [] }
  )
}
