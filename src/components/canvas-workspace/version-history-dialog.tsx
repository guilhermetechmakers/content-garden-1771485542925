/**
 * Version history – list of canvas versions with restore option.
 */

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { getCanvasVersions } from '@/api/canvases'
import type { CanvasVersion } from '@/types'

export interface VersionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  canvasId: string | null
  onRestore?: (version: CanvasVersion) => void
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function VersionHistoryDialog({
  open,
  onOpenChange,
  canvasId,
  onRestore,
}: VersionHistoryDialogProps) {
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['canvas-versions', canvasId],
    queryFn: async () => {
      try {
        return await getCanvasVersions(canvasId ?? '')
      } catch {
        return []
      }
    },
    enabled: open && !!canvasId,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Version history</DialogTitle>
          <DialogDescription>
            Restore a previous version of your canvas. Current changes are saved before restore.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 max-h-[50vh]">
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          )}
          {!isLoading && versions.length === 0 && (
            <p className="text-caption text-muted-foreground py-4 text-center">
              No version history yet.
            </p>
          )}
          {!isLoading &&
            versions.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 mb-2"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">Version {v.version}</p>
                  <p className="text-caption text-muted-foreground">{formatDate(v.created_at)}</p>
                </div>
                {onRestore && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onRestore(v)
                      onOpenChange(false)
                    }}
                  >
                    Restore
                  </Button>
                )}
              </div>
            ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
