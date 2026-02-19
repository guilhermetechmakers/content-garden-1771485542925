// AI Tools (Generation & Extraction) — Supabase Edge Function
// Transcription/extraction, grounded content generation tied to Seeds and Canvas.
// Client calls via supabase.functions.invoke('ai-tools', { body: { action, ... } })
// All LLM/API logic server-side; never expose keys in client.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type AIAction =
  | 'draft_5_angles'
  | 'generate_hooks'
  | 'turn_into_thread'
  | 'summarize_seeds'

interface NodeContext {
  id: string
  title?: string
  content?: string
  extracted_bullets?: string[]
  seedId?: string
}

interface AIRequestBody {
  action: AIAction
  canvasId?: string
  selectedNodeIds?: string[]
  tone?: string
  length?: string
  nodesContext?: NodeContext[]
}

interface ProvenanceItem {
  type: 'seed' | 'canvas_node'
  id: string
  title?: string
}

interface AIActionResponse {
  result: unknown
  provenance: ProvenanceItem[]
  confidence: number
  creditsUsed?: number
}

// In-memory rate limit (per user) — replace with Redis/DB in production
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 30

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

function buildProvenance(nodesContext?: NodeContext[], selectedIds?: string[]): ProvenanceItem[] {
  if (!nodesContext?.length) return []
  const ids = new Set(selectedIds ?? nodesContext.map((n) => n.id))
  return nodesContext
    .filter((n) => ids.has(n.id))
    .map((n) => ({
      type: 'seed' as const,
      id: n.seedId ?? n.id,
      title: n.title,
    }))
}

// Mock LLM responses — replace with real LLM provider (OpenAI, Anthropic, etc.) when configured
async function runAIAction(
  action: AIAction,
  nodesContext: NodeContext[],
  tone: string,
  length: string
): Promise<{ result: unknown; confidence: number }> {
  const text = nodesContext
    .map((n) => [n.title, n.content, n.extracted_bullets?.join('\n')].filter(Boolean).join('\n'))
    .join('\n\n---\n\n')
  const snippet = text.slice(0, 500) || 'No content selected.'

  switch (action) {
    case 'draft_5_angles': {
      const angles = [
        `The "How-to" angle: Step-by-step guide based on ${snippet.slice(0, 80)}...`,
        `The "Contrarian" angle: Challenge common assumptions about this topic.`,
        `The "Story" angle: Personal narrative or case study approach.`,
        `The "Data-driven" angle: Lead with statistics and research.`,
        `The "Question" angle: Open with a provocative question to hook readers.`,
      ]
      return {
        result: { angles, tone, length },
        confidence: 0.85,
      }
    }
    case 'generate_hooks': {
      const hooks = [
        `What if everything you knew about this was wrong?`,
        `The one thing that changed my perspective: ${snippet.slice(0, 60)}...`,
        `Here's what nobody tells you about...`,
        `3 lessons I learned from...`,
        `Stop doing this. Start doing this instead.`,
      ]
      return {
        result: { hooks, tone, length },
        confidence: 0.82,
      }
    }
    case 'turn_into_thread': {
      const thread = [
        { step: 1, text: `Hook: ${snippet.slice(0, 100)}...` },
        { step: 2, text: 'Value: The core insight or lesson.' },
        { step: 3, text: 'Example: Concrete illustration.' },
        { step: 4, text: 'CTA: Call to action or takeaway.' },
      ]
      return {
        result: { thread, tone, length },
        confidence: 0.88,
      }
    }
    case 'summarize_seeds': {
      const summary = `Summary (${tone}, ${length}): Key points from selected content: ${snippet.slice(0, 200)}...`
      const bullets = [
        'Main point extracted from content.',
        'Supporting detail or sub-point.',
        'Actionable takeaway.',
      ]
      return {
        result: { summary, bullets, tone, length },
        confidence: 0.9,
      }
    }
    default:
      return { result: { error: 'Unknown action' }, confidence: 0 }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = (await req.json().catch(() => ({}))) as AIRequestBody
    const { action, canvasId, selectedNodeIds, tone = 'Professional', length = 'Medium', nodesContext = [] } = body

    if (!action || !['draft_5_angles', 'generate_hooks', 'turn_into_thread', 'summarize_seeds'].includes(action)) {
      return new Response(
        JSON.stringify({ message: 'Valid action is required: draft_5_angles, generate_hooks, turn_into_thread, summarize_seeds' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TODO: Verify JWT and get user_id
    const userId = 'anonymous'
    const rate = checkRateLimit(userId)
    if (!rate.allowed) {
      return new Response(
        JSON.stringify({ message: rate.reason ?? 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { result, confidence } = await runAIAction(
      action as AIAction,
      nodesContext,
      tone,
      length
    )

    const provenance = buildProvenance(nodesContext, selectedNodeIds)
    const response: AIActionResponse = {
      result,
      provenance,
      confidence,
      creditsUsed: 1,
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(
      JSON.stringify({ message: e instanceof Error ? e.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
