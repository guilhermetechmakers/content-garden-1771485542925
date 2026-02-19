import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { seedRepository, type SeedType, type TriageStatus } from '../models/seed.js'
import { storageService } from '../services/storage.js'
import { checkUploadQuota, recordUpload } from '../middleware/quota.js'
import { transcriptionWorker } from '../workers/transcriptionWorker.js'

const router = Router()

const seedTypes: SeedType[] = [
  'link',
  'note',
  'voice',
  'screenshot',
  'image',
  'audio',
  'video',
]

const createSeedSchema = z.object({
  type: z.enum(seedTypes as [SeedType, ...SeedType[]]),
  title: z.string().min(1).max(500),
  content: z.string().max(50_000).optional().default(''),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
  extracted_bullets: z.array(z.string().max(500)).max(50).optional().default([]),
  source_url: z.string().url().max(2000).nullable().optional().default(null),
  attachments: z
    .array(
      z.object({
        key: z.string(),
        contentType: z.string(),
        sizeBytes: z.number().optional(),
        name: z.string().optional(),
      })
    )
    .max(10)
    .optional()
    .default([]),
})

const updateSeedSchema = createSeedSchema.partial().extend({
  triage_status: z.enum(['kept', 'ignored']).nullable().optional(),
})
const mergeSeedsSchema = z.object({
  seed_ids: z.array(z.string().min(1)).min(2).max(20),
  title: z.string().min(1).max(500).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  content: z.string().max(50_000).optional(),
  extracted_bullets: z.array(z.string().max(500)).max(100).optional(),
})

const bulkTriageSchema = z.object({
  seed_ids: z.array(z.string().min(1)).min(1).max(50),
  triage_status: z.enum(['kept', 'ignored']),
})

const getUploadUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
})

function getUserId(req: Request): string {
  const uid = (req as Request & { userId?: string }).userId ?? req.headers['x-user-id']
  if (typeof uid === 'string' && uid) return uid
  return 'anonymous'
}

/** POST /seeds/upload-url – get signed URL for upload (then create seed with attachment key) */
router.post('/upload-url', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const quota = checkUploadQuota(userId)
  if (!quota.allowed) {
    res.status(429).json({ message: quota.reason ?? 'Upload limit exceeded' })
    return
  }
  const parsed = getUploadUrlSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten() })
    return
  }
  const key = storageService.buildKey(userId, parsed.data.filename)
  storageService
    .getSignedUploadUrl(key, parsed.data.contentType)
    .then(({ uploadUrl, key: k }) => {
      recordUpload(userId)
      res.json({ uploadUrl, key: k })
    })
    .catch((err: unknown) => {
      res.status(500).json({
        message: err instanceof Error ? err.message : 'Failed to generate upload URL',
      })
    })
})

/** GET /seeds – list seeds for current user; ?clustered=true returns clusters */
router.get('/', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const limit = Math.min(Number(req.query.limit) || 100, 100)
  const clustered = req.query.clustered === 'true'
  const type = typeof req.query.type === 'string' ? req.query.type : undefined
  const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined
  const dateFrom = typeof req.query.dateFrom === 'string' ? req.query.dateFrom : undefined
  const dateTo = typeof req.query.dateTo === 'string' ? req.query.dateTo : undefined
  const options = { type, tag, dateFrom, dateTo }
  if (clustered) {
    const clusters = seedRepository.findClustersByUserId(userId, limit, options)
    res.json({ clusters })
  } else {
    const seeds = seedRepository.findByUserId(userId, limit, options)
    res.json({ seeds })
  }
})

/** GET /seeds/:id – get one seed */
router.get('/:id', (req: Request, res: Response) => {
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0] ?? ''
  const seed = seedRepository.findById(id)
  if (!seed) {
    res.status(404).json({ message: 'Seed not found' })
    return
  }
  const userId = getUserId(req)
  if (seed.user_id !== userId) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }
  res.json(seed)
})

/** POST /seeds – create seed */
router.post('/', (req: Request, res: Response) => {
  const parsed = createSeedSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten() })
    return
  }
  const userId = getUserId(req)
  const seed = seedRepository.create({
    user_id: userId,
    type: parsed.data.type,
    title: parsed.data.title,
    content: parsed.data.content,
    tags: parsed.data.tags,
    extracted_bullets: parsed.data.extracted_bullets,
    source_url: parsed.data.source_url,
    attachments: parsed.data.attachments,
  })

  if (parsed.data.type === 'link' && parsed.data.source_url) {
    transcriptionWorker.enqueue({
      seedId: seed.id,
      type: 'link_scrape',
      payload: { url: parsed.data.source_url },
    })
  } else if (parsed.data.type === 'voice' || parsed.data.type === 'audio' || parsed.data.type === 'video') {
    const attachmentKey = parsed.data.attachments?.[0]?.key
    transcriptionWorker.enqueue({
      seedId: seed.id,
      type: 'transcribe',
      payload: attachmentKey ? { attachmentKey } : undefined,
    })
  } else if (parsed.data.type === 'screenshot' || parsed.data.type === 'image') {
    const attachmentKey = parsed.data.attachments?.[0]?.key
    transcriptionWorker.enqueue({
      seedId: seed.id,
      type: 'ocr',
      payload: attachmentKey ? { attachmentKey } : undefined,
    })
  }

  res.status(201).json(seed)
})

/** POST /seeds/merge – merge multiple seeds into one (must be before POST /) */
router.post('/merge', (req: Request, res: Response) => {
  const parsed = mergeSeedsSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten() })
    return
  }
  const userId = getUserId(req)
  const first = seedRepository.findById(parsed.data.seed_ids[0]!)
  const title =
    parsed.data.title ?? first?.title ?? 'Merged seed'
  const newSeed = seedRepository.merge(userId, parsed.data.seed_ids, {
    title,
    tags: parsed.data.tags,
    content: parsed.data.content,
    extracted_bullets: parsed.data.extracted_bullets,
  })
  if (!newSeed) {
    res.status(400).json({ message: 'Could not merge seeds (not found or forbidden)' })
    return
  }
  res.status(201).json(newSeed)
})

/** POST /seeds/bulk-triage – set triage status for multiple seeds */
router.post('/bulk-triage', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const parsed = bulkTriageSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten() })
    return
  }
  const updated: NonNullable<ReturnType<typeof seedRepository.update>>[] = []
  for (const id of parsed.data.seed_ids) {
    const seed = seedRepository.findById(id)
    if (seed && seed.user_id === userId) {
      const u = seedRepository.update(seed.id, {
        triage_status: parsed.data.triage_status,
      })
      if (u) updated.push(u)
    }
  }
  res.json({ updated, count: updated.length })
})

/** PATCH /seeds/:id – update seed (including triage_status) */
router.patch('/:id', (req: Request, res: Response) => {
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0] ?? ''
  const seed = seedRepository.findById(id)
  if (!seed) {
    res.status(404).json({ message: 'Seed not found' })
    return
  }
  const userId = getUserId(req)
  if (seed.user_id !== userId) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }
  const parsed = updateSeedSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten() })
    return
  }
  const updated = seedRepository.update(seed.id, parsed.data)
  res.json(updated)
})

/** DELETE /seeds/:id */
router.delete('/:id', (req: Request, res: Response) => {
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0] ?? ''
  const seed = seedRepository.findById(id)
  if (!seed) {
    res.status(404).json({ message: 'Seed not found' })
    return
  }
  const userId = getUserId(req)
  if (seed.user_id !== userId) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }
  seedRepository.delete(seed.id)
  res.status(204).send()
})

export default router
