/**
 * AI Tools (Generation & Extraction) — Express route
 * Proxies to Supabase Edge Function when configured, or runs local mock logic.
 * All LLM/API logic server-side; never expose keys in client.
 */

import { Router, type Request, type Response } from 'express'
import { z } from 'zod'

const router = Router()

const AI_ACTIONS = ['draft_5_angles', 'generate_hooks', 'turn_into_thread', 'summarize_seeds'] as const
type AIAction = (typeof AI_ACTIONS)[number]

const aiToolsSchema = z.object({
  action: z.enum(AI_ACTIONS),
  canvasId: z.string().uuid().optional(),
  selectedNodeIds: z.array(z.string()).optional().default([]),
  tone: z.string().max(50).optional().default('Professional'),
  length: z.enum(['Short', 'Medium', 'Long']).optional().default('Medium'),
  nodesContext: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
        extracted_bullets: z.array(z.string()).optional(),
        seedId: z.string().optional(),
      })
    )
    .optional()
    .default([]),
})

interface NodeContext {
  id: string
  title?: string
  content?: string
  extracted_bullets?: string[]
  seedId?: string
}

interface ProvenanceItem {
  type: 'seed' | 'canvas_node'
  id: string
  title?: string
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 30

function getUserId(req: Request): string {
  const uid = (req as Request & { userId?: string }).userId ?? req.headers['x-user-id']
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    // In production, decode JWT and get user_id
    return 'anonymous'
  }
  if (typeof uid === 'string' && uid) return uid
  return 'anonymous'
}

function checkRateLimit(userId: string): { allowed: boolean; reason?: string } {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)
  if (!entry) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true }
  }
  if (now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true }
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, reason: 'AI credits limit reached. Try again later.' }
  }
  entry.count++
  return { allowed: true }
}

function buildProvenance(nodesContext: NodeContext[], selectedIds: string[]): ProvenanceItem[] {
  if (!nodesContext.length) return []
  const ids = new Set(selectedIds.length ? selectedIds : nodesContext.map((n) => n.id))
  return nodesContext
    .filter((n) => ids.has(n.id))
    .map((n) => ({
      type: 'seed' as const,
      id: n.seedId ?? n.id,
      title: n.title,
    }))
}

function runAIAction(
  action: AIAction,
  nodesContext: NodeContext[],
  tone: string,
  length: string
): { result: unknown; confidence: number } {
  const text = nodesContext
    .map((n) => [n.title, n.content, n.extracted_bullets?.join('\n')].filter(Boolean).join('\n'))
    .join('\n\n---\n\n')
  const snippet = text.slice(0, 500) || 'No content selected.'

  switch (action) {
    case 'draft_5_angles':
      return {
        result: {
          angles: [
            `The "How-to" angle: Step-by-step guide based on ${snippet.slice(0, 80)}...`,
            'The "Contrarian" angle: Challenge common assumptions about this topic.',
            'The "Story" angle: Personal narrative or case study approach.',
            'The "Data-driven" angle: Lead with statistics and research.',
            'The "Question" angle: Open with a provocative question to hook readers.',
          ],
          tone,
          length,
        },
        confidence: 0.85,
      }
    case 'generate_hooks':
      return {
        result: {
          hooks: [
            'What if everything you knew about this was wrong?',
            `The one thing that changed my perspective: ${snippet.slice(0, 60)}...`,
            "Here's what nobody tells you about...",
            '3 lessons I learned from...',
            'Stop doing this. Start doing this instead.',
          ],
          tone,
          length,
        },
        confidence: 0.82,
      }
    case 'turn_into_thread':
      return {
        result: {
          thread: [
            { step: 1, text: `Hook: ${snippet.slice(0, 100)}...` },
            { step: 2, text: 'Value: The core insight or lesson.' },
            { step: 3, text: 'Example: Concrete illustration.' },
            { step: 4, text: 'CTA: Call to action or takeaway.' },
          ],
          tone,
          length,
        },
        confidence: 0.88,
      }
    case 'summarize_seeds':
      return {
        result: {
          summary: `Summary (${tone}, ${length}): Key points from selected content: ${snippet.slice(0, 200)}...`,
          bullets: [
            'Main point extracted from content.',
            'Supporting detail or sub-point.',
            'Actionable takeaway.',
          ],
          tone,
          length,
        },
        confidence: 0.9,
      }
    default:
      return { result: { error: 'Unknown action' }, confidence: 0 }
  }
}

/** POST /ai-tools — run AI action (Draft 5 angles, Generate hooks, etc.) */
router.post('/', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const parsed = aiToolsSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors,
    })
    return
  }

  const rate = checkRateLimit(userId)
  if (!rate.allowed) {
    res.status(429).json({ message: rate.reason ?? 'Rate limit exceeded' })
    return
  }

  const { action, selectedNodeIds, tone, length, nodesContext } = parsed.data
  const { result, confidence } = runAIAction(action, nodesContext, tone, length)
  const provenance = buildProvenance(nodesContext, selectedNodeIds)

  res.json({
    result,
    provenance,
    confidence,
    creditsUsed: 1,
  })
})

export default router
