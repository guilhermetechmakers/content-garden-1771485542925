/**
 * Right: AI panel – tone/length, actions (Draft 5 angles, etc.), result display with provenance.
 * Publish/Export to Drop at bottom.
 */

import { useState, useCallback } from 'react'
import { Sparkles, Download, Loader2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  invokeAIAction,
  toAIActionType,
  buildNodesContext,
} from '@/api/ai-tools'
import type { AIActionResponse, AIActionResult } from '@/types'
import type { CanvasNode } from '@/types'

const AI_ACTIONS = [
  'Draft 5 angles',
  'Generate hooks',
  'Turn selection into thread',
  'Summarize selected Seeds',
] as const

const TONE_OPTIONS = ['Professional', 'Casual', 'Friendly', 'Urgent'] as const
const LENGTH_OPTIONS = ['Short', 'Medium', 'Long'] as const

export interface AIPanelProps {
  /** If true, AI actions are enabled and will call the API */
  aiAvailable?: boolean
  onAction?: (action: string) => void
  isActionLoading?: boolean
  /** Canvas ID for Publish/Export to Drop */
  canvasId?: string | null
  onPublishToDrop?: () => void
  isPublishLoading?: boolean
  /** Selected node IDs for AI context (used when invoking actions) */
  selectedNodeIds?: string[]
  /** All canvas nodes for context (used when no selection = use all) */
  nodes?: CanvasNode[]
  /** Tone for AI generation */
  tone?: string
  /** Length for AI generation */
  length?: string
  /** Callback when tone/length changes (for controlled mode) */
  onToneChange?: (tone: string) => void
  onLengthChange?: (length: string) => void
}

function formatResult(result: AIActionResult): string {
  if ('error' in result && result.error) return result.error
  if ('angles' in result) return result.angles.join('\n\n')
  if ('hooks' in result) return result.hooks.join('\n\n')
  if ('thread' in result) return result.thread.map((t) => `${t.step}. ${t.text}`).join('\n\n')
  if ('summary' in result) return result.summary + '\n\n' + result.bullets.join('\n')
  return JSON.stringify(result)
}

function ResultDisplay({
  response,
  onCopy,
}: {
  response: AIActionResponse
  onCopy: (text: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [copied, setCopied] = useState(false)
  const text = formatResult(response.result)

  const handleCopy = useCallback(() => {
    onCopy(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text, onCopy])

  return (
    <div className="rounded-lg border border-border bg-input/30 overflow-hidden animate-fade-in">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-input/50 transition-colors"
        aria-expanded={expanded}
      >
        <span>Result</span>
        <span className="flex items-center gap-2 text-caption text-muted-foreground">
          {Math.round(response.confidence * 100)}% confidence
          {response.provenance.length > 0 && (
            <span className="text-xs">· {response.provenance.length} sources</span>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden />
          )}
        </span>
      </button>
      {expanded && (
        <div className="border-t border-border px-3 py-2">
          <pre className="whitespace-pre-wrap text-caption text-foreground font-sans max-h-48 overflow-y-auto">
            {text}
          </pre>
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-caption"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            {response.provenance.length > 0 && (
              <p className="text-caption text-muted-foreground">
                Provenance: {response.provenance.map((p) => p.title || p.id).join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function AIPanel({
  aiAvailable = true,
  onAction,
  isActionLoading: externalLoading = false,
  canvasId,
  onPublishToDrop,
  isPublishLoading = false,
  selectedNodeIds = [],
  nodes = [],
  tone: controlledTone,
  length: controlledLength,
  onToneChange,
  onLengthChange,
}: AIPanelProps) {
  const [tone, setToneState] = useState<string>(TONE_OPTIONS[0])
  const [length, setLengthState] = useState<string>(LENGTH_OPTIONS[1])
  const [internalLoading, setInternalLoading] = useState(false)
  const [lastResult, setLastResult] = useState<AIActionResponse | null>(null)

  const toneValue = controlledTone ?? tone
  const lengthValue = controlledLength ?? length
  const isActionLoading = externalLoading || internalLoading

  const setTone = useCallback(
    (t: string) => {
      setToneState(t)
      onToneChange?.(t)
    },
    [onToneChange]
  )
  const setLength = useCallback(
    (l: string) => {
      setLengthState(l)
      onLengthChange?.(l)
    },
    [onLengthChange]
  )

  const handleAction = useCallback(
    async (action: string) => {
      if (onAction) {
        onAction(action)
        return
      }
      if (!aiAvailable) {
        toast.info('AI tools are not fully available yet. This will be enabled soon.')
        return
      }

      const actionType = toAIActionType(action)
      if (!actionType) {
        toast.error('Unknown AI action')
        return
      }

      const nodesContext = buildNodesContext(nodes, selectedNodeIds)
      if (nodesContext.length === 0) {
        toast.info('Select or add nodes to the canvas first for AI to ground its output.')
        return
      }

      setInternalLoading(true)
      setLastResult(null)
      try {
        const response = await invokeAIAction({
          action: actionType,
          canvasId: canvasId ?? undefined,
          selectedNodeIds: selectedNodeIds.length ? selectedNodeIds : nodes.map((n) => n.id),
          tone: toneValue,
          length: lengthValue,
          nodesContext,
        })
        setLastResult(response)
        toast.success('AI generated successfully')
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'AI action failed'
        toast.error(message)
      } finally {
        setInternalLoading(false)
      }
    },
    [
      aiAvailable,
      onAction,
      nodes,
      selectedNodeIds,
      canvasId,
      toneValue,
      lengthValue,
    ]
  )

  const handleCopyResult = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success('Copied to clipboard'),
      () => toast.error('Failed to copy')
    )
  }, [])

  return (
    <aside
      className="flex w-72 shrink-0 flex-col border-l border-border bg-card animate-fade-in"
      aria-label="AI panel"
    >
      <div className="flex items-center gap-2 border-b border-border p-3">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden />
        <span className="font-medium text-sm text-foreground">AI</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          <div>
            <p className="text-caption text-muted-foreground mb-2">Tone & length</p>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((t) => (
                <Button
                  key={t}
                  variant={toneValue === t ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'transition-all duration-200',
                    toneValue === t ? 'shadow-glow-electric' : 'hover:scale-[1.02]'
                  )}
                  onClick={() => setTone(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {LENGTH_OPTIONS.map((l) => (
                <Button
                  key={l}
                  variant={lengthValue === l ? 'secondary' : 'outline'}
                  size="sm"
                  className="transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => setLength(l)}
                >
                  {l}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-caption text-muted-foreground mb-2">Actions</p>
            <div className="space-y-1">
              {AI_ACTIONS.map((action) => (
                <Button
                  key={action}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start transition-all duration-200 hover:scale-[1.02] hover:shadow-card"
                  onClick={() => handleAction(action)}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
                  ) : null}
                  {action}
                </Button>
              ))}
            </div>
          </div>

          {lastResult && (
            <ResultDisplay response={lastResult} onCopy={handleCopyResult} />
          )}

          {!aiAvailable && (
            <div className="rounded-lg border border-border bg-input/50 px-3 py-2">
              <p className="text-caption text-muted-foreground">
                AI tools will appear here when configured. You can still compose with seeds and
                export to a Drop.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="mt-auto border-t border-border p-3">
        {onPublishToDrop && canvasId ? (
          <Button
            className="w-full transition-all duration-200 hover:scale-[1.02]"
            onClick={onPublishToDrop}
            disabled={isPublishLoading}
          >
            {isPublishLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
            ) : (
              <Download className="h-4 w-4 mr-2" aria-hidden />
            )}
            Publish / Export to Drop
          </Button>
        ) : (
          <Button asChild className="w-full transition-all duration-200 hover:scale-[1.02]">
            <a href="/drops" className="flex items-center justify-center">
              <Download className="h-4 w-4 mr-2" aria-hidden />
              Publish / Export to Drop
            </a>
          </Button>
        )}
      </div>
    </aside>
  )
}
