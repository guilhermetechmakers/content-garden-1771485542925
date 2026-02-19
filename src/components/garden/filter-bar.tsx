import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Filter } from 'lucide-react'
import type { SeedType } from '@/api/seeds'

const SEED_TYPE_LABELS: Record<SeedType, string> = {
  link: 'Link',
  note: 'Note',
  voice: 'Voice',
  screenshot: 'Screenshot',
  image: 'Image',
  audio: 'Audio',
  video: 'Video',
}

export type SortOption = 'date_desc' | 'date_asc' | 'type' | 'title'

export interface FilterBarProps {
  filterType: string
  filterTag: string
  filterDateFrom: string
  filterDateTo: string
  sortBy: SortOption
  sortOptions: { value: SortOption; label: string }[]
  onFilterTypeChange: (v: string) => void
  onFilterTagChange: (v: string) => void
  onFilterDateFromChange: (v: string) => void
  onFilterDateToChange: (v: string) => void
  onSortChange: (v: SortOption) => void
  showFilters: boolean
  onShowFiltersChange: (v: boolean) => void
}

export function FilterBar({
  filterType,
  filterTag,
  filterDateFrom,
  filterDateTo,
  sortBy,
  sortOptions,
  onFilterTypeChange,
  onFilterTagChange,
  onFilterDateFromChange,
  onFilterDateToChange,
  onSortChange,
  showFilters,
  onShowFiltersChange,
}: FilterBarProps) {
  return (
    <>
      <Button
        variant="outline"
        onClick={() => onShowFiltersChange(!showFilters)}
        className="shrink-0"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filter & sort
      </Button>
      {showFilters && (
        <Card className="border-border bg-card p-4 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="text-caption text-muted-foreground block mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => onFilterTypeChange(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric"
              >
                <option value="">All</option>
                {(Object.keys(SEED_TYPE_LABELS) as SeedType[]).map((t) => (
                  <option key={t} value={t}>
                    {SEED_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-caption text-muted-foreground block mb-1">Tag</label>
              <Input
                placeholder="Filter by tag"
                value={filterTag}
                onChange={(e) => onFilterTagChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-caption text-muted-foreground block mb-1">From date</label>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => onFilterDateFromChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-caption text-muted-foreground block mb-1">To date</label>
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => onFilterDateToChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-caption text-muted-foreground block mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
