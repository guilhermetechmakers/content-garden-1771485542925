import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  Merge,
  Check,
  ExternalLink,
  Leaf,
  Link2,
  Mic,
  Image,
  FileText,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  listSeeds,
  mergeSeeds,
  updateSeedTriage,
  bulkTriage,
  type Seed,
  type SeedType,
  type TriageStatus,
} from '@/api/seeds'
import { trackCuration } from '@/lib/analytics'

const SEED_TYPE_LABELS: Record<SeedType, string> = {
  link: 'Link',
  note: 'Note',
  voice: 'Voice',
  screenshot: 'Screenshot',
  image: 'Image',
  audio: 'Audio',
  video: 'Video',
}

const SEED_TYPE_ICONS: Record<SeedType, React.ComponentType<{ className?: string }>> = {
  link: Link2,
  note: FileText,
  voice: Mic,
  screenshot: Image,
  image: Image,
  audio: Mic,
  video: Image,
}

function formatCaptureTime(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  } catch {
    return ''
  }
}

interface SeedCardProps {
  seed: Seed
  triageMode: boolean
  selected: boolean
  onToggleSelect: (id: string) => void
  onKeep: (id: string) => void
  onIgnore: (id: string) => void
  onMergeClick: (id: string) => void
}

function SeedCard({
  seed,
  triageMode,
  selected,
  onToggleSelect,
  onKeep,
  onIgnore,
  onMergeClick,
}: SeedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const snippet =
    seed.content?.slice(0, 120)?.trim() ||
    seed.extracted_bullets?.[0] ||
    (seed.source_url ? 'Link captured' : '—')
  const TypeIcon = SEED_TYPE_ICONS[seed.type] ?? FileText

  useEffect(() => {
    if (!triageMode || !cardRef.current) return
    const el = cardRef.current
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target !== el && !el.contains(e.target as Node)) return
      const key = e.key.toLowerCase()
      if (key === 'k') {
        e.preventDefault()
        onKeep(seed.id)
      } else if (key === 'i') {
        e.preventDefault()
        onIgnore(seed.id)
      } else if (key === 'm') {
        e.preventDefault()
        onMergeClick(seed.id)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [triageMode, seed.id, onKeep, onIgnore, onMergeClick])

  return (
    <Card
      ref={cardRef}
      className={cn(
        'border-border bg-card transition-all duration-200 hover:shadow-card-hover',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
      tabIndex={triageMode ? 0 : undefined}
      role={triageMode ? 'article' : undefined}
      aria-label={seed.title}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium line-clamp-2 pr-8">{seed.title}</CardTitle>
          {triageMode && (
            <button
              type="button"
              onClick={() => onToggleSelect(seed.id)}
              className={cn(
                'shrink-0 rounded-lg border p-1.5 transition-colors duration-200 hover:border-primary/50',
                selected
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground'
              )}
              aria-label={selected ? 'Deselect' : 'Select'}
            >
              {selected ? <Check className="h-4 w-4" /> : <span className="block h-4 w-4" />}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-caption text-muted-foreground line-clamp-2">{snippet}</p>
        {seed.extracted_bullets && seed.extracted_bullets.length > 0 && (
          <ul className="text-caption text-muted-foreground list-disc list-inside space-y-0.5">
            {seed.extracted_bullets.slice(0, 3).map((b, i) => (
              <li key={i} className="line-clamp-1">
                {b}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-1.5">
          {seed.tags?.slice(0, 4).map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-caption text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
          <span className="flex items-center gap-1.5 text-caption text-muted-foreground">
            <TypeIcon className="h-3.5 w-3.5" />
            {SEED_TYPE_LABELS[seed.type]}
          </span>
          <span className="flex items-center gap-1 text-caption text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatCaptureTime(seed.created_at)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          <Button variant="ghost" size="sm" onClick={() => onKeep(seed.id)}>
            Keep
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onMergeClick(seed.id)}>
            Merge
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onIgnore(seed.id)}
          >
            Ignore
          </Button>
          <Link to={`/canvases?seed=${seed.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Open in Canvas">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function GardenSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((i) => (
        <div key={i}>
          <Skeleton className="h-6 w-40 mb-3 rounded" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((j) => (
              <Card key={j} className="border-border bg-card">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-4/5 rounded" />
                  <Skeleton className="h-6 w-24 rounded mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
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

  const listParams = {
    limit: 100,
    clustered: true,
    ...(filterType && { type: filterType as SeedType }),
    ...(filterTag && { tag: filterTag }),
    ...(filterDateFrom && { dateFrom: filterDateFrom }),
    ...(filterDateTo && { dateTo: filterDateTo }),
  }

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
  const allSeeds = clusters.flatMap((c) => c.seeds ?? [])
  const filteredBySearch =
    search.trim() === ''
      ? clusters
      : clusters
          .map((c) => ({
            ...c,
            seeds: (c.seeds ?? []).filter(
              (s) =>
                s.title.toLowerCase().includes(search.toLowerCase()) ||
                s.content?.toLowerCase().includes(search.toLowerCase()) ||
                s.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
            ),
          }))
          .filter((c) => (c.seeds?.length ?? 0) > 0)

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
    triageMutation.mutate(
      { id, triage_status: 'ignored' },
      {
        onSuccess: () => {
          toast.success('Seed ignored', {
            action: {
              label: 'Undo',
              onClick: () => {
                updateSeedTriage(id, null).then(() => {
              queryClient.invalidateQueries({ queryKey: ['seeds'] })
              toast.success('Undone')
            })
              },
            },
          })
        },
      }
    )
  }, [ignoreTargetId, triageMutation, queryClient])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title font-bold text-foreground">Garden</h1>
          <p className="text-caption text-muted-foreground">
            Seeds grouped by topic — triage and merge
          </p>
        </div>
        <Button
          variant={triageMode ? 'default' : 'outline'}
          onClick={() => setTriageMode((v) => !v)}
          className="transition-all duration-200 hover:scale-[1.02]"
        >
          {triageMode ? 'Exit triage' : 'Triage mode'}
        </Button>
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
        <Button
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          className="shrink-0"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter & sort
        </Button>
      </div>

      {showFilters && (
        <Card className="border-border bg-card p-4 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-caption text-muted-foreground block mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                onChange={(e) => setFilterTag(e.target.value)}
              />
            </div>
            <div>
              <label className="text-caption text-muted-foreground block mb-1">From date</label>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-caption text-muted-foreground block mb-1">To date</label>
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
          </div>
        </Card>
      )}

      {triageMode && selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 animate-fade-in">
          <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setMergeOpen(true)}
            className="transition-all duration-200 hover:scale-[1.02]"
          >
            <Merge className="h-4 w-4 mr-1" /> Merge
          </Button>
          <Button size="sm" variant="ghost" onClick={handleBulkKeep}>
            Keep
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={handleBulkIgnore}
          >
            Ignore
          </Button>
        </div>
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
        <Card className="border-border bg-card">
          <CardContent className="py-16 text-center">
            <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-section font-semibold text-foreground mb-2">No seeds yet</h3>
            <p className="text-caption text-muted-foreground max-w-sm mx-auto mb-4">
              Capture links, voice notes, and quick thoughts from Home. They will appear here for
              triage and merging.
            </p>
            <Link to="/">
              <Button className="transition-all duration-200 hover:scale-[1.02]">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && filteredBySearch.length > 0 && (
        <div className="space-y-8">
          {filteredBySearch.map((cluster) => (
            <div key={cluster.id} className="animate-fade-in">
              <h2 className="text-section font-semibold text-foreground mb-3">{cluster.label}</h2>
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

      <AlertDialog open={!!ignoreTargetId} onOpenChange={(open) => !open && setIgnoreTargetId(null)}>
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

interface MergeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: string[]
  seeds: Seed[]
  onMerge: (payload: {
    seed_ids: string[]
    title?: string
    tags?: string[]
    content?: string
    extracted_bullets?: string[]
  }) => void
  isMerging: boolean
}

function MergeModal({
  open,
  onOpenChange,
  selectedIds,
  seeds,
  onMerge,
  isMerging,
}: MergeModalProps) {
  const [title, setTitle] = useState('')
  const [tagsStr, setTagsStr] = useState('')
  const [content, setContent] = useState('')
  const [bulletsStr, setBulletsStr] = useState('')

  const defaultTitle = seeds.length > 0 ? seeds.map((s) => s.title).join(' / ').slice(0, 500) : ''
  const defaultTags = Array.from(new Set(seeds.flatMap((s) => s.tags ?? []))).join(', ')
  const defaultContent =
    seeds.length > 0 ? seeds.map((s) => `## ${s.title}\n${s.content}`).join('\n\n') : ''
  const defaultBullets =
    seeds.length > 0 ? seeds.flatMap((s) => s.extracted_bullets ?? []).join('\n') : ''

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setTitle(defaultTitle)
      setTagsStr(defaultTags)
      setContent(defaultContent)
      setBulletsStr(defaultBullets)
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = () => {
    if (selectedIds.length < 2) return
    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const extracted_bullets = bulletsStr
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean)
    onMerge({
      seed_ids: selectedIds,
      title: title.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      content: content.trim() || undefined,
      extracted_bullets: extracted_bullets.length > 0 ? extracted_bullets : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent showClose={true} className="max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Merge seeds</DialogTitle>
          <DialogDescription>
            Edit combined title, tags, content, and bullets. Original seeds are listed as provenance.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 overflow-y-auto">
          {selectedIds.length < 2 && (
            <p className="text-caption text-primary">
              Select at least 2 seeds to merge (use Triage mode).
            </p>
          )}
          <p className="text-caption text-muted-foreground">
            Provenance: {seeds.length} seed{seeds.length !== 1 ? 's' : ''} —{' '}
            {seeds.map((s) => s.title).join('; ')}
          </p>
          <div>
            <label htmlFor="merge-title" className="text-caption text-foreground block mb-1">
              Combined title
            </label>
            <Input
              id="merge-title"
              placeholder="Combined title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="merge-tags" className="text-caption text-foreground block mb-1">
              Tags (comma separated)
            </label>
            <Input
              id="merge-tags"
              placeholder="Tags"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="merge-content" className="text-caption text-foreground block mb-1">
              Content
            </label>
            <textarea
              id="merge-content"
              rows={4}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric/50"
              placeholder="Combined content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="merge-bullets" className="text-caption text-foreground block mb-1">
              Extracted bullets (one per line)
            </label>
            <textarea
              id="merge-bullets"
              rows={3}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric/50"
              placeholder="One bullet per line"
              value={bulletsStr}
              onChange={(e) => setBulletsStr(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isMerging || selectedIds.length < 2}
          >
            {isMerging ? 'Merging…' : 'Merge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
