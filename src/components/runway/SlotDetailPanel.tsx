import { CheckCircle, Circle, Link2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { RunwaySlot, RunwaySlotPost } from '@/types'
import { cn } from '@/lib/utils'

interface SlotDetailPanelProps {
  slot: RunwaySlot
  post?: RunwaySlotPost | null
  onMarkPosted?: (slotId: string) => void
  onUndo?: (slotId: string) => void
  onCopy?: () => void
  onDownloadAssets?: () => void
  canUndo?: boolean
  undoWindowSeconds?: number
  className?: string
}

export function SlotDetailPanel({
  slot,
  post,
  onMarkPosted,
  onUndo,
  onCopy,
  onDownloadAssets,
  canUndo = false,
  undoWindowSeconds = 60,
  className,
}: SlotDetailPanelProps) {
  const isFilled = slot.status === 'filled'
  const isPosted = slot.status === 'posted'

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader className="pb-2">
        <h3 className="text-section font-semibold text-foreground">Slot detail</h3>
        <p className="text-caption text-muted-foreground">
          {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {slot.time}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Post preview */}
        {(post || isFilled || isPosted) && (
          <div className="rounded-lg border border-border bg-input/30 p-3">
            <p className="text-caption text-muted-foreground mb-1">Preview</p>
            <p className="text-sm text-foreground line-clamp-4">
              {post
                ? [post.hook, post.value, post.example, post.cta].filter(Boolean).join(' — ')
                : 'Post preview copy… Hook and value here.'}
            </p>
            {post?.platform && (
              <p className="mt-2 text-caption text-muted-foreground">Platform: {post.platform}</p>
            )}
          </div>
        )}

        {/* Asset links */}
        {post?.asset_urls && post.asset_urls.length > 0 && (
          <div>
            <p className="text-caption text-muted-foreground mb-2 flex items-center gap-1">
              <Link2 className="h-3.5 w-3.5" aria-hidden />
              Assets
            </p>
            <ul className="space-y-1 text-sm">
              {post.asset_urls.map((url, i) => (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate block max-w-full"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
            {onDownloadAssets && (
              <Button variant="ghost" size="sm" className="mt-2" onClick={onDownloadAssets}>
                Download assets
              </Button>
            )}
          </div>
        )}

        {/* Checklist: image, caption, hashtags */}
        {slot.checklist && slot.checklist.length > 0 && (
          <div>
            <p className="text-caption text-muted-foreground mb-2">Checklist</p>
            <ul className="space-y-2" role="list">
              {slot.checklist.map((item) => (
                <li key={item.id} className="flex items-center gap-2 text-sm">
                  {item.done ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <span className={cn(!item.done && 'text-muted-foreground')}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Post notes */}
        {slot.post_notes && (
          <div>
            <p className="text-caption text-muted-foreground mb-1 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" aria-hidden />
              Notes
            </p>
            <p className="text-sm text-foreground">{slot.post_notes}</p>
          </div>
        )}

        {isPosted && slot.posted_at && (
          <p className="text-caption text-primary flex items-center gap-1">
            <CheckCircle className="h-4 w-4" aria-hidden />
            Posted {new Date(slot.posted_at).toLocaleString()}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {isFilled && onMarkPosted && (
            <Button
              size="sm"
              onClick={() => onMarkPosted(slot.id)}
              className="transition-transform duration-200 hover:scale-[1.02]"
            >
              Mark Posted
            </Button>
          )}
          {isPosted && onUndo && canUndo && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUndo(slot.id)}
              aria-label={`Undo within ${undoWindowSeconds}s`}
            >
              Undo ({undoWindowSeconds}s)
            </Button>
          )}
          {onCopy && (
            <Button variant="outline" size="sm" onClick={onCopy}>
              Copy
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
