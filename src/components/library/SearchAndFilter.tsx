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

interface SearchAndFilterProps {
  filters: LibraryFilters
  onFiltersChange: (f: LibraryFilters) => void
  platformOptions?: string[]
  tagOptions?: string[]
  className?: string
}

export function SearchAndFilter({
  filters,
  onFiltersChange,
  platformOptions = ['LinkedIn', 'X', 'Instagram', 'TikTok'],
  tagOptions = [],
  className,
}: SearchAndFilterProps) {
  const set = (key: keyof LibraryFilters, value: string | undefined) => {
    onFiltersChange({ ...filters, [key]: value || undefined })
  }

  return (
    <div className={cn('space-y-4', className)} role="search" aria-label="Filter library by platform, date, tag, asset">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          placeholder="Search by title or asset..."
          value={filters.query ?? ''}
          onChange={(e) => set('query', e.target.value)}
          className="pl-9"
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
          onClick={() => onFiltersChange({})}
          aria-label="Clear filters"
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
