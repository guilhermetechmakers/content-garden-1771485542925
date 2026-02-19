import { Image, Video, FileText, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { LibraryAsset } from '@/types'
import { cn } from '@/lib/utils'

const typeIcons = { image: Image, video: Video, file: FileText } as const

interface AssetManagerProps {
  assets: LibraryAsset[]
  isLoading?: boolean
  onDownload?: (asset: LibraryAsset) => void
  onViewUsage?: (asset: LibraryAsset) => void
  className?: string
}

export function AssetManager({
  assets,
  isLoading,
  onDownload,
  onViewUsage,
  className,
}: AssetManagerProps) {
  if (isLoading) {
    return (
      <Card className={cn('border-border bg-card', className)}>
        <CardContent className="py-6">
          <h3 className="text-section font-semibold text-foreground mb-4">Asset manager</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="relative h-24 overflow-hidden rounded-lg bg-input">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (assets.length === 0) {
    return (
      <Card className={cn('border-border bg-card', className)}>
        <CardContent className="py-8 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" aria-hidden />
          <p className="mt-4 text-section font-medium text-foreground">No assets yet</p>
          <p className="mt-1 text-caption text-muted-foreground">
            Images, videos, and files from your published posts will appear here with usage provenance.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardContent className="py-6">
        <h3 className="text-section font-semibold text-foreground mb-4">Asset manager</h3>
        <p className="text-caption text-muted-foreground mb-4">
          Images, videos, and files with usage provenance.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => {
            const Icon = typeIcons[asset.type] ?? FileText
            const isImage = asset.type === 'image' && asset.url
            return (
              <div
                key={asset.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-input/30 p-3 transition-all duration-200 hover:border-electric/30 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card">
                  {isImage ? (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon className="h-6 w-6 text-muted-foreground" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{asset.name}</p>
                  {asset.usage_provenance && asset.usage_provenance.length > 0 && (
                    <p className="text-caption text-muted-foreground truncate">
                      Used in {asset.usage_provenance.length} post(s)
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  {onDownload && (
                    <Button variant="ghost" size="sm" onClick={() => onDownload(asset)} aria-label={`Download ${asset.name}`}>
                      Download
                    </Button>
                  )}
                  {onViewUsage && (
                    <Button variant="ghost" size="sm" onClick={() => onViewUsage(asset)}>
                      Usage
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
