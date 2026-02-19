import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Linkedin, Video, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const mockDrops = [
  { id: '1', title: 'Week 8 bundle', canvasSource: 'Q1 content themes', postCount: 5, status: 'draft' as const },
  { id: '2', title: 'Launch week', canvasSource: 'Launch thread', postCount: 3, status: 'ready' as const },
]

const variantIcons = { linkedin: Linkedin, x: FileText, video: Video, carousel: LayoutGrid }

export function DropsPage() {
  const [selectedDrop, setSelectedDrop] = useState<string | null>(mockDrops[0]?.id ?? null)
  const drop = mockDrops.find((d) => d.id === selectedDrop)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title font-bold text-foreground">Drops</h1>
          <p className="text-caption text-muted-foreground">3–10 post bundles from a canvas</p>
        </div>
        <Button asChild>
          <Link to="/canvases">
            <Plus className="h-4 w-4 mr-2" />
            New Drop from Canvas
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Drop list */}
        <div className="space-y-2">
          <h2 className="text-section font-semibold text-foreground">Your drops</h2>
          {mockDrops.map((d) => (
            <Card
              key={d.id}
              hover
              className={cn(
                'cursor-pointer border-border bg-card',
                selectedDrop === d.id && 'ring-1 ring-primary'
              )}
              onClick={() => setSelectedDrop(d.id)}
            >
              <CardContent className="py-4">
                <p className="font-medium text-sm">{d.title}</p>
                <p className="text-caption text-muted-foreground">{d.canvasSource} · {d.postCount} posts</p>
                <span className={cn(
                  'text-caption',
                  d.status === 'ready' ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {d.status}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Drop editor */}
        <div className="lg:col-span-2 space-y-4">
          {drop ? (
            <>
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{drop.title}</CardTitle>
                  <p className="text-caption text-muted-foreground">Hook → Value → Example → CTA</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-lg border border-border bg-input/30 p-4 space-y-2">
                      <Input placeholder="Hook" className="text-sm" />
                      <Input placeholder="Value" className="text-sm" />
                      <Input placeholder="Example" className="text-sm" />
                      <Input placeholder="CTA" className="text-sm" />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <div className="flex flex-wrap gap-2">
                <span className="text-caption text-muted-foreground mr-2">Variants:</span>
                {Object.entries(variantIcons).map(([name, Icon]) => (
                  <Button key={name} variant="outline" size="sm">
                    <Icon className="h-4 w-4 mr-1" />
                    {name}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">Auto-suggest mix</Button>
                <Button variant="secondary">AI re-run</Button>
                <Button>Export to Runway</Button>
                <Button variant="outline">CSV / JSON</Button>
              </div>
            </>
          ) : (
            <Card className="border-border bg-card border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">Select a drop or create one from a canvas.</p>
                <Button asChild className="mt-4">
                  <Link to="/canvases">Open Canvas</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
