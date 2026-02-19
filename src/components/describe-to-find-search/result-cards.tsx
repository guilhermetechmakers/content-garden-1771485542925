import { Leaf, Layout, Package, FileText, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { SearchResultItem } from '@/types'
import { OpenInContext } from './open-in-context'
import { cn } from '@/lib/utils'

const TYPE_ICON = {
  seed: Leaf,
  canvas: Layout,
  drop: Package,
  snippet: FileText,
} as const

export interface ResultCardProps {
  item: SearchResultItem
  onOpenInContext?: (item: SearchResultItem, context: 'garden' | 'canvas') => void
  className?: string
}

export function ResultCard({ item, onOpenInContext, className }: ResultCardProps) {
  const Icon = TYPE_ICON[item.type] ?? FileText

  return (
    <Card
      className={cn(
        'border-border bg-card/80 transition-all duration-200 hover:shadow-card-hover hover:border-electric/30',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                <Icon className="h-4 w-4 text-primary" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{item.title}</p>
                {item.provenance && (
                  <p className="text-caption text-muted-foreground truncate" title={item.provenance}>
                    {item.provenance}
                  </p>
                )}
              </div>
            </div>

            {item.excerpt && (
              <p className="text-body text-muted-foreground line-clamp-2">
                {item.excerpt}
              </p>
            )}

            {item.matchedText && (
              <p className="text-caption rounded-md bg-electric/10 border border-electric/20 px-2 py-1 text-foreground">
                <span className="font-medium">Matched: </span>
                {item.matchedText}
              </p>
            )}

            {item.timecode != null && item.timecode !== '' && (
              <div className="flex items-center gap-1.5 text-caption text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>{item.timecode}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {item.confidence != null && (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    item.confidence >= 0.8
                      ? 'bg-primary/20 text-primary'
                      : item.confidence >= 0.5
                        ? 'bg-accent/20 text-accent'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {Math.round(item.confidence * 100)}% match
                </span>
              )}
              {item.created_at && (
                <span className="text-caption text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <OpenInContext
            item={item}
            onOpen={onOpenInContext}
            className="shrink-0"
          />
        </div>
      </CardContent>
    </Card>
  )
}
