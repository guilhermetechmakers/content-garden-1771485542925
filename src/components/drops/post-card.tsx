/**
 * Post card with Hook → Value → Example → CTA fields.
 * Editable inline with validation feedback.
 */

import { useCallback } from 'react'
import { GripVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { DropPost } from '@/types'

export interface PostCardProps {
  post: DropPost
  index: number
  onUpdate: (post: Partial<DropPost>) => void
  onDelete?: () => void
  isDraggable?: boolean
  validationErrors?: Partial<Record<keyof DropPost, string>>
}

export function PostCard({
  post,
  index,
  onUpdate,
  onDelete,
  isDraggable = true,
  validationErrors = {},
}: PostCardProps) {
  const handleChange = useCallback(
    (field: keyof DropPost) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onUpdate({ [field]: e.target.value })
    },
    [onUpdate]
  )

  return (
    <div
      className={cn(
        'group rounded-card-lg border bg-card p-4 shadow-card transition-all duration-200',
        'hover:shadow-card-hover hover:border-electric/30',
        Object.keys(validationErrors).length > 0 && 'border-destructive/50'
      )}
    >
      <div className="flex items-start gap-2">
        {isDraggable && (
          <div
            className="mt-2 cursor-grab text-muted-foreground opacity-60 hover:opacity-100"
            aria-hidden
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}
        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-caption font-medium text-muted-foreground">Post {index + 1}</span>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onDelete}
                aria-label="Delete post"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>

          <div>
            <label className="text-caption text-muted-foreground mb-1 block">Hook</label>
            <Input
              placeholder="Attention-grabbing opener"
              value={post.hook}
              onChange={handleChange('hook')}
              className={cn(
                'text-sm transition-colors',
                validationErrors.hook && 'border-destructive focus-visible:ring-destructive'
              )}
            />
            {validationErrors.hook && (
              <p className="text-caption text-destructive mt-1">{validationErrors.hook}</p>
            )}
          </div>

          <div>
            <label className="text-caption text-muted-foreground mb-1 block">Value</label>
            <Textarea
              placeholder="Core value or insight"
              value={post.value}
              onChange={handleChange('value')}
              rows={2}
              className={cn(
                'text-sm min-h-[60px]',
                validationErrors.value && 'border-destructive focus-visible:ring-destructive'
              )}
            />
            {validationErrors.value && (
              <p className="text-caption text-destructive mt-1">{validationErrors.value}</p>
            )}
          </div>

          <div>
            <label className="text-caption text-muted-foreground mb-1 block">Example</label>
            <Textarea
              placeholder="Concrete example or story"
              value={post.example}
              onChange={handleChange('example')}
              rows={2}
              className="text-sm min-h-[60px]"
            />
          </div>

          <div>
            <label className="text-caption text-muted-foreground mb-1 block">CTA</label>
            <Input
              placeholder="Call to action"
              value={post.cta}
              onChange={handleChange('cta')}
              className={cn(
                'text-sm',
                validationErrors.cta && 'border-destructive focus-visible:ring-destructive'
              )}
            />
            {validationErrors.cta && (
              <p className="text-caption text-destructive mt-1">{validationErrors.cta}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
