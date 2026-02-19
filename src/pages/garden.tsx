import { useState } from 'react'
import { Search, Filter, Merge, Check, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const mockClusters = [
  { id: 'c1', label: 'Creator economy', seeds: [
    { id: 's1', title: 'Article on creator economy', snippet: 'Key trends…', type: 'link', tags: ['trends'], bullets: ['Trend 1', 'Trend 2'] },
    { id: 's2', title: 'Voice: monetization ideas', snippet: 'Multiple streams…', type: 'voice', tags: [], bullets: [] },
  ]},
  { id: 'c2', label: 'Content batching', seeds: [
    { id: 's3', title: 'Screenshot – calendar', snippet: 'Weekly slots…', type: 'screenshot', tags: ['workflow'], bullets: [] },
  ]},
]

export function GardenPage() {
  const [search, setSearch] = useState('')
  const [triageMode, setTriageMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [mergeOpen, setMergeOpen] = useState(false)

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title font-bold text-foreground">Garden</h1>
          <p className="text-caption text-muted-foreground">Seeds grouped by topic — triage and merge</p>
        </div>
        <Button
          variant={triageMode ? 'default' : 'outline'}
          onClick={() => setTriageMode((v) => !v)}
        >
          {triageMode ? 'Exit triage' : 'Triage mode'}
        </Button>
      </div>

      {/* Describe-to-Find + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Describe what you're looking for…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter & sort
        </Button>
      </div>

      {triageMode && selectedIds.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
          <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
          <Button size="sm" variant="secondary" onClick={() => setMergeOpen(true)}>
            <Merge className="h-4 w-4 mr-1" /> Merge
          </Button>
          <Button size="sm" variant="ghost">Keep</Button>
          <Button size="sm" variant="ghost" className="text-destructive">Ignore</Button>
        </div>
      )}

      {/* Clustered feed */}
      <div className="space-y-8">
        {mockClusters.map((cluster) => (
          <div key={cluster.id}>
            <h2 className="text-section font-semibold text-foreground mb-3">{cluster.label}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cluster.seeds.map((seed) => (
                <Card key={seed.id} hover className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-medium truncate">{seed.title}</CardTitle>
                      {triageMode && (
                        <button
                          type="button"
                          onClick={() => toggleSelect(seed.id)}
                          className={cn(
                            'rounded border p-1 transition-colors',
                            selectedIds.has(seed.id)
                              ? 'border-primary bg-primary/15 text-primary'
                              : 'border-border text-muted-foreground'
                          )}
                          aria-label={selectedIds.has(seed.id) ? 'Deselect' : 'Select'}
                        >
                          {selectedIds.has(seed.id) ? <Check className="h-4 w-4" /> : <span className="h-4 w-4 block w-4" />}
                        </button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-caption text-muted-foreground line-clamp-2">{seed.snippet}</p>
                    {seed.bullets.length > 0 && (
                      <ul className="mt-2 text-caption text-muted-foreground list-disc list-inside">
                        {seed.bullets.slice(0, 2).map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-caption text-muted-foreground">{seed.type}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">Keep</Button>
                        <Button variant="ghost" size="sm" onClick={() => setMergeOpen(true)}>Merge</Button>
                        <Button variant="ghost" size="sm" className="text-destructive">Ignore</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" aria-label="Open" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {mergeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="merge-title">
          <Card className="w-full max-w-lg border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle id="merge-title">Merge seeds</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setMergeOpen(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-caption text-muted-foreground mb-4">Preview combined seed. Edit title and tags below.</p>
              <Input placeholder="Combined title" className="mb-3" />
              <Input placeholder="Tags (comma separated)" className="mb-4" />
              <div className="text-caption text-muted-foreground mb-4">Provenance: 2 seeds</div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMergeOpen(false)}>Cancel</Button>
                <Button onClick={() => setMergeOpen(false)}>Merge</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
