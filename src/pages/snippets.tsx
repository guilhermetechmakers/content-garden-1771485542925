import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const mockSnippets = [
  { id: '1', title: 'CTA – Book a call', content: 'Ready to level up? Book a call →', tags: ['cta'], usage_count: 12 },
  { id: '2', title: 'Hook – Question', content: 'What if you could…?', tags: ['hook'], usage_count: 8 },
]

export function SnippetsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title font-bold text-foreground">Snippets</h1>
          <p className="text-caption text-muted-foreground">Reusable hooks, CTAs, prompts</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create snippet
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search snippets…" className="pl-9" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockSnippets.map((s) => (
          <Card key={s.id} hover className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
              <p className="text-caption text-muted-foreground">Used {s.usage_count} times</p>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-foreground/90">&ldquo;{s.content}&rdquo;</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {s.tags.map((t) => (
                  <span key={t} className="rounded bg-input px-2 py-0.5 text-caption text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" size="sm">Insert into Canvas</Button>
                <Button variant="ghost" size="sm">Insert into Drop</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardContent className="py-6">
          <h3 className="text-section font-semibold text-foreground mb-2">Analytics</h3>
          <p className="text-caption text-muted-foreground">Usage frequency and effectiveness per snippet.</p>
          <Button variant="outline" size="sm" className="mt-3">View analytics</Button>
        </CardContent>
      </Card>
    </div>
  )
}
