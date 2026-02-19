import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import {
  SeedCard,
  MergeModal,
  FilterBar,
  BulkActionsToolbar,
  GardenEmptyState,
  GardenSkeleton,
} from '@/components/garden'
import {
  listSeeds,
  mergeSeeds,
  updateSeedTriage,
  bulkTriage,
  type Seed,
  type SeedType,
  type SeedCluster,
  type TriageStatus,
} from '@/api/seeds'
import { trackCuration } from '@/lib/analytics'
import type { SortOption } from '@/components/garden'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc', label: 'Oldest first' },
  { value: 'type', label: 'By type' },
  { value: 'title', label: 'By title' },
]

function sortSeeds(seeds: Seed[], sortBy: SortOption): Seed[] {
  const copy = [...seeds]
  switch (sortBy) {
    case 'date_desc':
      return copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    case 'date_asc':
      return copy.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    case 'type':
      return copy.sort((a, b) => a.type.localeCompare(b.type))
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return copy
  }
}

function sortClusters(clusters: SeedCluster[], sortBy: SortOption): SeedCluster[] {
  return clusters.map((c) => ({
    ...c,
    seeds: c.seeds ? sortSeeds(c.seeds, sortBy) : [],
  }))
}

export function GardenPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [triageMode, setTriageMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [mergeOpen, setMergeOpen] = useState(false)
  const [ignoreTargetId, setIgnoreTargetId] = useState<string | null>(null)
  const [pendingBulkIgnoreIds, setPendingBulkIgnoreIds] = useState<string[]>([])
  const [filterType, setFilterType] = useState<string>('')
  const [filterTag, setFilterTag] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [clustered, setClustered] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('date_desc')

  const listParams = useMemo(
    () => ({
      limit: 100,
      clustered,
      ...(filterType && { type: filterType as SeedType }),
      ...(filterTag && { tag: filterTag }),
      ...(filterDateFrom && { dateFrom: filterDateFrom }),
      ...(filterDateTo && { dateTo: filterDateTo }),
    }),
    [clustered, filterType, filterTag, filterDateFrom, filterDateTo]
  )

  const { data, isLoading, isError } = useQuery({
    queryKey: ['seeds', 'garden', listParams],
    queryFn: () => listSeeds(listParams),
  })

  const mergeMutation = useMutation({
    mutationFn: mergeSeeds,
    onSuccess: (newSeed, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seeds'] })
      setMergeOpen(false)
      setSelectedIds(new Set())
      trackCuration({
        action: 'merge',
        seedIds: variables.seed_ids,
        mergedSeedId: newSeed.id,
      })
      toast.success('Seeds merged')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Merge failed')
    },
  })

  const triageMutation = useMutation({
    mutationFn: ({ id, triage_status }: { id: string; triage_status: TriageStatus }) =>
      updateSeedTriage(id, triage_status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seeds'] })
      if (variables.triage_status === 'ignored') {
        trackCuration({ action: 'ignore', seedIds: [variables.id] })
        toast.success('Seed ignored', {
          action: {
            label: 'Undo',
            onClick: () => {
              updateSeedTriage(variables.id, null).then(() => {
                queryClient.invalidateQueries({ queryKey: ['seeds'] })
                toast.success('Undone')
              })
            },
          },
        })
      } else {
        trackCuration({ action: 'keep', seedIds: [variables.id] })
        toast.success('Seed kept')
      }
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Update failed')
    },
  })

  const bulkTriageMutation = useMutation({
    mutationFn: bulkTriage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seeds'] })
      trackCuration({
        action: variables.triage_status === 'kept' ? 'bulk_keep' : 'bulk_ignore',
        seedIds: variables.seed_ids,
      })
      setSelectedIds(new Set())
      setPendingBulkIgnoreIds([])
      if (variables.triage_status === 'ignored') {
        toast.success(`${variables.seed_ids.length} seed(s) ignored`, {
          action: {
            label: 'Undo',
            onClick: () => {
              bulkTriage({
                seed_ids: variables.seed_ids,
                triage_status: 'kept',
              }).then(() => {
                queryClient.invalidateQueries({ queryKey: ['seeds'] })
                toast.success('Undone')
              })
            },
          },
        })
      } else {
        toast.success(`${variables.seed_ids.length} seed(s) kept`)
      }
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Bulk triage failed')
      setPendingBulkIgnoreIds([])
    },
  })

  const clusters = data?.clusters ?? []
  const seeds = data?.seeds ?? []
  const allSeeds = clustered
    ? clusters.flatMap((c) => c.seeds ?? [])
    : seeds

  const filteredBySearch = useMemo(() => {
    const searchLower = search.trim().toLowerCase()
    if (!searchLower) {
      return clustered
        ? sortClusters(clusters, sortBy)
        : [{ id: 'flat', label: 'All seeds', seeds: sortSeeds(seeds, sortBy) }]
    }
    const filterSeed = (s: Seed) =>
      s.title.toLowerCase().includes(searchLower) ||
      s.content?.toLowerCase().includes(searchLower) ||
      s.tags?.some((t) => t.toLowerCase().includes(searchLower))
    if (clustered) {
      return sortClusters(
        clusters
          .map((c) => ({
            ...c,
            seeds: (c.seeds ?? []).filter(filterSeed),
          }))
          .filter((c) => (c.seeds?.length ?? 0) > 0),
        sortBy
      )
    }
    return [
      {
        id: 'flat',
        label: 'All seeds',
        seeds: sortSeeds(seeds.filter(filterSeed), sortBy),
      },
    ]
  }, [search, clustered, clusters, seeds, sortBy])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleBulkKeep = useCallback(() => {
    if (selectedIds.size === 0) return
    bulkTriageMutation.mutate({
      seed_ids: Array.from(selectedIds),
      triage_status: 'kept',
    })
  }, [selectedIds, bulkTriageMutation])

  const handleBulkIgnore = useCallback(() => {
    if (selectedIds.size === 0) return
    setPendingBulkIgnoreIds(Array.from(selectedIds))
  }, [selectedIds])

  const confirmBulkIgnore = useCallback(() => {
    if (pendingBulkIgnoreIds.length === 0) return
    bulkTriageMutation.mutate({
      seed_ids: pendingBulkIgnoreIds,
      triage_status: 'ignored',
    })
  }, [pendingBulkIgnoreIds, bulkTriageMutation])

  const handleMergeOpen = useCallback((singleId?: string) => {
    if (singleId) setSelectedIds(new Set([singleId]))
    setMergeOpen(true)
  }, [])

  const handleIgnore = useCallback((id: string) => {
    setIgnoreTargetId(id)
  }, [])

  const confirmIgnore = useCallback(() => {
    const id = ignoreTargetId
    if (!id) return
    setIgnoreTargetId(null)
    triageMutation.mutate({ id, triage_status: 'ignored' })
  }, [ignoreTargetId, triageMutation])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title font-bold text-foreground">Garden</h1>
          <p className="text-caption text-muted-foreground">
            Seeds grouped by topic — triage and merge
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={clustered ? 'default' : 'outline'}
            size="sm"
            onClick={() => setClustered(true)}
            className="transition-all duration-200 hover:scale-[1.02]"
          >
            Clustered
          </Button>
          <Button
            variant={!clustered ? 'default' : 'outline'}
            size="sm"
            onClick={() => setClustered(false)}
            className="transition-all duration-200 hover:scale-[1.02]"
          >
            Flat
          </Button>
          <Button
            variant={triageMode ? 'default' : 'outline'}
            onClick={() => setTriageMode((v) => !v)}
            className="transition-all duration-200 hover:scale-[1.02]"
          >
            {triageMode ? 'Exit triage' : 'Triage mode'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Describe what you're looking for…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <FilterBar
          filterType={filterType}
          filterTag={filterTag}
          filterDateFrom={filterDateFrom}
          filterDateTo={filterDateTo}
          sortBy={sortBy}
          sortOptions={SORT_OPTIONS}
          onFilterTypeChange={setFilterType}
          onFilterTagChange={setFilterTag}
          onFilterDateFromChange={setFilterDateFrom}
          onFilterDateToChange={setFilterDateTo}
          onSortChange={setSortBy}
          showFilters={showFilters}
          onShowFiltersChange={setShowFilters}
        />
      </div>

      {triageMode && (
        <BulkActionsToolbar
          selectedCount={selectedIds.size}
          onMerge={() => setMergeOpen(true)}
          onBulkKeep={handleBulkKeep}
          onBulkIgnore={handleBulkIgnore}
        />
      )}

      <AlertDialog
        open={pendingBulkIgnoreIds.length > 0}
        onOpenChange={(open) => !open && setPendingBulkIgnoreIds([])}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ignore {pendingBulkIgnoreIds.length} seed(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              They will be hidden from your Garden feed. You can undo from the toast.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkIgnore}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Ignore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isLoading && <GardenSkeleton />}

      {isError && (
        <Card className="border-destructive/30 bg-card">
          <CardContent className="py-8 text-center">
            <p className="text-caption text-muted-foreground">
              Could not load seeds. Check your connection and try again.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['seeds'] })}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && filteredBySearch.length === 0 && (
        <GardenEmptyState />
      )}

      {!isLoading && !isError && filteredBySearch.length > 0 && (
        <div className="space-y-8">
          {filteredBySearch.map((cluster) => (
            <div key={cluster.id} className="animate-fade-in">
              <h2 className="text-section font-semibold text-foreground mb-3">
                {cluster.label}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(cluster.seeds ?? []).map((seed) => (
                  <SeedCard
                    key={seed.id}
                    seed={seed}
                    triageMode={triageMode}
                    selected={selectedIds.has(seed.id)}
                    onToggleSelect={toggleSelect}
                    onKeep={(id) => triageMutation.mutate({ id, triage_status: 'kept' })}
                    onIgnore={handleIgnore}
                    onMergeClick={handleMergeOpen}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <MergeModal
        open={mergeOpen}
        onOpenChange={setMergeOpen}
        selectedIds={Array.from(selectedIds)}
        seeds={allSeeds.filter((s) => selectedIds.has(s.id))}
        onMerge={(payload) => mergeMutation.mutate(payload)}
        isMerging={mergeMutation.isPending}
      />

      <AlertDialog
        open={!!ignoreTargetId}
        onOpenChange={(open) => !open && setIgnoreTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ignore seed?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the seed from your Garden feed. You can undo from the toast.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmIgnore}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Ignore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
