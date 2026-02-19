import { useParams, Link } from 'react-router-dom'
import { Sparkles, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

const mockSeeds = [
  { id: '1', title: 'Article on creator economy', type: 'seed' },
  { id: '2', title: 'Voice: monetization ideas', type: 'seed' },
]
const aiActions = [
  'Draft 5 angles',
  'Generate hooks',
  'Turn selection into thread',
  'Summarize selected Seeds',
]

export function CanvasWorkspacePage() {
  const { canvasId } = useParams()

  return (
    <div className="flex h-[calc(100vh-3.5rem-3rem)] -m-6 animate-fade-in">
      {/* Left: Seeds panel */}
      <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border">
          <Input placeholder="Search seeds…" className="h-9" />
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {mockSeeds.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-border bg-input/50 px-3 py-2 text-sm cursor-grab hover:border-electric/50"
              >
                {s.title}
              </div>
            ))}
          </div>
          <div className="p-2">
            <p className="text-caption text-muted-foreground mb-2">Propose related</p>
            <Button variant="ghost" size="sm" className="w-full justify-start">+ Suggest from Garden</Button>
          </div>
        </ScrollArea>
      </aside>

      {/* Center: Canvas */}
      <main className="flex-1 overflow-hidden bg-background relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(54,54,60,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(54,54,60,0.3)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Button variant="secondary" size="sm">Zoom in</Button>
          <Button variant="secondary" size="sm">Zoom out</Button>
          <Button variant="secondary" size="sm">Fit</Button>
        </div>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-caption text-muted-foreground">
          Canvas: {canvasId ?? 'new'} · Autosaved
        </div>
        <div className="flex items-center justify-center h-full">
          <div className="rounded-card-lg border border-border bg-card p-8 max-w-md text-center">
            <p className="text-muted-foreground">Drop seeds here or add text blocks.</p>
            <p className="text-caption text-muted-foreground mt-1">Select nodes and use AI panel for actions.</p>
          </div>
        </div>
      </main>

      {/* Right: AI panel */}
      <aside className="w-72 shrink-0 border-l border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">AI</span>
        </div>
        <div className="p-3 space-y-2">
          <p className="text-caption text-muted-foreground">Tone & length</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Professional</Button>
            <Button variant="outline" size="sm">Casual</Button>
          </div>
          <p className="text-caption text-muted-foreground mt-3">Actions</p>
          {aiActions.map((action) => (
            <Button key={action} variant="secondary" className="w-full justify-start" size="sm">
              {action}
            </Button>
          ))}
        </div>
        <div className="mt-auto p-3 border-t border-border">
          <Button asChild className="w-full">
            <Link to="/drops">
              <Download className="h-4 w-4 mr-2" />
              Publish / Export to Drop
            </Link>
          </Button>
        </div>
      </aside>
    </div>
  )
}
