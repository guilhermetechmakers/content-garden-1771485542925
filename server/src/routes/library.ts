import { Router, type Request, type Response } from 'express'

const router = Router()

function getUserId(req: Request): string {
  const uid = (req as Request & { userId?: string }).userId ?? req.headers['x-user-id']
  if (typeof uid === 'string' && uid) return uid
  return 'anonymous'
}

const mockPublished: Array<{
  id: string
  library_id: string | null
  user_id: string
  title: string
  platform: string
  published_at: string
  thumbnail_url: string | null
  asset_type: string
  performance_metrics: Record<string, number>
  tags: string[]
  created_at: string
  updated_at: string
}> = [
  {
    id: '1',
    library_id: null,
    user_id: 'anonymous',
    title: 'LinkedIn post',
    platform: 'LinkedIn',
    published_at: '2025-02-15T12:00:00Z',
    thumbnail_url: null,
    asset_type: 'image',
    performance_metrics: { impressions: 1200, likes: 45, comments: 8 },
    tags: ['b2b', 'thought-leadership'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    library_id: null,
    user_id: 'anonymous',
    title: 'X thread',
    platform: 'X',
    published_at: '2025-02-14T09:00:00Z',
    thumbnail_url: null,
    asset_type: 'text',
    performance_metrics: { impressions: 3400, likes: 120 },
    tags: ['launch'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

/** GET /library/published – list published items (with optional filters) */
router.get('/published', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const platform = typeof (req.query as { platform?: string }).platform === 'string' ? (req.query as { platform?: string }).platform : undefined
  const tag = typeof (req.query as { tag?: string }).tag === 'string' ? (req.query as { tag?: string }).tag : undefined
  const dateFrom = typeof (req.query as { dateFrom?: string }).dateFrom === 'string' ? (req.query as { dateFrom?: string }).dateFrom : undefined
  const dateTo = typeof (req.query as { dateTo?: string }).dateTo === 'string' ? (req.query as { dateTo?: string }).dateTo : undefined
  let items = mockPublished.filter((p) => p.user_id === userId)
  if (platform) items = items.filter((p) => p.platform === platform)
  if (tag) items = items.filter((p) => p.tags.includes(tag))
  if (dateFrom) items = items.filter((p) => p.published_at >= dateFrom)
  if (dateTo) items = items.filter((p) => p.published_at <= dateTo)
  res.json({ items })
})

/** GET /library/assets */
router.get('/assets', (req: Request, res: Response) => {
  res.json({ assets: [] })
})

export default router
