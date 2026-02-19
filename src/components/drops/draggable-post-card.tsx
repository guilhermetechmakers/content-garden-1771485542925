/**
 * Draggable post card for Runway drop target.
 * Supports drag to assign to Runway slot.
 */

import { useCallback } from 'react'
import { PostCard } from './post-card'
import { SLOT_DROP_TYPE } from '@/components/runway'
import type { DropPost } from '@/types'

export interface DraggablePostCardProps {
  post: DropPost
  dropId: string
  index: number
  onUpdate: (post: Partial<DropPost>) => void
  onDelete?: () => void
  validationErrors?: Partial<Record<keyof DropPost, string>>
}

export function DraggablePostCard({
  post,
  dropId,
  index,
  onUpdate,
  onDelete,
  validationErrors,
}: DraggablePostCardProps) {
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData(SLOT_DROP_TYPE, post.id)
      e.dataTransfer.setData('text/plain', post.id)
      e.dataTransfer.effectAllowed = 'copy'
      e.dataTransfer.setData('application/json', JSON.stringify({ dropId, postId: post.id, post }))
    },
    [dropId, post]
  )

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-[1.01]"
      role="button"
      tabIndex={0}
      aria-label={`Drag post ${index + 1} to Runway slot`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') e.preventDefault()
      }}
    >
      <PostCard
        post={post}
        index={index}
        onUpdate={onUpdate}
        onDelete={onDelete}
        isDraggable
        validationErrors={validationErrors}
      />
    </div>
  )
}
