import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { DescribeToFindSearchFilters } from '@/types'
import { cn } from '@/lib/utils'

const TYPE_OPTIONS: { value: DescribeToFindSearchFilters['type']; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'seed', label: 'Seeds' },
  { value: 'canvas', label: 'Canvases' },
  { value: 'drop', label: 'Drops' },
  { value: 'snippet', label: 'Snippets' },
]

const CONFIDENCE_OPTIONS = [
  { value: undefined, label: 'Any' },
  { value: 0.5, label: '≥ 50%' },
  { value: 0.7, label: '≥ 70%' },
  { value: 0.9, label: '≥ 90%' },
]

export interface RefinementControlsProps {
  filters: DescribeToFindSearchFilters
  onChange: (filters: DescribeToFindSearchFilters) => void
  onClear?: () => void
  className?: string
}

export function RefinementControls({
  filters,
  onChange,
  onClear,
  className,
}: RefinementControlsProps) {
  const hasActiveFilters =
    filters.type != null ||
    filters.dateFrom != null ||
    filters.dateTo != null ||
    filters.confidenceMin != null

  return (
    <div
      className={cn(
        'rounded-card-lg border border-border bg-card p-4 space-y-4',
        className
      )}
      role="group"
      aria-labelledby="refinement-heading"
    >
      <div className="flex items-center justify-between">
        <h3
          id="refinement-heading"
          className="text-section font-semibold text-foreground flex items-center gap-2"
        >
          <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
          Refine results
        </h3>
        {hasActiveFilters && onClear && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-caption text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="filter-type" className="text-caption font-medium text-muted-foreground">
            Type
          </Label>
          <select
            id="filter-type"
            value={filters.type ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                type: (e.target.value || undefined) as DescribeToFindSearchFilters['type'],
              })
            }
            className={cn(
              'flex h-10 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground',
              'focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric/50',
              'transition-colors'
            )}
            aria-label="Filter by type"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value ?? 'all'} value={opt.value ?? ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-date-from" className="text-caption font-medium text-muted-foreground">
            From date
          </Label>
          <Input
            id="filter-date-from"
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) =>
              onChange({ ...filters, dateFrom: e.target.value || undefined })
            }
            className="rounded-lg"
            aria-label="Filter from date"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-date-to" className="text-caption font-medium text-muted-foreground">
            To date
          </Label>
          <Input
            id="filter-date-to"
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) =>
              onChange({ ...filters, dateTo: e.target.value || undefined })
            }
            className="rounded-lg"
            aria-label="Filter to date"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-confidence" className="text-caption font-medium text-muted-foreground">
            Confidence
          </Label>
          <select
            id="filter-confidence"
            value={filters.confidenceMin ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                confidenceMin: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            className={cn(
              'flex h-10 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground',
              'focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric/50',
              'transition-colors'
            )}
            aria-label="Filter by confidence level"
          >
            {CONFIDENCE_OPTIONS.map((opt) => (
              <option key={opt.value ?? 'any'} value={opt.value ?? ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
