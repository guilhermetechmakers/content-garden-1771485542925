/**
 * Right: AI panel – tone/length, actions (Draft 5 angles, etc.), graceful fallback if AI not available.
 * Publish/Export to Drop at bottom.
 */

import { useState, useCallback } from 'react'
import { Sparkles, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const AI_ACTIONS = [
  'Draft 5 angles',
  'Generate hooks',
  'Turn selection into thread',
  'Summarize selected Seeds',
] as const

const TONE_OPTIONS = ['Professional', 'Casual', 'Friendly', 'Urgent'] as const
const LENGTH_OPTIONS = ['Short', 'Medium', 'Long'] as const

export interface AIPanelProps {
  /** If true, show "AI tools coming soon" fallback instead of running actions */
  aiAvailable?: boolean
  onAction?: (action: string) => void
  isActionLoading?: boolean
  /** Canvas ID for Publish/Export to Drop */
  canvasId?: string | null
  onPublishToDrop?: () => void
  isPublishLoading?: boolean
}

export function AIPanel({
  aiAvailable = false,
  onAction,
  isActionLoading = false,
  canvasId,
  onPublishToDrop,
  isPublishLoading = false,
}: AIPanelProps) {
  const [tone, setTone] = useState<string>(TONE_OPTIONS[0])
  const [length, setLength] = useState<string>(LENGTH_OPTIONS[1])

  const handleAction = useCallback(
    (action: string) => {
      if (aiAvailable && onAction) {
        onAction(action)
      } else {
        toast.info('AI tools are not fully available yet. This will be enabled soon.')
      }
    },
    [aiAvailable, onAction]
  )

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
                  variant={tone === t ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'transition-all duration-200',
                    tone === t ? 'shadow-glow-electric' : 'hover:scale-[1.02]'
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
                  variant={length === l ? 'secondary' : 'outline'}
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
