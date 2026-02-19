import { api } from '@/lib/api'
import type {
  AIActionRequest,
  AIActionResponse,
  AIActionType,
  AINodeContext,
} from '@/types'

const AI_TOOLS_BASE = '/ai-tools'

const ACTION_MAP: Record<string, AIActionType> = {
  'Draft 5 angles': 'draft_5_angles',
  'Generate hooks': 'generate_hooks',
  'Turn selection into thread': 'turn_into_thread',
  'Summarize selected Seeds': 'summarize_seeds',
}

export function toAIActionType(displayName: string): AIActionType | null {
  return ACTION_MAP[displayName] ?? null
}

export async function invokeAIAction(
  payload: AIActionRequest
): Promise<AIActionResponse> {
  return api.post<AIActionResponse>(AI_TOOLS_BASE, payload)
}

export function buildNodesContext(
  nodes: { id: string; data?: Record<string, unknown> }[],
  selectedIds: string[]
): AINodeContext[] {
  const ids = selectedIds.length ? new Set(selectedIds) : new Set(nodes.map((n) => n.id))
  return nodes
    .filter((n) => ids.has(n.id))
    .map((n) => ({
      id: n.id,
      title: n.data?.title as string | undefined,
      content: n.data?.content as string | undefined,
      extracted_bullets: n.data?.extracted_bullets as string[] | undefined,
      seedId: n.data?.seedId as string | undefined,
    }))
}
