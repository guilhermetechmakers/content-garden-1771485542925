/**
 * Post Variants Panel: LinkedIn, X, Short Video Script, Carousel.
 * Platform-specific variant editing.
 */

import { useState } from 'react'
import { Linkedin, FileText, Video, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DropPost, PlatformVariant } from '@/types'

const VARIANT_CONFIG: { key: PlatformVariant; label: string; icon: React.ElementType }[] = [
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'x', label: 'X', icon: FileText },
  { key: 'short_video', label: 'Short Video', icon: Video },
  { key: 'carousel', label: 'Carousel', icon: LayoutGrid },
]

export interface PostVariantsPanelProps {
  post: DropPost
  onVariantChange: (variant: PlatformVariant, content: string) => void
  selectedPostIndex?: number
}

export function PostVariantsPanel({
  post,
  onVariantChange,
  selectedPostIndex = 0,
}: PostVariantsPanelProps) {
  const [activeVariant, setActiveVariant] = useState<PlatformVariant>('linkedin')
  const variants = post.variants ?? {}
  const currentContent = variants[activeVariant] ?? ''

  return (
    <div className="rounded-card-lg border border-border bg-card p-4 shadow-card">
      <h3 className="text-section font-semibold text-foreground mb-3">Platform variants</h3>
      <p className="text-caption text-muted-foreground mb-4">
        Adapt this post for different platforms. Post {selectedPostIndex + 1} selected.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {VARIANT_CONFIG.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activeVariant === key ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'transition-all duration-200',
              activeVariant === key && 'shadow-glow-electric'
            )}
            onClick={() => setActiveVariant(key)}
          >
            <Icon className="h-4 w-4 mr-1" aria-hidden />
            {label}
          </Button>
        ))}
      </div>

      <textarea
        className="w-full min-h-[120px] rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric/30"
        placeholder={`${VARIANT_CONFIG.find((v) => v.key === activeVariant)?.label ?? activeVariant} variant…`}
        value={currentContent}
        onChange={(e) => onVariantChange(activeVariant, e.target.value)}
      />
    </div>
  )
}
