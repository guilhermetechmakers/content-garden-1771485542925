import { Merge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface BulkActionsToolbarProps {
  selectedCount: number
  onMerge: () => void
  onBulkKeep: () => void
  onBulkIgnore: () => void
  className?: string
}

export function BulkActionsToolbar({
  selectedCount,
  onMerge,
  onBulkKeep,
  onBulkIgnore,
  className,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 animate-fade-in',
        className
      )}
    >
      <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
      <Button
        size="sm"
        variant="secondary"
        onClick={onMerge}
        className="transition-all duration-200 hover:scale-[1.02]"
      >
        <Merge className="h-4 w-4 mr-1" /> Merge
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onBulkKeep}
        className="hover:bg-primary/15 hover:text-primary"
      >
        Keep
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-destructive hover:bg-destructive/15 hover:text-destructive"
        onClick={onBulkIgnore}
      >
        Ignore
      </Button>
    </div>
  )
}
