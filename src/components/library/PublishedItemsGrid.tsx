import { Image, FileText, Video, LayoutGrid, Heart, MessageCircle, Share2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { LibraryPublishedItem } from '@/types'
import { cn } from '@/lib/utils'

const assetIcons = {
  image: Image,
  video: Video,
  text: FileText,
  carousel: LayoutGrid,
} as const

interface PublishedItemsGridProps {
  items: LibraryPublishedItem[]
  isLoading?: boolean
  onRepurpose?: (item: LibraryPublishedItem) => void
  onView?: (item: LibraryPublishedItem) => void
}

function MetricRow({ metrics }: { metrics?: LibraryPublishedItem['performance_metrics'] }) {
  if (!metrics || Object.keys(metrics).length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap gap-3 text-caption text-muted-foreground">
      {metrics.impressions != null && (
        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" aria-hidden />
          {metrics.impressions.toLocaleString()}
        </span>
      )}
      {metrics.likes != null && (
        <span className="flex items-center gap-1">
          <Heart className="h-3.5 w-3.5" aria-hidden />
          {metrics.likes}
        </span>
      )}
      {metrics.comments != null && (
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          {metrics.comments}
        </span>
      )}
      {metrics.shares != null && (
        <span className="flex items-center gap-1">
          <Share2 className="h-3.5 w-3.5" aria-hidden />
          {metrics.shares}
        </span>
      )}
    </div>
  )
}

export function PublishedItemsGrid({ items, isLoading, onRepurpose, onView }: PublishedItemsGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border-border bg-card overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-input">
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-input" />
                  <div className="h-3 w-32 animate-pulse rounded bg-input" />
                  <div className="h-3 w-20 animate-pulse rounded bg-input" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-card-lg border-2 border-dashed border-border bg-card/50 py-16 text-center"
        role="status"
        aria-label="No published items"
      >
        <Image className="h-12 w-12 text-muted-foreground/50" aria-hidden />
        <p className="mt-4 text-section font-medium text-foreground">No published items yet</p>
        <p className="mt-1 max-w-sm text-caption text-muted-foreground">
          Content you mark as posted in Runway will appear here for repurposing.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => {
        const Icon = assetIcons[item.asset_type as keyof typeof assetIcons] ?? FileText
        return (
          <Card
            key={item.id}
            hover
            className={cn(
              'border-border bg-card transition-all duration-200 animate-fade-in',
              'hover:shadow-card-hover hover:border-electric/30'
            )}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-input">
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt=""
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <Icon className="h-6 w-6 text-muted-foreground" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate text-foreground">{item.title}</p>
                  <p className="text-caption text-muted-foreground">
                    {item.platform} · {new Date(item.published_at).toLocaleDateString('en-US')}
                  </p>
                  <MetricRow metrics={item.performance_metrics} />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {onRepurpose && (
                  <Button variant="ghost" size="sm" onClick={() => onRepurpose(item)}>
                    Repurpose
                  </Button>
                )}
                {onView && (
                  <Button variant="ghost" size="sm" onClick={() => onView(item)}>
                    View
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
