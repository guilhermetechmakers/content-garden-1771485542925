import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { History, Copy, RefreshCw, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SlotCard, SlotDetailPanel, PostedHistoryDialog, SLOT_DROP_TYPE } from '@/components/runway'
import {
  fetchRunwaySlots,
  fetchRunwayHistory,
  assignSlot,
  markSlotPosted,
  undoSlot,
} from '@/api/runway'
import { listDrops } from '@/api/drops'
import { trackRunwaySlot } from '@/lib/analytics'
import type { RunwaySlot } from '@/types'
import { cn } from '@/lib/utils'

const UNDO_WINDOW_MS = 60_000

export function RunwayPage() {
  const queryClient = useQueryClient()
  const [selectedSlot, setSelectedSlot] = useState<RunwaySlot | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [lastPostedAt, setLastPostedAt] = useState<Record<string, number>>({})

  const { data: slotsData, isLoading: slotsLoading, isRefetching: slotsRefetching } = useQuery({
    queryKey: ['runway', 'slots'],
    queryFn: () => fetchRunwaySlots(),
  })

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['runway', 'history'],
    queryFn: () => fetchRunwayHistory(20),
    enabled: historyOpen,
  })

  const { data: drops = [] } = useQuery({
    queryKey: ['drops'],
    queryFn: listDrops,
  })

  const assignMutation = useMutation({
    mutationFn: assignSlot,
    onSuccess: (_, variables) => {
      trackRunwaySlot({ action: 'slot_assigned', slotId: variables.slotId, postId: variables.postId ?? variables.dropPostId })
      queryClient.invalidateQueries({ queryKey: ['runway', 'slots'] })
      toast.success('Post assigned to slot')
    },
    onError: () => toast.error('Failed to assign'),
  })

  const markPostedMutation = useMutation({
    mutationFn: markSlotPosted,
    onSuccess: (data) => {
      trackRunwaySlot({ action: 'marked_posted', slotId: data.slotId })
      setLastPostedAt((prev) => ({ ...prev, [data.slotId]: Date.now() }))
      queryClient.invalidateQueries({ queryKey: ['runway', 'slots'] })
      queryClient.invalidateQueries({ queryKey: ['runway', 'history'] })
      toast.success('Marked as posted')
    },
    onError: () => toast.error('Failed to mark posted'),
  })

  const undoMutation = useMutation({
    mutationFn: undoSlot,
    onSuccess: (data) => {
      trackRunwaySlot({ action: 'undo', slotId: data.slotId })
      queryClient.invalidateQueries({ queryKey: ['runway', 'slots'] })
      toast.success('Undone')
    },
    onError: () => toast.error('Failed to undo'),
  })

  const canUndo = useCallback(
    (slotId: string) => {
      const t = lastPostedAt[slotId]
      return t != null && Date.now() - t < UNDO_WINDOW_MS
    },
    [lastPostedAt]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent, slotId: string) => {
      setDropTargetId(null)
      const postId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData(SLOT_DROP_TYPE)
      if (!postId) return
      assignMutation.mutate({ slotId, dropPostId: postId })
    },
    [assignMutation]
  )

  const handleMarkPosted = useCallback(
    (slotId: string) => {
      markPostedMutation.mutate(slotId)
    },
    [markPostedMutation]
  )

  const handleUndo = useCallback(
    (slotId: string) => {
      undoMutation.mutate(slotId)
    },
    [undoMutation]
  )

  const slots = slotsData?.slots ?? []
  const history = (historyData?.history ?? []) as RunwaySlot[]

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title font-bold text-foreground">Runway</h1>
          <p className="text-caption text-muted-foreground mt-1">
            Next 7 posts — drag from Drops or Library
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHistoryOpen(true)}
            aria-label="Open posted history"
          >
            <History className="h-4 w-4 mr-1" aria-hidden />
            History
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['runway', 'slots'] })}
            disabled={slotsRefetching}
            aria-label="Resync slots"
          >
            <RefreshCw className={cn('h-4 w-4 mr-1', slotsRefetching && 'animate-spin')} aria-hidden />
            Resync
          </Button>
          <Button variant="secondary" size="sm">
            <Copy className="h-4 w-4 mr-1" aria-hidden />
            Quick post
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Slots lane */}
        <div>
          {slotsLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Card key={i} className="min-h-[180px] border-border bg-card">
                  <CardContent className="p-4">
                    <div className="h-8 w-24 animate-pulse rounded bg-input" />
                    <div className="mt-4 h-20 animate-pulse rounded bg-input" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!slotsLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {slots.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  isDropTarget={dropTargetId === slot.id}
                  selected={selectedSlot?.id === slot.id}
                  onSelect={setSelectedSlot}
                  onDragOver={() => setDropTargetId(slot.id)}
                  onDragLeave={() => setDropTargetId(null)}
                  onDrop={handleDrop}
                  onSuggest={() => toast.info('Load suggestions from Drops')}
                />
              ))}
            </div>
          )}
        </div>

        {/* Slot detail panel */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          {selectedSlot ? (
            <SlotDetailPanel
              slot={selectedSlot}
              post={undefined}
              onMarkPosted={handleMarkPosted}
              onUndo={handleUndo}
              onCopy={() => toast.success('Copied to clipboard')}
              onDownloadAssets={() => toast.success('Download started')}
              canUndo={canUndo(selectedSlot.id)}
              undoWindowSeconds={UNDO_WINDOW_MS / 1000}
            />
          ) : (
            <Card className="border-border bg-card border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-caption text-muted-foreground">
                  Select a slot to see details, checklist, and Mark Posted.
                </p>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="py-4">
          <h3 className="text-section font-semibold text-foreground mb-2">Posts from Drops</h3>
          <p className="text-caption text-muted-foreground mb-3">
            Drag a post from your Drops into a slot above to schedule it.
          </p>
          <div className="flex flex-wrap gap-2">
            {drops.length === 0 && (
              <p className="text-caption text-muted-foreground">No drops yet.</p>
            )}
            {drops.flatMap((drop) =>
              drop.posts.map((post) => (
                <div
                  key={post.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(SLOT_DROP_TYPE, post.id)
                    e.dataTransfer.setData('text/plain', post.id)
                    e.dataTransfer.effectAllowed = 'copy'
                  }}
                  className="cursor-grab active:cursor-grabbing rounded-lg border border-border bg-input/50 px-3 py-2 text-sm text-foreground transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:border-electric/30 max-w-[240px]"
                  role="button"
                  tabIndex={0}
                  aria-label={`Drag post: ${post.hook || 'Untitled'} to slot`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') e.preventDefault()
                  }}
                >
                  <span className="line-clamp-2 font-medium">
                    {post.hook || post.value || 'Untitled post'}
                  </span>
                  <span className="text-caption text-muted-foreground block mt-0.5">
                    {drop.title}
                  </span>
                </div>
              ))
            )}
          </div>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <Link to="/drops">
              <Package className="h-4 w-4 mr-1" />
              Open Drops
            </Link>
          </Button>
        </CardContent>
      </Card>

      <PostedHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        history={history}
        isLoading={historyLoading}
        onCopy={() => toast.success('Copied')}
        onDownloadAssets={() => toast.success('Download started')}
      />
    </div>
  )
}
