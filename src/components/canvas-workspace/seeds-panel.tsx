/**
 * Seeds panel (left): list seeds, search, "Propose related" suggestions.
 * Draggable seed items for adding to canvas.
 */

import { useState, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Search, Sparkles, Leaf, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { listSeeds, type Seed } from '@/api/seeds'
import { proposeRelatedSeeds } from '@/api/canvases'

export interface SeedsPanelProps {
  canvasId: string | undefined
  onAddSeedToCanvas: (seed: Seed) => void
  onInsertSnippet?: () => void
  onInsertAsset?: () => void
}

function SeedItem({
  seed,
  onAdd,
}: {
  seed: Seed
  onAdd: (seed: Seed) => void
}) {
  const snippet =
    seed.content?.slice(0, 80)?.trim() ||
    seed.extracted_bullets?.[0] ||
    (seed.source_url ? 'Link' : '—')

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/seed', JSON.stringify(seed))
        e.dataTransfer.effectAllowed = 'copy'
      }}
      onClick={() => onAdd(seed)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onAdd(seed)
        }
      }}
      className={cn(
        'group flex cursor-grab items-start gap-2 rounded-lg border border-border bg-input/50 px-3 py-2 text-left text-sm transition-all duration-200',
        'hover:border-electric/50 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-electric/50 active:cursor-grabbing'
      )}
      aria-label={`Add seed: ${seed.title}`}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground line-clamp-2">{seed.title}</p>
        <p className="text-caption text-muted-foreground line-clamp-1 mt-0.5">{snippet}</p>
      </div>
    </div>
  )
}

function SeedsPanelSkeleton() {
  return (
    <div className="space-y-2 p-2">
      <Skeleton className="h-10 w-full rounded-lg" />
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  )
}

export function SeedsPanel({
  canvasId,
  onAddSeedToCanvas,
  onInsertSnippet,
  onInsertAsset,
}: SeedsPanelProps) {
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<{ id: string; title: string }[]>([])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['seeds', { limit: 100 }],
    queryFn: () => listSeeds({ limit: 100 }),
  })

  const proposeMutation = useMutation({
    mutationFn: () =>
      proposeRelatedSeeds(canvasId ?? '', []).catch(() => ({
        seeds: [] as { id: string; title: string }[],
      })),
    onSuccess: (res) => {
      setSuggestions(res.seeds ?? [])
      if ((res.seeds?.length ?? 0) === 0) {
        toast.info('No related seeds suggested yet. Add more seeds to your Garden.')
      }
    },
    onError: () => {
      setSuggestions([])
      toast.info('Propose related is not available yet. Use seeds from the list above.')
    },
  })

  const seeds = data?.seeds ?? []
  const filteredSeeds = search.trim()
    ? seeds.filter(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.content?.toLowerCase().includes(search.toLowerCase()) ||
          s.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : seeds

  const handleProposeRelated = useCallback(() => {
    if (canvasId) {
      proposeMutation.mutate()
    } else {
      toast.info('Save your canvas first to get related seed suggestions.')
    }
  }, [canvasId, proposeMutation])

  return (
    <aside
      className="flex w-64 shrink-0 flex-col border-r border-border bg-card animate-fade-in"
      aria-label="Seeds panel"
    >
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Search seeds…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9"
            aria-label="Search seeds"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-2">
          {isLoading && <SeedsPanelSkeleton />}
          {isError && (
            <p className="text-caption text-muted-foreground px-2 py-4">
              Could not load seeds. Check your connection.
            </p>
          )}
          {!isLoading && !isError && filteredSeeds.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-input/30 px-3 py-6 text-center">
              <Leaf className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-caption text-muted-foreground">
                {search.trim() ? 'No seeds match your search.' : 'No seeds yet. Capture from Home.'}
              </p>
            </div>
          )}
          {!isLoading && !isError &&
            filteredSeeds.slice(0, 50).map((seed) => (
              <SeedItem
                key={seed.id}
                seed={seed}
                onAdd={onAddSeedToCanvas}
              />
            ))}
        </div>
        <div className="border-t border-border p-2">
          <p className="text-caption text-muted-foreground mb-2">Propose related</p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start transition-all duration-200 hover:scale-[1.02]"
            onClick={handleProposeRelated}
            disabled={proposeMutation.isPending}
          >
            <Sparkles className="h-4 w-4 mr-2 text-primary" />
            {proposeMutation.isPending ? 'Suggesting…' : 'Suggest from Garden'}
          </Button>
          {suggestions.length > 0 && (
            <div className="mt-2 space-y-1">
              {suggestions.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const seed = seeds.find((se) => se.id === s.id)
                    if (seed) onAddSeedToCanvas(seed)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      const seed = seeds.find((se) => se.id === s.id)
                      if (seed) onAddSeedToCanvas(seed)
                    }
                  }}
                  className="rounded-md border border-border bg-input/30 px-2 py-1.5 text-sm text-muted-foreground hover:border-electric/50 hover:text-foreground transition-colors cursor-pointer"
                >
                  {s.title}
                </div>
              ))}
            </div>
          )}
        </div>
        {(onInsertSnippet || onInsertAsset) && (
          <div className="border-t border-border p-2">
            <p className="text-caption text-muted-foreground mb-2">Insert</p>
            <div className="flex flex-wrap gap-1">
              {onInsertSnippet && (
                <Button variant="outline" size="sm" onClick={onInsertSnippet}>
                  Snippet
                </Button>
              )}
              {onInsertAsset && (
                <Button variant="outline" size="sm" onClick={onInsertAsset}>
                  Asset
                </Button>
              )}
            </div>
          </div>
        )}
      </ScrollArea>
    </aside>
  )
}
