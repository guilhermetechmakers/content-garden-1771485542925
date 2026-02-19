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
  /** Processing status for async jobs (transcription, OCR, etc.) */
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
  /** Garden triage: null = active, kept = kept, ignored = hidden */
  triage_status?: TriageStatus
  /** If set, this seed was merged into another seed (provenance) */
  merged_into_id?: string | null
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
  triage_status?: TriageStatus
  merged_into_id?: string | null
}

/** Cluster for soft-clustered feed (heuristic: by first tag or type) */
export interface SeedCluster {
  id: string
  label: string
  seed_ids: string[]
  seeds?: Seed[]
  confidence?: number
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
      triage_status: null,
      merged_into_id: null,
    }
    store.set(seed.id, seed)
    return seed
  },

  findById(id: string): Seed | undefined {
    return store.get(id)
  },

  findByUserId(userId: string, limit = 100, options?: { type?: string; tag?: string; dateFrom?: string; dateTo?: string; triageStatus?: TriageStatus }): Seed[] {
    let list = Array.from(store.values())
      .filter((s) => s.user_id === userId)
      .filter((s) => !s.merged_into_id)
    if (options?.triageStatus !== undefined) {
      list = list.filter((s) => s.triage_status === options.triageStatus)
    } else {
      list = list.filter((s) => s.triage_status !== 'ignored')
    }
    if (options?.type) list = list.filter((s) => s.type === options.type)
    if (options?.tag) list = list.filter((s) => s.tags?.includes(options.tag!))
    if (options?.dateFrom) {
      const from = new Date(options.dateFrom).getTime()
      list = list.filter((s) => new Date(s.created_at).getTime() >= from)
    }
    if (options?.dateTo) {
      const to = new Date(options.dateTo).getTime()
      list = list.filter((s) => new Date(s.created_at).getTime() <= to)
    }
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return list.slice(0, limit)
  },

  /** Simple heuristic clustering: by first tag, else type, else "Other" */
  findClustersByUserId(userId: string, limit = 100, options?: { type?: string; tag?: string; dateFrom?: string; dateTo?: string }): SeedCluster[] {
    const seeds = this.findByUserId(userId, limit, { ...options, triageStatus: undefined })
    const byKey = new Map<string, Seed[]>()
    for (const s of seeds) {
      const key = s.tags?.[0] ?? s.type ?? 'other'
      if (!byKey.has(key)) byKey.set(key, [])
      byKey.get(key)!.push(s)
    }
    return Array.from(byKey.entries()).map(([label, seedsInCluster], i) => ({
      id: `cluster_${i}_${label}`,
      label: label === 'other' ? 'Other' : label,
      seed_ids: seedsInCluster.map((x) => x.id),
      seeds: seedsInCluster,
    }))
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

  /** Merge multiple seeds into one; originals get merged_into_id set. */
  merge(
    userId: string,
    seedIds: string[],
    merged: {
      title: string
      tags?: string[]
      content?: string
      extracted_bullets?: string[]
    }
  ): Seed | undefined {
    if (seedIds.length === 0) return undefined
    const originals = seedIds.map((id) => store.get(id)).filter(Boolean) as Seed[]
    if (originals.length === 0) return undefined
    if (originals.some((s) => s.user_id !== userId)) return undefined
    const combinedContent =
      merged.content ??
      originals.map((s) => `## ${s.title}\n${s.content}`).join('\n\n')
    const allBullets =
      merged.extracted_bullets ??
      originals.flatMap((s) => s.extracted_bullets ?? [])
    const allTags = Array.from(new Set(originals.flatMap((s) => s.tags ?? [])))
    const newSeed = this.create({
      user_id: userId,
      type: originals[0].type,
      title: merged.title,
      content: combinedContent,
      tags: merged.tags ?? allTags,
      extracted_bullets: allBullets,
      source_url: originals[0].source_url,
      attachments: originals.flatMap((s) => s.attachments ?? []).slice(0, 10),
    })
    for (const s of originals) {
      this.update(s.id, { merged_into_id: newSeed.id })
    }
    return newSeed
  },
}
