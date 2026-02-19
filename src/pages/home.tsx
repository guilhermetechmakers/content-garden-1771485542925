import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Link2, Mic, Image, MessageSquare, Layout, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const quickActions = [
  { icon: Link2, label: 'Paste link', color: 'text-electric' },
  { icon: Mic, label: 'Voice note', color: 'text-purple' },
  { icon: Image, label: 'Screenshot', color: 'text-orange' },
  { icon: MessageSquare, label: 'Quick thought', color: 'text-yellow' },
] as const

const mockSeeds = [
  { id: '1', title: 'Article on creator economy', type: 'link', snippet: 'Key trends in 2025…', tags: ['trends'] },
  { id: '2', title: 'Voice: idea for thread', type: 'voice', snippet: 'How to batch content…', tags: ['tips'] },
  { id: '3', title: 'Screenshot – analytics', type: 'screenshot', snippet: 'Engagement spike…', tags: [] },
]

export function HomePage() {
  const [captureValue, setCaptureValue] = useState('')

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-title font-bold text-foreground">Quick capture</h1>
        <p className="text-caption text-muted-foreground mt-1">Capture seeds in under 30 seconds</p>
      </div>

      {/* Quick Capture Bar */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Input
                placeholder="Paste a link, type a thought, or describe what you're capturing…"
                value={captureValue}
                onChange={(e) => setCaptureValue(e.target.value)}
                className="pr-24"
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
                {quickActions.map(({ icon: Icon, label }) => (
                  <Button
                    key={label}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
            <Button className="shrink-0">Capture</Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Buttons */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {quickActions.map(({ icon: Icon, label, color }) => (
          <Button
            key={label}
            variant="secondary"
            className={cn('h-auto flex-col gap-2 py-4', color)}
            asChild
          >
            <button type="button">
              <Icon className="h-6 w-6" />
              <span>{label}</span>
            </button>
          </Button>
        ))}
      </div>

      {/* Recent Seeds Carousel */}
      <div>
        <h2 className="text-section font-semibold text-foreground mb-3">Recent seeds</h2>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-2">
            {mockSeeds.map((seed) => (
              <Card key={seed.id} hover className="min-w-[280px] max-w-[280px] shrink-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium truncate">{seed.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-caption text-muted-foreground line-clamp-2">{seed.snippet}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-caption text-muted-foreground">{seed.type}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">Keep</Button>
                      <Button variant="ghost" size="sm">Open</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* CTAs */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/canvases">
          <Card hover className="h-full border-border bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15">
                <Layout className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Continue Canvas</h3>
                <p className="text-caption text-muted-foreground">Pick up where you left off</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/drops">
          <Card hover className="h-full border-border bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/15">
                <Package className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Prepare Drop</h3>
                <p className="text-caption text-muted-foreground">Bundle posts for the week</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Ritual tip */}
      <Card className="border-border bg-card border-electric/20">
        <CardContent className="py-4">
          <p className="text-caption text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Triage at least one cluster in Garden today to keep your feed organized.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
