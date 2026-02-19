import { Leaf, Layout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SearchResultItem } from '@/types'
import { cn } from '@/lib/utils'

export interface OpenInContextProps {
  item: SearchResultItem
  onOpen?: (item: SearchResultItem, context: 'garden' | 'canvas') => void
  className?: string
}

export function OpenInContext({ item, onOpen, className }: OpenInContextProps) {
  const canOpenInGarden = item.type === 'seed'
  const canOpenInCanvas =
    item.type === 'canvas' || item.type === 'drop' || item.type === 'snippet'

  if (!onOpen || (!canOpenInGarden && !canOpenInCanvas)) return null

  return (
    <div
      className={cn('flex flex-col gap-1.5', className)}
      role="group"
      aria-label="Open in context"
    >
      {canOpenInGarden && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpen?.(item, 'garden')}
          className="h-8 gap-1.5 rounded-lg border-border hover:border-electric/50 hover:bg-primary/10 transition-all duration-200 hover:scale-[1.02]"
          aria-label={`Open seed in Garden: ${item.title}`}
        >
          <Leaf className="h-3.5 w-3.5" aria-hidden />
          Garden
        </Button>
      )}
      {canOpenInCanvas && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpen?.(item, 'canvas')}
          className="h-8 gap-1.5 rounded-lg border-border hover:border-electric/50 hover:bg-primary/10 transition-all duration-200 hover:scale-[1.02]"
          aria-label={`Open in Canvas: ${item.title}`}
        >
          <Layout className="h-3.5 w-3.5" aria-hidden />
          Canvas
        </Button>
      )}
    </div>
  )
}
