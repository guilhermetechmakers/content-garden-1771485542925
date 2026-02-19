import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  PublishedItemsGrid,
  SearchAndFilter,
  RepurposeSuggestions,
  AssetManager,
  ExportAndSync,
  type LibraryFilters,
  type RepurposeSuggestion,
} from '@/components/library'
import { fetchLibraryPublished, fetchLibraryAssets, type LibraryPublishedFilters } from '@/api/library'
import type { LibraryPublishedItem, LibraryAsset } from '@/types'

function libraryFiltersToApi(f: LibraryFilters): LibraryPublishedFilters {
  return {
    platform: f.platform,
    tag: f.tag,
    dateFrom: f.dateFrom,
    dateTo: f.dateTo,
    query: f.query,
    asset: f.asset,
  }
}

const MOCK_SUGGESTIONS: RepurposeSuggestion[] = [
  { id: '1', sourceTitle: 'LinkedIn post', idea: 'Turn into a carousel with 5 key takeaways', format: 'Carousel' },
  { id: '2', sourceTitle: 'X thread', idea: 'Extract top quote for a short video script hook', format: 'Short Video' },
  { id: '3', sourceTitle: 'LinkedIn post', idea: 'Repurpose as a LinkedIn article with deeper analysis', format: 'Article' },
]

export function LibraryPage() {
  const [filters, setFilters] = useState<LibraryFilters>({})
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<RepurposeSuggestion[]>([])
  const [syncLoading, setSyncLoading] = useState(false)

  useEffect(() => {
    document.title = 'Library | Content Garden'
    return () => {
      document.title = 'Content Garden'
    }
  }, [])

  const apiFilters = useMemo(() => libraryFiltersToApi(filters), [filters])

  const { data: publishedData, isLoading: publishedLoading, isError: publishedError } = useQuery({
    queryKey: ['library', 'published', apiFilters],
    queryFn: () => fetchLibraryPublished(apiFilters),
  })

  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ['library', 'assets'],
    queryFn: () => fetchLibraryAssets(),
  })

  const items = publishedData?.items ?? []
  const assets = (assetsData?.assets ?? []) as LibraryAsset[]
  const tagOptions = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => i.tags?.forEach((t) => set.add(t)))
    return Array.from(set)
  }, [items])

  const handleGetSuggestions = () => {
    setSuggestionsLoading(true)
    setTimeout(() => {
      setSuggestionsLoading(false)
      setSuggestions(MOCK_SUGGESTIONS)
      toast.success('AI suggestions loaded')
    }, 800)
  }

  const handleExport = (format?: 'assets' | 'csv' | 'json') => {
    toast.success(`Export as ${format ?? 'assets'} started`)
  }

  const handleSync = () => {
    setSyncLoading(true)
    setTimeout(() => {
      setSyncLoading(false)
      toast.success('Sync complete')
    }, 1500)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-title font-bold text-foreground">Library</h1>
        <p className="text-caption text-muted-foreground mt-1">
          Published content and assets for repurpose
        </p>
      </header>

      <section aria-label="Search and filter">
        <SearchAndFilter
          filters={filters}
          onFiltersChange={setFilters}
          tagOptions={tagOptions}
        />
      </section>

      <section aria-label="Published items">
        <h2 className="text-section font-semibold text-foreground mb-3">Published items</h2>
        {publishedError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            Failed to load published items. Please try again.
          </div>
        )}
        <PublishedItemsGrid
          items={items}
          isLoading={publishedLoading}
          onRepurpose={() => toast.info('Open in Canvas to repurpose')}
          onView={(item: LibraryPublishedItem) => toast.info(`View ${item.title}`)}
        />
      </section>

      <RepurposeSuggestions
        suggestions={suggestions}
        isLoading={suggestionsLoading}
        onGetSuggestions={handleGetSuggestions}
        onApply={() => toast.success('Idea applied')}
      />

      <AssetManager
        assets={assets}
        isLoading={assetsLoading}
        onDownload={() => toast.success('Download started')}
        onViewUsage={() => toast.info('Usage provenance')}
      />

      <ExportAndSync
        onExport={handleExport}
        onSync={handleSync}
        isSyncing={syncLoading}
        lastSyncAt={syncLoading ? null : undefined}
      />
    </div>
  )
}
