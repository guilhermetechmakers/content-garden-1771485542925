import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Layout, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SeedCaptureAndStorage } from '@/components/seed-capture-and-storage'
import { listCanvases } from '@/api/canvases'

export function HomePage() {
  const { data: canvases, isLoading: canvasesLoading } = useQuery({
    queryKey: ['canvases'],
    queryFn: listCanvases,
  })

  const lastActiveCanvas = canvases?.length ? canvases[0] : null

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-title font-bold text-foreground">Quick capture</h1>
        <p className="text-caption text-muted-foreground mt-1">
          Capture seeds in under 30 seconds
        </p>
      </div>

      <SeedCaptureAndStorage
        showRecentSeeds={true}
        recentLimit={50}
        placeholder="Paste a link, type a thought, or describe what you're capturing…"
      />

      {/* CTAs: Continue Canvas & Prepare Drop */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link to={lastActiveCanvas ? `/canvases/${lastActiveCanvas.id}` : '/canvases'}>
          <Card className="h-full border-border bg-card transition-all duration-300 hover:shadow-card-hover hover:brightness-105 cursor-pointer card-hover group">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 transition-colors group-hover:bg-primary/25">
                <Layout className="h-6 w-6 text-primary" />
              </div>
              <div className="grid gap-1">
                <h3 className="font-semibold text-foreground">Continue Canvas</h3>
                {canvasesLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : lastActiveCanvas ? (
                  <p className="text-caption text-muted-foreground truncate">
                    {lastActiveCanvas.title}
                  </p>
                ) : (
                  <p className="text-caption text-muted-foreground">
                    Pick up where you left off
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/drops">
          <Card className="h-full border-border bg-card transition-all duration-300 hover:shadow-card-hover hover:brightness-105 cursor-pointer card-hover group">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/15 transition-colors group-hover:bg-accent/25">
                <Package className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Prepare Drop</h3>
                <p className="text-caption text-muted-foreground">
                  Bundle posts for the week
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Notifications / In-app Tips (ritual reminders) */}
      <Card className="border-border bg-card border-electric/20">
        <CardContent className="py-4">
          <p className="text-caption text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Triage at least one cluster in
            Garden today to keep your feed organized.
          </p>
          <Button variant="link" className="p-0 h-auto text-primary mt-1" asChild>
            <Link to="/garden">Go to Garden</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
