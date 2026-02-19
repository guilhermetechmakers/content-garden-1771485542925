/**
 * Assets Panel: attach images/videos with provenance.
 */

import { ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DropPost } from '@/types'

export interface AssetsPanelProps {
  post: DropPost
  onAssetsChange: (urls: string[]) => void
  selectedPostIndex?: number
}

export function AssetsPanel({
  post,
  onAssetsChange,
  selectedPostIndex = 0,
}: AssetsPanelProps) {
  const assetUrls = post.asset_urls ?? []

  const handleAddAsset = () => {
    onAssetsChange([...assetUrls, ''])
  }

  const handleRemoveAsset = (index: number) => {
    onAssetsChange(assetUrls.filter((_, i) => i !== index))
  }

  return (
    <div className="rounded-card-lg border border-border bg-card p-4 shadow-card">
      <h3 className="text-section font-semibold text-foreground mb-3">Assets</h3>
      <p className="text-caption text-muted-foreground mb-4">
        Attach images or videos for this post. Post {selectedPostIndex + 1} selected.
      </p>

      <div className="space-y-2">
        {assetUrls.map((url, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg border border-border bg-input/50 px-3 py-2"
          >
            {url ? (
              <span className="text-sm text-foreground truncate flex-1">{url}</span>
            ) : (
              <span className="text-sm text-muted-foreground flex-1">Placeholder URL</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-destructive hover:text-destructive"
              onClick={() => handleRemoveAsset(i)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full transition-all duration-200 hover:scale-[1.01]"
        onClick={handleAddAsset}
      >
        <ImagePlus className="h-4 w-4 mr-2" />
        Add asset
      </Button>
    </div>
  )
}
