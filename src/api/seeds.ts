import { api, type ApiError } from '@/lib/api'

export type SeedType =
  | 'link'
  | 'note'
  | 'voice'
  | 'screenshot'
  | 'image'
  | 'audio'
  | 'video'

export interface SeedAttachment {
  key: string
  url?: string
  contentType: string
  sizeBytes?: number
  name?: string
}

export interface Seed {
  id: string
  user_id: string
  type: SeedType
  title: string
  content: string
  tags: string[]
  extracted_bullets: string[]
  source_url: string | null
  attachments: SeedAttachment[]
  created_at: string
  updated_at?: string
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface CreateSeedPayload {
  type: SeedType
  title: string
  content?: string
  tags?: string[]
  extracted_bullets?: string[]
  source_url?: string | null
  attachments?: SeedAttachment[]
}

export interface UpdateSeedPayload {
  title?: string
  content?: string
  tags?: string[]
  extracted_bullets?: string[]
  source_url?: string | null
  attachments?: SeedAttachment[]
}

export interface UploadUrlResponse {
  uploadUrl: string
  key: string
}

const SEEDS_BASE = '/seeds'

export async function listSeeds(limit?: number): Promise<{ seeds: Seed[] }> {
  const params = limit != null ? `?limit=${limit}` : ''
  return api.get<{ seeds: Seed[] }>(`${SEEDS_BASE}${params}`)
}

export async function getSeed(id: string): Promise<Seed> {
  return api.get<Seed>(`${SEEDS_BASE}/${id}`)
}

export async function createSeed(payload: CreateSeedPayload): Promise<Seed> {
  return api.post<Seed>(SEEDS_BASE, payload)
}

export async function updateSeed(id: string, payload: UpdateSeedPayload): Promise<Seed> {
  return api.patch<Seed>(`${SEEDS_BASE}/${id}`, payload)
}

export async function deleteSeed(id: string): Promise<void> {
  return api.delete(`${SEEDS_BASE}/${id}`)
}

export async function getUploadSignedUrl(
  filename: string,
  contentType: string
): Promise<UploadUrlResponse> {
  return api.post<UploadUrlResponse>(`${SEEDS_BASE}/upload-url`, {
    filename,
    contentType,
  })
}

/**
 * Upload a file to a pre-signed URL (PUT). Use after getUploadSignedUrl.
 */
export async function uploadFileToSignedUrl(
  uploadUrl: string,
  file: File | Blob,
  contentType: string
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
  })
  if (!res.ok) {
    const err: ApiError = {
      message: res.statusText,
      status: res.status,
    }
    try {
      const body = await res.json()
      if (body?.message) err.message = body.message
    } catch {
      // ignore
    }
    throw err
  }
}
