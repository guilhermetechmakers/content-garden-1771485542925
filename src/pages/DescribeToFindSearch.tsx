import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  NLSearchInput,
  ResultsTiers,
  RefinementControls,
} from '@/components/describe-to-find-search'
import { describeToFindSearch } from '@/lib/api'
import type { SearchResultItem, DescribeToFindSearchFilters } from '@/types'

const DEFAULT_FILTERS: DescribeToFindSearchFilters = {}

export default function DescribeToFindSearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [filters, setFilters] = useState<DescribeToFindSearchFilters>(DEFAULT_FILTERS)

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['describe-to-find-search', submittedQuery, filters],
    queryFn: () => describeToFindSearch(submittedQuery, filters),
    enabled: submittedQuery.length > 0,
    staleTime: 60 * 1000,
  })

  const handleSearch = useCallback((q: string) => {
    const trimmed = q.trim()
    if (!trimmed) {
      toast.message('Enter a search phrase')
      return
    }
    setSubmittedQuery(trimmed)
  }, [])

  const handleOpenInContext = useCallback(
    (item: SearchResultItem, context: 'garden' | 'canvas') => {
      if (context === 'garden') {
        navigate('/garden' + (item.seed_id ? `?seed=${item.seed_id}` : ''))
        toast.success('Opened in Garden')
      } else {
        const canvasId = item.canvas_id ?? item.drop_id
        navigate(canvasId ? `/canvases/${canvasId}` : '/canvases')
        toast.success('Opened in Canvas')
      }
    },
    [navigate]
  )

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    toast.message('Filters cleared')
  }, [])

  useEffect(() => {
    document.title = 'Describe-to-Find | Content Garden'
    return () => {
      document.title = 'Content Garden'
    }
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-title font-bold text-foreground">
          Describe-to-Find
        </h1>
        <p className="text-caption text-muted-foreground mt-1">
          Natural-language search across Seeds, Canvases, and Drops. Describe what you need in plain language.
        </p>
      </header>

      <NLSearchInput
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        recentSearches={data?.recentSearches}
      />

      {submittedQuery && (
        <>
          <RefinementControls
            filters={filters}
            onChange={setFilters}
            onClear={handleClearFilters}
          />

          {isError && (
            <div
              className="rounded-card-lg border border-destructive/50 bg-destructive/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              role="alert"
            >
              <p className="text-body text-foreground">
                {error instanceof Error ? error.message : 'Search failed. Please try again.'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-sm font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-electric rounded"
              >
                Retry
              </button>
            </div>
          )}

          {!isError && (
            <ResultsTiers
              exact={data?.exact ?? []}
              snippets={data?.snippets ?? []}
              drops={data?.drops ?? []}
              isLoading={isLoading}
              onOpenInContext={handleOpenInContext}
            />
          )}
        </>
      )}

      {!submittedQuery && (
        <div className="rounded-card-lg border border-border bg-card/50 p-8 text-center">
          <p className="text-body text-muted-foreground">
            Enter a phrase above or pick an example prompt to search across your Seeds, Canvases, and Drops.
          </p>
        </div>
      )}
    </div>
  )
}
