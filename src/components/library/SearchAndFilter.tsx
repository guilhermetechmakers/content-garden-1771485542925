import { useCallback, useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface LibraryFilters {
  platform?: string
  tag?: string
  dateFrom?: string
  dateTo?: string
  asset?: string
  query?: string
}

const ASSET_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'text', label: 'Text' },
  { value: 'carousel', label: 'Carousel' },
] as const

interface SearchAndFilterProps {
  filters: LibraryFilters
  onFiltersChange: (f: LibraryFilters) => void
  platformOptions?: string[]
  tagOptions?: string[]
  className?: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

export function SearchAndFilter({
  filters,
  onFiltersChange,
  platformOptions = ['LinkedIn', 'X', 'Instagram', 'TikTok'],
  tagOptions = [],
  className,
}: SearchAndFilterProps) {
  const [localQuery, setLocalQuery] = useState(filters.query ?? '')
  const debouncedQuery = useDebounce(localQuery, 300)

  const set = useCallback(
    (key: keyof LibraryFilters, value: string | undefined) => {
      onFiltersChange({ ...filters, [key]: value || undefined })
    },
    [filters, onFiltersChange]
  )

  useEffect(() => {
    if (debouncedQuery !== (filters.query ?? '')) {
      onFiltersChange({ ...filters, query: debouncedQuery || undefined })
    }
  }, [debouncedQuery, filters, onFiltersChange])

  return (
    <div className={cn('space-y-4', className)} role="search" aria-label="Filter library by platform, date, tag, asset">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          placeholder="Search by title, platform, or tag..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="pl-9 border-border bg-input focus:border-electric focus:ring-1 focus:ring-electric/50"
          aria-label="Search library"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="library-filter-platform" className="text-caption text-muted-foreground sr-only sm:not-sr-only">
          Platform
        </label>
        <select
          id="library-filter-platform"
          value={filters.platform ?? ''}
          onChange={(e) => set('platform', e.target.value)}
          className="h-9 rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric/50"
          aria-label="Filter by platform"
        >
          <option value="">All platforms</option>
          {platformOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <label htmlFor="library-filter-tag" className="text-caption text-muted-foreground sr-only sm:not-sr-only">
          Tag
        </label>
        <select
          id="library-filter-tag"
          value={filters.tag ?? ''}
          onChange={(e) => set('tag', e.target.value)}
          className="h-9 rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric/50"
          aria-label="Filter by tag"
        >
          <option value="">All tags</option>
          {tagOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label htmlFor="library-filter-asset" className="text-caption text-muted-foreground sr-only sm:not-sr-only">
          Asset type
        </label>
        <select
          id="library-filter-asset"
          value={filters.asset ?? ''}
          onChange={(e) => set('asset', e.target.value)}
          className="h-9 rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric/50"
          aria-label="Filter by asset type"
        >
          {ASSET_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <label htmlFor="library-filter-dateFrom" className="text-caption text-muted-foreground sr-only sm:not-sr-only">
          Date from
        </label>
        <Input
          id="library-filter-dateFrom"
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(e) => set('dateFrom', e.target.value)}
          className="h-9 w-auto max-w-[140px]"
          aria-label="Date from"
        />
        <label htmlFor="library-filter-dateTo" className="text-caption text-muted-foreground sr-only sm:not-sr-only">
          Date to
        </label>
        <Input
          id="library-filter-dateTo"
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(e) => set('dateTo', e.target.value)}
          className="h-9 w-auto max-w-[140px]"
          aria-label="Date to"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLocalQuery('')
            onFiltersChange({})
          }}
          aria-label="Clear filters"
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
