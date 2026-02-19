import { Router, type Request, type Response } from 'express'

const router = Router()

function getUserId(req: Request): string {
  const uid = (req as Request & { userId?: string }).userId ?? req.headers['x-user-id']
  if (typeof uid === 'string' && uid) return uid
  return 'anonymous'
}

/** Build next 7 days slots (mock; replace with DB) */
function buildNext7Slots(userId: string) {
  const slots = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    slots.push({
      id: `slot-${i}`,
      user_id: userId,
      date: d.toISOString().slice(0, 10),
      time: '09:00',
      status: i === 0 ? 'filled' : i === 1 ? 'posted' : 'empty',
      post_id: i === 0 ? 'p1' : null,
      drop_post_id: null,
      checklist: i === 0 ? [{ id: 'c1', label: 'Image', done: true }, { id: 'c2', label: 'Caption', done: true }, { id: 'c3', label: 'Hashtags', done: false }] : [],
      post_notes: null,
      posted_at: i === 1 ? new Date(Date.now() - 864e5).toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }
  return slots
}

/** GET /runway/slots – list next 7 slots */
router.get('/slots', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const slots = buildNext7Slots(userId)
  res.json({ slots })
})

/** GET /runway/slots/:id – get one slot */
router.get('/slots/:id', (req: Request, res: Response) => {
  const id = (req.params as { id?: string }).id ?? ''
  const userId = getUserId(req)
  const slots = buildNext7Slots(userId)
  const slot = slots.find((s) => s.id === id)
  if (!slot) {
    res.status(404).json({ message: 'Slot not found' })
    return
  }
  res.json(slot)
})

/** POST /runway/slots/assign – assign post to slot */
router.post('/slots/assign', (req: Request, res: Response) => {
  const { slotId, postId, dropPostId } = req.body as { slotId?: string; postId?: string; dropPostId?: string }
  if (!slotId || (!postId && !dropPostId)) {
    res.status(400).json({ message: 'slotId and (postId or dropPostId) required' })
    return
  }
  res.json({ ok: true, slotId, postId: postId ?? dropPostId })
})

/** POST /runway/slots/unassign */
router.post('/slots/unassign', (req: Request, res: Response) => {
  const { slotId } = req.body as { slotId?: string }
  if (!slotId) {
    res.status(400).json({ message: 'slotId required' })
    return
  }
  res.json({ ok: true, slotId })
})

/** POST /runway/slots/mark-posted */
router.post('/slots/mark-posted', (req: Request, res: Response) => {
  const { slotId } = req.body as { slotId?: string }
  if (!slotId) {
    res.status(400).json({ message: 'slotId required' })
    return
  }
  res.json({ ok: true, slotId, posted_at: new Date().toISOString() })
})

/** POST /runway/slots/undo */
router.post('/slots/undo', (req: Request, res: Response) => {
  const { slotId } = req.body as { slotId?: string }
  if (!slotId) {
    res.status(400).json({ message: 'slotId required' })
    return
  }
  res.json({ ok: true, slotId })
})

/** GET /runway/history – posted history */
router.get('/history', (req: Request, res: Response) => {
  const limit = Math.min(Number((req.query as { limit?: string }).limit) || 20, 50)
  res.json({ history: [] })
})

export default router
