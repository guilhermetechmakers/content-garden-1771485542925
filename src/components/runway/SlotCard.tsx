import { Calendar, CheckCircle, Circle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { RunwaySlot } from '@/types'
import { cn } from '@/lib/utils'

export const SLOT_DROP_TYPE = 'application/x-runway-slot-post'

interface SlotCardProps {
  slot: RunwaySlot
  isDropTarget?: boolean
  onSelect?: (slot: RunwaySlot) => void
  onSuggest?: (slotId: string) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent, slotId: string) => void
  selected?: boolean
}

export function SlotCard({
  slot,
  isDropTarget,
  onSelect,
  onSuggest,
  onDragOver,
  onDragLeave,
  onDrop,
  selected,
}: SlotCardProps) {
  const isEmpty = slot.status === 'empty'
  const isFilled = slot.status === 'filled'
  const isPosted = slot.status === 'posted'

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = isEmpty ? 'copy' : 'none'
    if (isEmpty) onDragOver?.(e)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!isEmpty) return
    onDrop?.(e, slot.id)
  }

  return (
    <Card
      className={cn(
        'border-border bg-card min-h-[180px] transition-all duration-200',
        isEmpty && 'border-dashed',
        isDropTarget && 'border-primary ring-2 ring-primary/30 bg-primary/5',
        selected && 'ring-2 ring-primary'
      )}
      onDragOver={handleDragOver}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
      onClick={() => onSelect?.(slot)}
      role="button"
      tabIndex={0}
      aria-label={`Slot ${new Date(slot.date).toLocaleDateString()} ${slot.status}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.(slot)
        }
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="font-medium text-foreground">
            {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <span className="text-caption text-muted-foreground">{slot.time}</span>
      </CardHeader>
      <CardContent className="pt-0">
        {isEmpty && (
          <div className="rounded-lg border-2 border-dashed border-border p-4 text-center text-caption text-muted-foreground">
            <p>Drop post here</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation()
                onSuggest?.(slot.id)
              }}
            >
              <Plus className="h-4 w-4 mr-1" aria-hidden />
              Suggest
            </Button>
          </div>
        )}
        {isFilled && (
          <div className="rounded-lg border border-border bg-input/30 p-3">
            <p className="text-sm line-clamp-2 text-foreground">Post preview copy… Hook and value here.</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-1" aria-hidden>
                {slot.checklist?.slice(0, 3).map((c) =>
                  c.done ? (
                    <CheckCircle key={c.id} className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle key={c.id} className="h-4 w-4 text-muted-foreground" />
                  )
                )}
              </div>
            </div>
          </div>
        )}
        {isPosted && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="text-sm line-clamp-2 text-foreground">Posted content preview…</p>
            <div className="mt-2 flex items-center gap-1 text-caption text-primary">
              <CheckCircle className="h-4 w-4" aria-hidden />
              Posted
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
