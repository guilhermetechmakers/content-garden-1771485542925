import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import type { RunwaySlot } from '@/types'

interface PostedHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  history: Array<RunwaySlot & { postPreview?: string }>
  isLoading?: boolean
  onCopy?: (slotId: string) => void
  onDownloadAssets?: (slotId: string) => void
}

export function PostedHistoryDialog({
  open,
  onOpenChange,
  history,
  isLoading,
  onCopy,
  onDownloadAssets,
}: PostedHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="posted-history-desc">
        <DialogHeader>
          <DialogTitle>Posted history</DialogTitle>
          <DialogDescription id="posted-history-desc">
            Recently marked-as-posted slots. Quick actions: copy, download assets.
          </DialogDescription>
        </DialogHeader>
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-input" />
            ))}
          </div>
        )}
        {!isLoading && history.length === 0 && (
          <p className="text-caption text-muted-foreground py-4 text-center">
            No posted items yet. Mark a slot as posted to see it here.
          </p>
        )}
        {!isLoading && history.length > 0 && (
          <ScrollArea className="max-h-[60vh] pr-2">
            <ul className="space-y-3" role="list">
              {history.map((slot) => (
                <li
                  key={slot.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-input/30 p-3"
                >
                  <CheckCircle className="h-5 w-5 shrink-0 text-primary mt-0.5" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    {slot.posted_at && (
                      <p className="text-caption text-muted-foreground">
                        {new Date(slot.posted_at).toLocaleString()}
                      </p>
                    )}
                    {(slot as RunwaySlot & { postPreview?: string }).postPreview && (
                      <p className="text-caption text-foreground mt-1 line-clamp-2">
                        {(slot as RunwaySlot & { postPreview?: string }).postPreview}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {onCopy && (
                      <Button variant="ghost" size="sm" onClick={() => onCopy(slot.id)}>
                        Copy
                      </Button>
                    )}
                    {onDownloadAssets && (
                      <Button variant="ghost" size="sm" onClick={() => onDownloadAssets(slot.id)}>
                        Assets
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
