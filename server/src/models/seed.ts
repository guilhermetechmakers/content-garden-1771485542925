/**
 * Seed data model and repository interface.
 * Replace in-memory implementation with Supabase/Postgres + RLS when deploying.
 */

export type SeedType = 'link' | 'note' | 'voice' | 'screenshot' | 'image' | 'audio' | 'video'

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
  /** Processing status for async jobs (transcription, OCR, etc.) */
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface CreateSeedInput {
  user_id: string
  type: SeedType
  title: string
  content?: string
  tags?: string[]
  extracted_bullets?: string[]
  source_url?: string | null
  attachments?: SeedAttachment[]
  processing_status?: Seed['processing_status']
}

export interface UpdateSeedInput {
  title?: string
  content?: string
  tags?: string[]
  extracted_bullets?: string[]
  source_url?: string | null
  attachments?: SeedAttachment[]
  processing_status?: Seed['processing_status']
}

/** In-memory store; replace with DB client (e.g. Supabase) in production. */
const store = new Map<string, Seed>()

function generateId(): string {
  return `seed_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

export const seedRepository = {
  create(input: CreateSeedInput): Seed {
    const now = new Date().toISOString()
    const seed: Seed = {
      id: generateId(),
      user_id: input.user_id,
      type: input.type,
      title: input.title,
      content: input.content ?? '',
      tags: input.tags ?? [],
      extracted_bullets: input.extracted_bullets ?? [],
      source_url: input.source_url ?? null,
      attachments: input.attachments ?? [],
      created_at: now,
      updated_at: now,
      processing_status: input.processing_status ?? 'pending',
    }
    store.set(seed.id, seed)
    return seed
  },

  findById(id: string): Seed | undefined {
    return store.get(id)
  },

  findByUserId(userId: string, limit = 100): Seed[] {
    return Array.from(store.values())
      .filter((s) => s.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  },

  update(id: string, input: UpdateSeedInput): Seed | undefined {
    const existing = store.get(id)
    if (!existing) return undefined
    const updated: Seed = {
      ...existing,
      ...input,
      updated_at: new Date().toISOString(),
    }
    store.set(id, updated)
    return updated
  },

  delete(id: string): boolean {
    return store.delete(id)
  },

  countByUserId(userId: string): number {
    return Array.from(store.values()).filter((s) => s.user_id === userId).length
  },
}
