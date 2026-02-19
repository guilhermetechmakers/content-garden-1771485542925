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

/** Triage state for Garden: null = active, kept = kept, ignored = hidden from main feed */
export type TriageStatus = 'kept' | 'ignored' | null

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
  triage_status?: TriageStatus
  merged_into_id?: string | null
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
  triage_status?: TriageStatus
}

export interface ListSeedsParams {
  limit?: number
  clustered?: boolean
  type?: string
  tag?: string
  dateFrom?: string
  dateTo?: string
}

export interface MergeSeedsPayload {
  seed_ids: string[]
  title?: string
  tags?: string[]
  content?: string
  extracted_bullets?: string[]
}

export interface BulkTriagePayload {
  seed_ids: string[]
  triage_status: 'kept' | 'ignored'
}

export interface BulkTriageResponse {
  updated: Seed[]
  count: number
}

export interface UploadUrlResponse {
  uploadUrl: string
  key: string
}

const SEEDS_BASE = '/seeds'

/** Cluster for soft-clustered feed */
export interface SeedCluster {
  id: string
  label: string
  seed_ids: string[]
  seeds?: Seed[]
  confidence?: number
}

/** List seeds; use clustered: true to get clusters instead of flat list */
export async function listSeeds(
  params?: ListSeedsParams
): Promise<{ seeds: Seed[]; clusters?: SeedCluster[] }> {
  const search = new URLSearchParams()
  if (params?.limit != null) search.set('limit', String(params.limit))
  if (params?.clustered === true) search.set('clustered', 'true')
  if (params?.type) search.set('type', params.type)
  if (params?.tag) search.set('tag', params.tag)
  if (params?.dateFrom) search.set('dateFrom', params.dateFrom)
  if (params?.dateTo) search.set('dateTo', params.dateTo)
  const q = search.toString()
  return api.get<{ seeds: Seed[]; clusters?: SeedCluster[] }>(
    `${SEEDS_BASE}${q ? `?${q}` : ''}`
  )
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

/** Merge multiple seeds into one; originals are marked merged_into_id. */
export async function mergeSeeds(payload: MergeSeedsPayload): Promise<Seed> {
  return api.post<Seed>(`${SEEDS_BASE}/merge`, payload)
}

/** Update triage status (kept / ignored) for a seed. */
export async function updateSeedTriage(
  id: string,
  triage_status: TriageStatus
): Promise<Seed> {
  return api.patch<Seed>(`${SEEDS_BASE}/${id}`, { triage_status })
}

/** Set triage status for multiple seeds at once. */
export async function bulkTriage(
  payload: BulkTriagePayload
): Promise<BulkTriageResponse> {
  return api.post<BulkTriageResponse>(`${SEEDS_BASE}/bulk-triage`, payload)
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
