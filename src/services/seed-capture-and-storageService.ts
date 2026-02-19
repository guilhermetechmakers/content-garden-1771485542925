/**
 * Seed Capture & Storage service – business logic for creating, listing, and triaging Seeds.
 * Delegates to API layer; use this for consistent error handling and typing.
 */

import {
  listSeeds,
  createSeed,
  getSeed,
  updateSeed,
  updateSeedTriage,
  deleteSeed,
  mergeSeeds,
  getUploadSignedUrl,
  uploadFileToSignedUrl,
  type Seed,
  type SeedCluster,
  type SeedType,
  type CreateSeedPayload,
  type UpdateSeedPayload,
  type ListSeedsParams,
  type MergeSeedsPayload,
  type TriageStatus,
} from '@/api/seeds'

export type { Seed, SeedCluster, SeedType, CreateSeedPayload, UpdateSeedPayload, TriageStatus }

export const seedCaptureAndStorageService = {
  /** List seeds; use clustered: true for Garden feed */
  list(params?: ListSeedsParams) {
    return listSeeds(params)
  },

  /** Get a single seed by id */
  get(id: string) {
    return getSeed(id)
  },

  /** Create a new seed (link, note, voice, screenshot, etc.) */
  create(payload: CreateSeedPayload) {
    return createSeed(payload)
  },

  /** Update seed fields (title, content, tags, triage_status, etc.) */
  update(id: string, payload: UpdateSeedPayload) {
    return updateSeed(id, payload)
  },

  /** Set triage status (kept / ignored) for Garden */
  setTriage(id: string, triage_status: TriageStatus) {
    return updateSeedTriage(id, triage_status)
  },

  /** Permanently delete a seed */
  delete(id: string) {
    return deleteSeed(id)
  },

  /** Merge multiple seeds into one; originals are marked as merged */
  merge(payload: MergeSeedsPayload) {
    return mergeSeeds(payload)
  },

  /** Get a signed URL for uploading a file (voice, screenshot, etc.) */
  getUploadUrl(filename: string, contentType: string) {
    return getUploadSignedUrl(filename, contentType)
  },

  /** Upload file to the signed URL (call after getUploadUrl) */
  uploadToSignedUrl(uploadUrl: string, file: File | Blob, contentType: string) {
    return uploadFileToSignedUrl(uploadUrl, file, contentType)
  },
}
