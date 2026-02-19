import { Router, type Request, type Response } from 'express'
import { z } from 'zod'

const router = Router()

function getUserId(req: Request): string {
  const uid = (req as Request & { userId?: string }).userId ?? req.headers['x-user-id']
  if (typeof uid === 'string' && uid) return uid
  return 'anonymous'
}

type DropStatus = 'draft' | 'ready' | 'exported'

interface DropPost {
  id: string
  hook: string
  value: string
  example: string
  cta: string
  variants?: Record<string, string>
  asset_urls?: string[]
  seed_ids?: string[]
}

interface Drop {
  id: string
  user_id: string
  title: string
  canvas_id: string | null
  canvas_source: string | null
  status: DropStatus
  posts: DropPost[]
  created_at: string
  updated_at: string
}

const store = new Map<string, Drop>()
let idCounter = 1
let postIdCounter = 1

function generateId(): string {
  return `drop-${idCounter++}-${Date.now()}`
}
function generatePostId(): string {
  return `post-${postIdCounter++}-${Date.now()}`
}

const createDropSchema = z.object({
  title: z.string().min(1).max(500),
  canvas_id: z.string().uuid().nullable().optional().default(null),
  canvas_source: z.string().max(500).nullable().optional().default(null),
  posts: z
    .array(
      z.object({
        hook: z.string().max(2000).optional().default(''),
        value: z.string().max(5000).optional().default(''),
        example: z.string().max(5000).optional().default(''),
        cta: z.string().max(1000).optional().default(''),
        variants: z.record(z.string()).optional().default({}),
        asset_urls: z.array(z.string()).optional().default([]),
        seed_ids: z.array(z.string()).optional().default([]),
      })
    )
    .min(0)
    .max(20)
    .optional()
    .default([]),
})

const updateDropSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  status: z.enum(['draft', 'ready', 'exported']).optional(),
  posts: z
    .array(
      z.object({
        id: z.string().optional(),
        hook: z.string().max(2000).optional(),
        value: z.string().max(5000).optional(),
        example: z.string().max(5000).optional(),
        cta: z.string().max(1000).optional(),
        variants: z.record(z.string()).optional(),
        asset_urls: z.array(z.string()).optional(),
        seed_ids: z.array(z.string()).optional(),
      })
    )
    .max(20)
    .optional(),
})

const fromCanvasSchema = z.object({
  canvas_id: z.string().min(1),
  title: z.string().max(500).optional(),
})

/** GET /drops – list drops for user */
router.get('/', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const drops = Array.from(store.values())

  const filtered = drops.filter((d) => d.user_id === userId)
  res.json({ drops: filtered })
})

/** GET /drops/:id – get one drop */
router.get('/:id', (req: Request, res: Response) => {
  const id = (req.params as { id?: string }).id ?? ''
  const drop = store.get(id)
  if (!drop) {
    res.status(404).json({ message: 'Drop not found' })
    return
  }
  const userId = getUserId(req)
  if (drop.user_id !== userId) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }
  res.json(drop)
})

/** POST /drops – create drop */
router.post('/', (req: Request, res: Response) => {
  const parsed = createDropSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten() })
    return
  }
  const userId = getUserId(req)
  const now = new Date().toISOString()

  const posts: DropPost[] = (parsed.data.posts ?? []).map((p, i) => ({
    id: generatePostId(),
    hook: p.hook ?? '',
    value: p.value ?? '',
    example: p.example ?? '',
    cta: p.cta ?? '',
    variants: p.variants ?? {},
    asset_urls: p.asset_urls ?? [],
    seed_ids: p.seed_ids ?? [],
  }))

  const drop: Drop = {
    id: generateId(),
    user_id: userId,
    title: parsed.data.title,
    canvas_id: parsed.data.canvas_id ?? null,
    canvas_source: parsed.data.canvas_source ?? null,
    status: 'draft',
    posts,
    created_at: now,
    updated_at: now,
  }
  store.set(drop.id, drop)
  res.status(201).json(drop)
})

/** POST /drops/from-canvas – create drop from canvas */
router.post('/from-canvas', (req: Request, res: Response) => {
  const parsed = fromCanvasSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten() })
    return
  }
  const userId = getUserId(req)
  const now = new Date().toISOString()

  const posts: DropPost[] = Array.from({ length: 5 }, (_, i) => ({
    id: generatePostId(),
    hook: '',
    value: '',
    example: '',
    cta: '',
    variants: {},
    asset_urls: [],
    seed_ids: [],
  }))

  const drop: Drop = {
    id: generateId(),
    user_id: userId,
    title: parsed.data.title ?? `Drop from Canvas ${parsed.data.canvas_id.slice(0, 8)}`,
    canvas_id: parsed.data.canvas_id,
    canvas_source: null,
    status: 'draft',
    posts,
    created_at: now,
    updated_at: now,
  }
  store.set(drop.id, drop)
  res.status(201).json(drop)
})

/** PATCH /drops/:id – update drop */
router.patch('/:id', (req: Request, res: Response) => {
  const id = (req.params as { id?: string }).id ?? ''
  const drop = store.get(id)
  if (!drop) {
    res.status(404).json({ message: 'Drop not found' })
    return
  }
  const userId = getUserId(req)
  if (drop.user_id !== userId) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }
  const parsed = updateDropSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', errors: parsed.error.flatten() })
    return
  }
  const now = new Date().toISOString()

  if (parsed.data.title != null) drop.title = parsed.data.title
  if (parsed.data.status != null) drop.status = parsed.data.status as DropStatus
  if (parsed.data.posts != null) {
    drop.posts = parsed.data.posts.map((p, i) => {
      const existing = drop.posts[i]
      return {
        id: existing?.id ?? p.id ?? generatePostId(),
        hook: p.hook ?? existing?.hook ?? '',
        value: p.value ?? existing?.value ?? '',
        example: p.example ?? existing?.example ?? '',
        cta: p.cta ?? existing?.cta ?? '',
        variants: p.variants ?? existing?.variants ?? {},
        asset_urls: p.asset_urls ?? existing?.asset_urls ?? [],
        seed_ids: p.seed_ids ?? existing?.seed_ids ?? [],
      }
    })
  }
  drop.updated_at = now
  store.set(drop.id, drop)
  res.json(drop)
})

/** DELETE /drops/:id */
router.delete('/:id', (req: Request, res: Response) => {
  const id = (req.params as { id?: string }).id ?? ''
  const drop = store.get(id)
  if (!drop) {
    res.status(404).json({ message: 'Drop not found' })
    return
  }
  const userId = getUserId(req)
  if (drop.user_id !== userId) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }
  store.delete(id)
  res.status(204).send()
})

/** POST /drops/:id/export-runway – mark for Runway export */
router.post('/:id/export-runway', (req: Request, res: Response) => {
  const id = (req.params as { id?: string }).id ?? ''
  const drop = store.get(id)
  if (!drop) {
    res.status(404).json({ message: 'Drop not found' })
    return
  }
  const userId = getUserId(req)
  if (drop.user_id !== userId) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }
  drop.status = 'exported'
  drop.updated_at = new Date().toISOString()
  store.set(drop.id, drop)
  res.json({ ok: true, message: 'Drop ready for Runway' })
})

/** GET /drops/:id/export-csv – export as CSV */
router.get('/:id/export-csv', (req: Request, res: Response) => {
  const id = (req.params as { id?: string }).id ?? ''
  const drop = store.get(id)
  if (!drop) {
    res.status(404).json({ message: 'Drop not found' })
    return
  }
  const userId = getUserId(req)
  if (drop.user_id !== userId) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }
  const header = 'Hook,Value,Example,CTA\n'
  const rows = drop.posts.map((p) => {
    const escape = (s: string) => `"${String(s).replace(/"/g, '""')}"`
    return [p.hook, p.value, p.example, p.cta].map(escape).join(',')
  })
  const csv = header + rows.join('\n')
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename="drop-${id}.csv"`)
  res.send(csv)
})

export default router
