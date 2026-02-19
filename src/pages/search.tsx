import { Search as SearchIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const examplePrompts = [
  'Seeds about content batching',
  'Canvas where I mentioned launch',
  'Drops from last week',
]

export function SearchPage() {
  const [query, setQuery] = useState('')

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-title font-bold text-foreground">Describe-to-Find</h1>
        <p className="text-caption text-muted-foreground">Natural-language search across Seeds, Canvases, Drops</p>
      </div>

      <div className="relative max-w-2xl">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Describe what you're looking for…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 h-12 text-base"
        />
      </div>

      <div>
        <p className="text-caption text-muted-foreground mb-2">Example prompts</p>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              onClick={() => setQuery(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      {query && (
        <div className="space-y-4">
          <h2 className="text-section font-semibold text-foreground">Results</h2>
          <div className="grid gap-3">
            <Card className="border-border bg-card">
              <CardContent className="py-4">
                <p className="text-sm font-medium">Exact matches</p>
                <p className="text-caption text-muted-foreground mt-1">No results yet. Try a different query or check Garden.</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="py-4">
                <p className="text-sm font-medium">Contextual snippets</p>
                <p className="text-caption text-muted-foreground mt-1">Semantic search will show related snippets here.</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="py-4">
                <p className="text-sm font-medium">Related Drops</p>
                <p className="text-caption text-muted-foreground mt-1">Drops that reference your query.</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Refine</Button>
            <Button variant="ghost" size="sm">Open in context</Button>
          </div>
        </div>
      )}
    </div>
  )
}
