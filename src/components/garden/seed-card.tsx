import { useRef, useEffect, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  ExternalLink,
  Link2,
  Mic,
  Image,
  FileText,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Seed, SeedType } from '@/api/seeds'

const SEED_TYPE_LABELS: Record<SeedType, string> = {
  link: 'Link',
  note: 'Note',
  voice: 'Voice',
  screenshot: 'Screenshot',
  image: 'Image',
  audio: 'Audio',
  video: 'Video',
}

const SEED_TYPE_ICONS: Record<SeedType, React.ComponentType<{ className?: string }>> = {
  link: Link2,
  note: FileText,
  voice: Mic,
  screenshot: Image,
  image: Image,
  audio: Mic,
  video: Image,
}

export function formatCaptureTime(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  } catch {
    return ''
  }
}

const SWIPE_THRESHOLD = 60

export interface SeedCardProps {
  seed: Seed
  triageMode: boolean
  selected: boolean
  onToggleSelect: (id: string) => void
  onKeep: (id: string) => void
  onIgnore: (id: string) => void
  onMergeClick: (id: string) => void
}

export function SeedCard({
  seed,
  triageMode,
  selected,
  onToggleSelect,
  onKeep,
  onIgnore,
  onMergeClick,
}: SeedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const snippet =
    seed.content?.slice(0, 120)?.trim() ||
    seed.extracted_bullets?.[0] ||
    (seed.source_url ? 'Link captured' : '—')
  const TypeIcon = SEED_TYPE_ICONS[seed.type] ?? FileText

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!triageMode) return
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    },
    [triageMode]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!triageMode || !touchStartRef.current) return
      const dx = e.touches[0].clientX - touchStartRef.current.x
      setSwipeOffset(Math.max(-120, Math.min(120, dx)))
    },
    [triageMode]
  )

  const handleTouchEnd = useCallback(() => {
    if (!triageMode) return
    if (swipeOffset > SWIPE_THRESHOLD) {
      onKeep(seed.id)
    } else if (swipeOffset < -SWIPE_THRESHOLD) {
      onIgnore(seed.id)
    }
    setSwipeOffset(0)
    touchStartRef.current = null
  }, [triageMode, swipeOffset, seed.id, onKeep, onIgnore])

  useEffect(() => {
    if (!triageMode || !cardRef.current) return
    const el = cardRef.current
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target !== el && !el.contains(e.target as Node)) return
      const key = e.key.toLowerCase()
      if (key === 'k') {
        e.preventDefault()
        onKeep(seed.id)
      } else if (key === 'i') {
        e.preventDefault()
        onIgnore(seed.id)
      } else if (key === 'm') {
        e.preventDefault()
        onMergeClick(seed.id)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [triageMode, seed.id, onKeep, onIgnore, onMergeClick])

  return (
    <Card
      ref={cardRef}
      className={cn(
        'group relative overflow-hidden border-border bg-card transition-all duration-200',
        'hover:shadow-card-hover hover:border-electric/30 hover:brightness-105',
        'focus-within:ring-2 focus-within:ring-electric/50 focus-within:ring-offset-2 focus-within:ring-offset-background',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-glow-electric/50'
      )}
      tabIndex={triageMode ? 0 : undefined}
      role={triageMode ? 'article' : undefined}
      aria-label={seed.title}
      style={
        triageMode && swipeOffset !== 0
          ? { transform: `translateX(${swipeOffset}px)` }
          : undefined
      }
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        setSwipeOffset(0)
        touchStartRef.current = null
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium line-clamp-2 pr-8">{seed.title}</CardTitle>
          {triageMode && (
            <button
              type="button"
              onClick={() => onToggleSelect(seed.id)}
              className={cn(
                'shrink-0 rounded-lg border p-1.5 transition-all duration-200 hover:scale-105',
                selected
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground hover:border-electric/50'
              )}
              aria-label={selected ? 'Deselect' : 'Select'}
            >
              {selected ? <Check className="h-4 w-4" /> : <span className="block h-4 w-4" />}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-caption text-muted-foreground line-clamp-2">{snippet}</p>
        {seed.extracted_bullets && seed.extracted_bullets.length > 0 && (
          <ul className="text-caption text-muted-foreground list-disc list-inside space-y-0.5">
            {seed.extracted_bullets.slice(0, 3).map((b, i) => (
              <li key={i} className="line-clamp-1">
                {b}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-1.5">
          {seed.tags?.slice(0, 4).map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-caption text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
          <span className="flex items-center gap-1.5 text-caption text-muted-foreground">
            <TypeIcon className="h-3.5 w-3.5" />
            {SEED_TYPE_LABELS[seed.type]}
          </span>
          <span className="flex items-center gap-1 text-caption text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatCaptureTime(seed.created_at)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onKeep(seed.id)}
            className="hover:bg-primary/15 hover:text-primary"
          >
            Keep
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMergeClick(seed.id)}
            className="hover:bg-accent/15 hover:text-accent"
          >
            Merge
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/15 hover:text-destructive"
            onClick={() => onIgnore(seed.id)}
          >
            Ignore
          </Button>
          <Link to={`/canvases?seed=${seed.id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Open in Canvas"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
